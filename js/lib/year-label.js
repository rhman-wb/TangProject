/**
 * 按 yearPrecision 诚实标注年代
 */

const PRECISION_SUFFIX = {
  exact: '',
  approximate: '约',
  inferred: '活动年代约',
};

/**
 * @param {number|null|undefined} year
 * @param {'exact'|'approximate'|'inferred'|string} [precision='approximate']
 * @returns {string}
 */
export function formatYearLabel(year, precision = 'approximate') {
  if (year == null || Number.isNaN(year)) return '年代不详';
  const prefix = PRECISION_SUFFIX[precision] ?? '约';
  if (precision === 'exact') return `${year}年`;
  if (precision === 'inferred') return `活动年代约${year}年`;
  return `${prefix}${year}年`;
}

export default { formatYearLabel };
