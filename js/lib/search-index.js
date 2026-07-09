/**
 * 内存搜索索引：跨诗名/诗人/诗句/地点模糊匹配
 */

/**
 * @typedef {{ type: 'poem'|'poet'|'place', id: string, searchText: string, display: string, sub?: string }} SearchRecord
 */

/**
 * 构建搜索索引
 * @param {{ poets: object[], places: object[], poems: object[] }} data
 * @param {Map<string, object>} poetById
 * @returns {SearchRecord[]}
 */
export function buildSearchIndex(data, poetById) {
  /** @type {SearchRecord[]} */
  const index = [];

  for (const poet of data.poets) {
    const text = [poet.name, poet.courtesyName || '', poet.bio || '']
      .join(' ')
      .toLowerCase();
    index.push({
      type: 'poet',
      id: poet.id,
      searchText: text,
      display: poet.name,
      sub: poet.courtesyName ? `字${poet.courtesyName}` : '',
    });
  }

  for (const place of data.places) {
    const text = [
      place.name,
      place.ancientName || '',
      place.modernName || '',
      place.description || '',
    ]
      .join(' ')
      .toLowerCase();
    index.push({
      type: 'place',
      id: place.id,
      searchText: text,
      display: place.name,
      sub: place.modernName || place.ancientName || '',
    });
  }

  for (const poem of data.poems) {
    const poet = poetById?.get(poem.poetId);
    const content = Array.isArray(poem.content)
      ? poem.content.join('')
      : String(poem.content || '');
    const highlights = Array.isArray(poem.highlight)
      ? poem.highlight.join('')
      : '';
    const text = [poem.title, poet?.name || '', content, highlights]
      .join(' ')
      .toLowerCase();
    index.push({
      type: 'poem',
      id: poem.id,
      searchText: text,
      display: poem.title,
      sub: poet?.name || '',
    });
  }

  return index;
}

/**
 * 查询索引，按类型分组返回前 limit 条/类
 * @param {SearchRecord[]} index
 * @param {string} query
 * @param {number} [limitPerType=5]
 * @returns {{ poems: SearchRecord[], poets: SearchRecord[], places: SearchRecord[] }}
 */
export function searchIndex(index, query, limitPerType = 5) {
  const q = (query || '').trim().toLowerCase();
  const empty = { poems: [], poets: [], places: [] };
  if (!q) return empty;

  const result = { poems: [], poets: [], places: [] };
  const typeMap = { poem: 'poems', poet: 'poets', place: 'places' };

  for (const rec of index) {
    if (!rec.searchText.includes(q)) continue;
    const key = typeMap[rec.type];
    if (!key) continue;
    if (result[key].length >= limitPerType) continue;
    result[key].push(rec);
  }
  return result;
}

/**
 * 扁平化结果（便于下拉）
 */
export function flattenSearchResults(grouped) {
  return [
    ...grouped.poems.map((r) => ({ ...r, category: '诗词' })),
    ...grouped.poets.map((r) => ({ ...r, category: '诗人' })),
    ...grouped.places.map((r) => ({ ...r, category: '地点' })),
  ];
}

export default { buildSearchIndex, searchIndex, flattenSearchResults };
