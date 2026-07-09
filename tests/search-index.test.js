import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSearchIndex,
  searchIndex,
  flattenSearchResults,
} from '../js/lib/search-index.js';

describe('search index', () => {
  const data = {
    poets: [{ id: 'wangwei', name: '王维', courtesyName: '摩诘', bio: '诗佛' }],
    places: [
      {
        id: 'weicheng',
        name: '渭城',
        ancientName: '咸阳',
        modernName: '咸阳',
        description: '送别',
      },
    ],
    poems: [
      {
        id: 'songyuanershi-anxi',
        title: '送元二使安西',
        poetId: 'wangwei',
        content: ['渭城朝雨浥轻尘，', '西出阳关无故人。'],
        highlight: ['劝君更尽一杯酒，西出阳关无故人。'],
      },
    ],
  };
  const poetById = new Map([['wangwei', data.poets[0]]]);
  const index = buildSearchIndex(data, poetById);

  it('builds records for all types', () => {
    assert.equal(index.filter((r) => r.type === 'poet').length, 1);
    assert.equal(index.filter((r) => r.type === 'place').length, 1);
    assert.equal(index.filter((r) => r.type === 'poem').length, 1);
  });

  it('matches poem title', () => {
    const g = searchIndex(index, '送元二');
    assert.equal(g.poems.length, 1);
    assert.equal(g.poems[0].id, 'songyuanershi-anxi');
  });

  it('matches line content', () => {
    const g = searchIndex(index, '阳关');
    assert.ok(g.poems.length >= 1);
  });

  it('matches poet name', () => {
    const g = searchIndex(index, '王维');
    assert.equal(g.poets[0].id, 'wangwei');
  });

  it('matches place', () => {
    const g = searchIndex(index, '渭城');
    assert.equal(g.places[0].id, 'weicheng');
  });

  it('flatten adds categories', () => {
    const flat = flattenSearchResults(searchIndex(index, '王'));
    assert.ok(flat.some((r) => r.category === '诗人' || r.category === '诗词'));
  });
});
