import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatYearLabel } from '../js/lib/year-label.js';

describe('formatYearLabel', () => {
  it('exact', () => assert.equal(formatYearLabel(757, 'exact'), '757年'));
  it('approximate', () =>
    assert.equal(formatYearLabel(750, 'approximate'), '约750年'));
  it('inferred', () =>
    assert.equal(formatYearLabel(740, 'inferred'), '活动年代约740年'));
  it('missing', () => assert.equal(formatYearLabel(null), '年代不详'));
});
