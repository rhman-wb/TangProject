/**
 * 筛选交集：时期 ∩ 诗人 ∩ 时间轴 ∩ 地点 scope
 * 纯函数，供 filter-manager 与单元测试共用。
 */

/**
 * @typedef {object} FilterState
 * @property {string[]|null} periods  选中时期；null 或空表示全部
 * @property {string[]|null} poetIds  选中诗人 id；null 表示全部
 * @property {number|null} year       时间轴游标年；null 表示不启用
 * @property {boolean} showExtended  是否显示 extended 地点
 */

/**
 * 判断一首诗是否通过当前筛选（不包含地点 scope——地点层另判）
 * @param {object} poem
 * @param {FilterState} filter
 */
export function poemMatchesFilter(poem, filter) {
  const periods = filter.periods;
  if (periods && periods.length > 0 && !periods.includes(poem.period)) {
    return false;
  }
  const poetIds = filter.poetIds;
  if (poetIds && poetIds.length > 0 && !poetIds.includes(poem.poetId)) {
    return false;
  }
  if (filter.year != null && poem.year != null) {
    // 时间轴：显示创作年 ≤ 游标年 的诗（沿时间轴展开）
    if (poem.year > filter.year) return false;
  }
  return true;
}

/**
 * 判断地点是否在当前 scope 策略下可见
 * @param {object} place
 * @param {boolean} showExtended
 */
export function placeMatchesScope(place, showExtended) {
  if (place.scope === 'extended') return !!showExtended;
  return true;
}

/**
 * 地点是否应显示：至少有一首关联诗通过筛选，且 scope 允许
 * @param {object} place
 * @param {object[]} poemsAtPlace
 * @param {FilterState} filter
 */
export function placeVisible(place, poemsAtPlace, filter) {
  if (!placeMatchesScope(place, filter.showExtended)) return false;
  return poemsAtPlace.some((p) => poemMatchesFilter(p, filter));
}

/**
 * 过滤诗词列表
 * @param {object[]} poems
 * @param {FilterState} filter
 * @param {Map<string, object>} [placeById] 若提供，则按 showExtended 过滤仅关联可见地点的诗
 */
export function filterPoems(poems, filter, placeById) {
  return poems.filter((poem) => {
    if (!poemMatchesFilter(poem, filter)) return false;
    if (!placeById) return true;
    // 至少有一个关联地点在 scope 内可见
    const places = poem.places || [];
    if (places.length === 0) return true;
    return places.some((ref) => {
      const pl = placeById.get(ref.placeId);
      return pl && placeMatchesScope(pl, filter.showExtended);
    });
  });
}

/**
 * 合并默认筛选状态
 * @param {Partial<FilterState>} partial
 * @returns {FilterState}
 */
export function createFilterState(partial = {}) {
  return {
    periods: partial.periods ?? null,
    poetIds: partial.poetIds ?? null,
    year: partial.year ?? null,
    showExtended: partial.showExtended ?? false,
  };
}

export default {
  poemMatchesFilter,
  placeMatchesScope,
  placeVisible,
  filterPoems,
  createFilterState,
};
