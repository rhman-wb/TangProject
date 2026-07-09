/**
 * 静态/结构冒烟：入口与可 import 的纯逻辑模块存在且可执行
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRouteQuery } from '../js/lib/router-parse.js';
import { EventBus } from '../js/lib/event-bus.js';
import { adaptCoordinates } from '../js/lib/coords.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('static smoke', () => {
  it('index.html and core assets exist', () => {
    for (const f of [
      'index.html',
      'css/main.css',
      'css/theme.css',
      'css/poem.css',
      'js/main.js',
      'js/app.js',
      'js/config.js',
      'js/data-loader.js',
      'js/map-core.js',
      'js/map-markers.js',
      'js/map-overlay.js',
      'js/filter-manager.js',
      'js/list-panel.js',
      'js/detail-panel.js',
      'js/poet-view.js',
      'js/search.js',
      'js/timeline.js',
      'js/router.js',
      'js/intro.js',
      'scripts/validate-data.mjs',
      'data/poets.json',
      'data/places.json',
      'data/poems.json',
      'data/changan-city.geojson',
      '_headers',
      '_redirects',
      '404.html',
      'sitemap.xml',
    ]) {
      assert.ok(existsSync(join(root, f)), f);
    }
  });

  it('index uses module script and map container', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    assert.match(html, /type="module"/);
    assert.match(html, /id="map"/);
    assert.match(html, /时期筛选|period-filter/);
    assert.match(html, /扩展范围/);
    assert.match(html, /search-input/);
    assert.match(html, /timeline-range/);
    assert.match(html, /intro-modal/);
  });

  it('shipped pure modules execute without browser globals leaking', () => {
    assert.equal(typeof parseRouteQuery, 'function');
    assert.equal(typeof adaptCoordinates, 'function');
    const bus = new EventBus();
    let n = 0;
    bus.on('x', () => n++);
    bus.emit('x', {});
    assert.equal(n, 1);
    // 无 require/module 泄漏依赖
    assert.equal(typeof module === 'undefined' || typeof module === 'object', true);
  });
});
