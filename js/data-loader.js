/**
 * 数据加载：按实体分文件、分阶段按需 fetch，构建 id→实体索引
 * - 首屏：places → poets → poems（串行，避免三文件并行争抢）
 * - 扩展：changan-city.geojson 由 map-overlay 在开关打开时再加载
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
 * 加载单个 JSON 文件（按需入口，可被分阶段调用）
 * @param {string} path
 * @returns {Promise<any>}
 */
export async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`数据文件加载失败: ${path} (${res.status})`);
  }
  return res.json();
}

/**
 * 仅加载地点（地图标记骨架）
 */
export async function loadPlaces(paths = DATA_PATHS) {
  const json = await loadJson(paths.places);
  return json.places || [];
}

/**
 * 仅加载诗人（筛选侧栏）
 */
export async function loadPoets(paths = DATA_PATHS) {
  const json = await loadJson(paths.poets);
  return json.poets || [];
}

/**
 * 仅加载诗词（列表 / 标记角标 / 详情）
 */
export async function loadPoems(paths = DATA_PATHS) {
  const json = await loadJson(paths.poems);
  return json.poems || [];
}

/**
 * 唐长安城复原图层（真正按需：仅在打开图层时调用）
 */
export async function loadChanganCity(paths = DATA_PATHS) {
  return loadJson(paths.changanCity);
}

/**
 * 由实体数组构建索引
 * @param {object[]} poets
 * @param {object[]} places
 * @param {object[]} poems
 * @returns {AppData}
 */
export function buildAppDataIndexes(poets, places, poems) {
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

/**
 * 分阶段按需加载三类实体（串行，非 Promise.all 并行全量）。
 * @param {typeof DATA_PATHS} [paths]
 * @param {{ onPhase?: (name: string, payload: object) => void }} [hooks]
 * @returns {Promise<AppData>}
 */
export async function loadAppData(paths = DATA_PATHS, hooks = {}) {
  // 阶段 1：地点 — 地图与 scope 所需
  const places = await loadPlaces(paths);
  hooks.onPhase?.('places', { places });

  // 阶段 2：诗人 — 筛选与徽章
  const poets = await loadPoets(paths);
  hooks.onPhase?.('poets', { poets, places });

  // 阶段 3：诗词 — 标记/列表/搜索依赖
  const poems = await loadPoems(paths);
  hooks.onPhase?.('poems', { poets, places, poems });

  return buildAppDataIndexes(poets, places, poems);
}

export default {
  loadJson,
  loadPlaces,
  loadPoets,
  loadPoems,
  loadChanganCity,
  buildAppDataIndexes,
  loadAppData,
};
