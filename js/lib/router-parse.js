/**
 * 深链查询参数解析：?poem / ?place / ?poet
 */

/**
 * @param {string|URLSearchParams|URL} input
 * @returns {{ poem: string|null, place: string|null, poet: string|null }}
 */
export function parseRouteQuery(input) {
  let params;
  if (input instanceof URLSearchParams) {
    params = input;
  } else if (typeof input === 'string') {
    const q = input.includes('?') ? input.slice(input.indexOf('?')) : input;
    params = new URLSearchParams(q.startsWith('?') ? q : `?${q}`);
  } else if (input && typeof input.searchParams !== 'undefined') {
    params = input.searchParams;
  } else {
    params = new URLSearchParams();
  }

  const get = (key) => {
    const v = params.get(key);
    return v && v.trim() ? v.trim() : null;
  };

  return {
    poem: get('poem'),
    place: get('place'),
    poet: get('poet'),
  };
}

/**
 * 构建查询字符串（仅包含非空参数）
 * @param {{ poem?: string|null, place?: string|null, poet?: string|null }} route
 * @returns {string} 如 "?poem=xxx" 或 ""
 */
export function buildRouteQuery(route) {
  const params = new URLSearchParams();
  if (route.poem) params.set('poem', route.poem);
  if (route.place) params.set('place', route.place);
  if (route.poet) params.set('poet', route.poet);
  const s = params.toString();
  return s ? `?${s}` : '';
}

export default { parseRouteQuery, buildRouteQuery };
