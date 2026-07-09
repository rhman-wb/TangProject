/**
 * 全局配置：地图中心/边界、瓦片源、时期色板、常量
 */

export const PERIODS = Object.freeze(['early', 'high', 'middle', 'late']);

export const PERIOD_LABELS = Object.freeze({
  early: '初唐',
  high: '盛唐',
  middle: '中唐',
  late: '晚唐',
});

/** 四段时期年份边界（ADR-0001） */
export const PERIOD_BOUNDS = Object.freeze({
  early: [618, 712],
  high: [712, 762],
  middle: [762, 835],
  late: [835, 907],
});

export const TIMELINE_RANGE = Object.freeze({ start: 618, end: 907 });
export const TIMELINE_MARKS = Object.freeze([618, 712, 762, 835, 907]);

export const PERIOD_COLORS = Object.freeze({
  early: '#4a7c59',
  high: '#2c6e8f',
  middle: '#c9a227',
  late: '#7b4b94',
});

export const PLACE_SCOPES = Object.freeze(['core', 'extended']);
export const PLACE_RELATIONS = Object.freeze(['composed', 'described', 'related']);
export const LOCATION_PRECISIONS = Object.freeze(['exact', 'approximate']);
export const YEAR_PRECISIONS = Object.freeze(['exact', 'approximate', 'inferred']);
export const PLACE_CATEGORIES = Object.freeze([
  'palace',
  'temple',
  'scenic',
  'street',
  'bridge',
  'mountain',
  'suburb',
]);

/** 唐长安城核心区中心（WGS-84） */
export const MAP_CENTER = Object.freeze([34.27, 108.94]);
export const MAP_DEFAULT_ZOOM = 12;
export const MAP_MIN_ZOOM = 8;
export const MAP_MAX_ZOOM = 18;

/** 核心关中 maxBounds [[south, west], [north, east]] */
export const CORE_BOUNDS = Object.freeze([
  [33.6, 107.8],
  [35.0, 110.0],
]);

/** 含扩展范围的大盒 */
export const EXTENDED_BOUNDS = Object.freeze([
  [29.0, 94.0],
  [42.0, 120.0],
]);

export const TILE_SOURCES = Object.freeze([
  {
    id: 'osm',
    name: 'OpenStreetMap',
    crs: 'wgs84',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  {
    id: 'carto-light',
    name: 'Carto 浅色',
    crs: 'wgs84',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
  },
  {
    id: 'carto-dark',
    name: 'Carto 暗色',
    crs: 'wgs84',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 20,
  },
]);

export const DATA_PATHS = Object.freeze({
  poets: 'data/poets.json',
  places: 'data/places.json',
  poems: 'data/poems.json',
  changanCity: 'data/changan-city.geojson',
});

export const SEARCH_DEBOUNCE_MS = 300;
export const INTRO_STORAGE_KEY = 'changan-poetry-intro-seen';
export const THEME_STORAGE_KEY = 'changan-poetry-theme';

export const APP_TITLE = '长安诗境';
export const APP_SUBTITLE = '唐诗地图 · 在地图上读诗';
