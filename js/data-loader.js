/**
 * 数据加载：fetch JSON、构建 id→实体索引
 */
import { DATA_PATHS } from './config.js';

/**
 * @typedef {object} AppData
 * @property {object[]} poets
 * @property {object[]} places
 * @property {object[]} poems
 * @property {Map<string, object>} poetById
 * @property {Map<string, object>} placeById
 * @property {Map<string, object>} poemById
 * @property {Map<string, object[]>} poemsByPlaceId
 */

/**
 * @returns {Promise<AppData>}
 */
export async function loadAppData(paths = DATA_PATHS) {
  const [poetsRes, placesRes, poemsRes] = await Promise.all([
    fetch(paths.poets),
    fetch(paths.places),
    fetch(paths.poems),
  ]);
  if (!poetsRes.ok || !placesRes.ok || !poemsRes.ok) {
    throw new Error('数据文件加载失败，请确认通过本地静态服务器访问站点');
  }
  const [poetsJson, placesJson, poemsJson] = await Promise.all([
    poetsRes.json(),
    placesRes.json(),
    poemsRes.json(),
  ]);

  const poets = poetsJson.poets || [];
  const places = placesJson.places || [];
  const poems = poemsJson.poems || [];

  const poetById = new Map(poets.map((p) => [p.id, p]));
  const placeById = new Map(places.map((p) => [p.id, p]));
  const poemById = new Map(poems.map((p) => [p.id, p]));
  /** @type {Map<string, object[]>} */
  const poemsByPlaceId = new Map();

  for (const poem of poems) {
    for (const ref of poem.places || []) {
      if (!poemsByPlaceId.has(ref.placeId)) poemsByPlaceId.set(ref.placeId, []);
      poemsByPlaceId.get(ref.placeId).push(poem);
    }
  }

  return {
    poets,
    places,
    poems,
    poetById,
    placeById,
    poemById,
    poemsByPlaceId,
  };
}

export default { loadAppData };
