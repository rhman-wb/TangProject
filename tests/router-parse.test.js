import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseRouteQuery, buildRouteQuery } from '../js/lib/router-parse.js';

describe('router parse', () => {
  it('parses poem place poet', () => {
    const r = parseRouteQuery('?poem=changhenge&place=mawei&poet=baijuyi');
    assert.deepEqual(r, {
      poem: 'changhenge',
      place: 'mawei',
      poet: 'baijuyi',
    });
  });

  it('handles empty', () => {
    assert.deepEqual(parseRouteQuery(''), {
      poem: null,
      place: null,
      poet: null,
    });
  });

  it('builds query string', () => {
    assert.equal(buildRouteQuery({ poem: 'a' }), '?poem=a');
    assert.equal(buildRouteQuery({}), '');
  });

  it('round-trips', () => {
    const q = buildRouteQuery({ poem: 'x', place: 'y' });
    assert.deepEqual(parseRouteQuery(q), {
      poem: 'x',
      place: 'y',
      poet: null,
    });
  });
});
