import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { wgs84ToGcj02, adaptCoordinates } from '../js/lib/coords.js';

describe('coords adapt', () => {
  it('leaves coords unchanged for wgs84 crs', () => {
    const c = [34.27, 108.94];
    assert.deepEqual(adaptCoordinates(c, 'wgs84'), c);
  });

  it('shifts coords inside China for gcj02', () => {
    const [lat, lng] = wgs84ToGcj02(34.27, 108.94);
    // GCJ-02 offset is non-zero in China
    assert.ok(Math.abs(lat - 34.27) > 0.0001 || Math.abs(lng - 108.94) > 0.0001);
    assert.ok(lat > 34 && lat < 35);
    assert.ok(lng > 108 && lng < 110);
  });

  it('adaptCoordinates uses gcj02 path', () => {
    const a = adaptCoordinates([34.27, 108.94], 'gcj02');
    const b = wgs84ToGcj02(34.27, 108.94);
    assert.deepEqual(a, b);
  });
});
