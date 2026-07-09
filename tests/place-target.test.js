import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { selectTargetPlaceId, allPlaceIds } from '../js/lib/place-target.js';

describe('selectTargetPlaceId', () => {
  const placeById = new Map([
    ['yangguan', { id: 'yangguan', scope: 'extended' }],
    ['weicheng', { id: 'weicheng', scope: 'core' }],
    ['mawei', { id: 'mawei', scope: 'extended' }],
  ]);

  it('picks first core place for 送元二-style multi-place', () => {
    const refs = [
      { placeId: 'yangguan', relation: 'related' },
      { placeId: 'weicheng', relation: 'described' },
    ];
    // weicheng is core but second — should still pick first core in list order
    // Actually first core in array order: weicheng is second, so first core found is weicheng
    assert.equal(selectTargetPlaceId(refs, placeById), 'weicheng');
  });

  it('picks first core when core is first', () => {
    const refs = [
      { placeId: 'weicheng', relation: 'described' },
      { placeId: 'yangguan', relation: 'related' },
    ];
    assert.equal(selectTargetPlaceId(refs, placeById), 'weicheng');
  });

  it('falls back to first when no core', () => {
    const refs = [
      { placeId: 'yangguan', relation: 'related' },
      { placeId: 'mawei', relation: 'described' },
    ];
    assert.equal(selectTargetPlaceId(refs, placeById), 'yangguan');
  });

  it('returns null for empty', () => {
    assert.equal(selectTargetPlaceId([], placeById), null);
  });

  it('allPlaceIds dedupes', () => {
    assert.deepEqual(
      allPlaceIds([
        { placeId: 'a' },
        { placeId: 'b' },
        { placeId: 'a' },
      ]),
      ['a', 'b']
    );
  });
});
