import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  poemMatchesFilter,
  placeMatchesScope,
  filterPoems,
  createFilterState,
} from '../js/lib/filters.js';

describe('filter intersection', () => {
  const poems = [
    { id: 'a', period: 'high', poetId: 'libai', year: 743 },
    { id: 'b', period: 'middle', poetId: 'baijuyi', year: 806 },
    { id: 'c', period: 'high', poetId: 'dufu', year: 757 },
  ];

  it('matches all when filter open', () => {
    const f = createFilterState();
    assert.equal(poems.every((p) => poemMatchesFilter(p, f)), true);
  });

  it('filters by period', () => {
    const f = createFilterState({ periods: ['high'] });
    const out = filterPoems(poems, f);
    assert.deepEqual(
      out.map((p) => p.id).sort(),
      ['a', 'c']
    );
  });

  it('filters by poetIds', () => {
    const f = createFilterState({ poetIds: ['baijuyi'] });
    assert.equal(filterPoems(poems, f).length, 1);
    assert.equal(filterPoems(poems, f)[0].id, 'b');
  });

  it('intersects period ∩ poet ∩ timeline', () => {
    const f = createFilterState({
      periods: ['high'],
      poetIds: ['libai', 'dufu'],
      year: 750,
    });
    const out = filterPoems(poems, f);
    assert.deepEqual(out.map((p) => p.id), ['a']);
  });

  it('scope core/extended', () => {
    assert.equal(placeMatchesScope({ scope: 'core' }, false), true);
    assert.equal(placeMatchesScope({ scope: 'extended' }, false), false);
    assert.equal(placeMatchesScope({ scope: 'extended' }, true), true);
  });

  it('filterPoems respects place scope when placeById given', () => {
    const placeById = new Map([
      ['weicheng', { id: 'weicheng', scope: 'core' }],
      ['yangguan', { id: 'yangguan', scope: 'extended' }],
    ]);
    const multi = [
      {
        id: 'p1',
        period: 'high',
        poetId: 'wangwei',
        year: 750,
        places: [{ placeId: 'yangguan', relation: 'related' }],
      },
      {
        id: 'p2',
        period: 'high',
        poetId: 'wangwei',
        year: 750,
        places: [{ placeId: 'weicheng', relation: 'described' }],
      },
    ];
    const coreOnly = filterPoems(
      multi,
      createFilterState({ showExtended: false }),
      placeById
    );
    assert.deepEqual(coreOnly.map((p) => p.id), ['p2']);
    const withExt = filterPoems(
      multi,
      createFilterState({ showExtended: true }),
      placeById
    );
    assert.equal(withExt.length, 2);
  });
});
