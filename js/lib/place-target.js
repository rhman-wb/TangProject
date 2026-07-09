/**
 * 多地点诗的飞行目标：首个 scope=core 地点，无则取首项（ADR-0004 / T3）
 */

/**
 * @param {{ placeId: string, relation?: string }[]} placeRefs
 * @param {Map<string, { id: string, scope: string }>} placeById
 * @returns {string|null} placeId
 */
export function selectTargetPlaceId(placeRefs, placeById) {
  if (!placeRefs || placeRefs.length === 0) return null;
  for (const ref of placeRefs) {
    const place = placeById.get(ref.placeId);
    if (place && place.scope === 'core') return ref.placeId;
  }
  return placeRefs[0].placeId;
}

/**
 * 获取诗关联的全部 placeId（保持顺序去重）
 * @param {{ placeId: string }[]} placeRefs
 * @returns {string[]}
 */
export function allPlaceIds(placeRefs) {
  if (!placeRefs) return [];
  const seen = new Set();
  const out = [];
  for (const ref of placeRefs) {
    if (!seen.has(ref.placeId)) {
      seen.add(ref.placeId);
      out.push(ref.placeId);
    }
  }
  return out;
}

export default { selectTargetPlaceId, allPlaceIds };
