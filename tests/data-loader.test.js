/**
 * 验证 data-loader 分阶段按需加载（非三文件 Promise.all 并行）
 * 驱动真实 shipped 模块 loadAppData / loadPlaces / loadPoems。
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadAppData,
  loadPlaces,
  loadPoets,
  loadPoems,
  buildAppDataIndexes,
} from '../js/data-loader.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('data-loader on-demand', () => {
  const order = [];
  const realFetch = globalThis.fetch;

  before(() => {
    globalThis.fetch = async (url) => {
      const path = String(url).replace(/^\//, '');
      order.push(path);
      const body = readFileSync(join(root, path), 'utf8');
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(body),
      };
    };
  });

  after(() => {
    globalThis.fetch = realFetch;
  });

  it('loadPlaces / loadPoets / loadPoems are separate entry points', async () => {
    order.length = 0;
    const places = await loadPlaces({
      places: 'data/places.json',
      poets: 'data/poets.json',
      poems: 'data/poems.json',
    });
    assert.ok(places.length >= 30);
    assert.deepEqual(order, ['data/places.json']);

    order.length = 0;
    const poets = await loadPoets({
      places: 'data/places.json',
      poets: 'data/poets.json',
      poems: 'data/poems.json',
    });
    assert.ok(poets.length >= 25);
    assert.deepEqual(order, ['data/poets.json']);

    order.length = 0;
    const poems = await loadPoems({
      places: 'data/places.json',
      poets: 'data/poets.json',
      poems: 'data/poems.json',
    });
    assert.ok(poems.length >= 60);
    assert.deepEqual(order, ['data/poems.json']);
  });

  it('loadAppData fetches entities sequentially (places→poets→poems)', async () => {
    order.length = 0;
    const phases = [];
    const data = await loadAppData(
      {
        places: 'data/places.json',
        poets: 'data/poets.json',
        poems: 'data/poems.json',
      },
      {
        onPhase: (name) => phases.push(name),
      }
    );
    assert.deepEqual(order, [
      'data/places.json',
      'data/poets.json',
      'data/poems.json',
    ]);
    assert.deepEqual(phases, ['places', 'poets', 'poems']);
    assert.ok(data.poemById.size >= 60);
    assert.ok(data.placeById.size >= 30);
    // 索引由真实 buildAppDataIndexes 路径构建
    const rebuilt = buildAppDataIndexes(data.poets, data.places, data.poems);
    assert.equal(rebuilt.poems.length, data.poems.length);
  });
});
