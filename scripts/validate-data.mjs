#!/usr/bin/env node
/**
 * 数据校验器：必填/枚举/外键/scope
 * 退出码 0 = 通过；非 0 = 失败
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = join(ROOT, 'data');

const PERIODS = new Set(['early', 'high', 'middle', 'late']);
const SCOPES = new Set(['core', 'extended']);
const RELATIONS = new Set(['composed', 'described', 'related']);
const LOCATION_PRECISIONS = new Set(['exact', 'approximate']);
const YEAR_PRECISIONS = new Set(['exact', 'approximate', 'inferred']);
const CATEGORIES = new Set([
  'palace',
  'temple',
  'scenic',
  'street',
  'bridge',
  'mountain',
  'suburb',
]);
const IMAGE_STATUSES = new Set(['placeholder', 'generated']);

const errors = [];
const warnings = [];

function err(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

function loadJson(name) {
  const path = join(DATA, name);
  if (!existsSync(path)) {
    err(`缺少数据文件: data/${name}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    err(`无法解析 data/${name}: ${e.message}`);
    return null;
  }
}

function requireString(obj, field, ctx) {
  if (typeof obj[field] !== 'string' || !obj[field].trim()) {
    err(`${ctx}: 缺少必填字符串字段 ${field}`);
    return false;
  }
  return true;
}

function requireArray(obj, field, ctx, minLen = 1) {
  if (!Array.isArray(obj[field]) || obj[field].length < minLen) {
    err(`${ctx}: 字段 ${field} 须为长度≥${minLen} 的数组`);
    return false;
  }
  return true;
}

const poetsData = loadJson('poets.json');
const placesData = loadJson('places.json');
const poemsData = loadJson('poems.json');

if (!poetsData || !placesData || !poemsData) {
  console.error('校验失败：无法加载数据文件');
  process.exit(1);
}

const poets = poetsData.poets || [];
const places = placesData.places || [];
const poems = poemsData.poems || [];

if (!Array.isArray(poets) || poets.length === 0) err('poets 数组为空');
if (!Array.isArray(places) || places.length === 0) err('places 数组为空');
if (!Array.isArray(poems) || poems.length === 0) err('poems 数组为空');

const poetById = new Map();
const placeById = new Map();

for (const poet of poets) {
  const ctx = `诗人 ${poet?.id ?? '?'}`;
  if (!requireString(poet, 'id', ctx)) continue;
  if (poetById.has(poet.id)) err(`${ctx}: id 重复`);
  poetById.set(poet.id, poet);
  requireString(poet, 'name', ctx);
  if (!PERIODS.has(poet.period)) err(`${ctx}: period 非法 ${poet.period}`);
  if (poet.bio != null && typeof poet.bio !== 'string') {
    err(`${ctx}: bio 须为字符串`);
  }
}

for (const place of places) {
  const ctx = `地点 ${place?.id ?? '?'}`;
  if (!requireString(place, 'id', ctx)) continue;
  if (placeById.has(place.id)) err(`${ctx}: id 重复`);
  placeById.set(place.id, place);
  requireString(place, 'name', ctx);
  if (!SCOPES.has(place.scope)) err(`${ctx}: scope 非法 ${place.scope}`);
  if (!LOCATION_PRECISIONS.has(place.locationPrecision)) {
    err(`${ctx}: locationPrecision 非法 ${place.locationPrecision}`);
  }
  if (place.category && !CATEGORIES.has(place.category)) {
    err(`${ctx}: category 非法 ${place.category}`);
  }
  if (
    !Array.isArray(place.coordinates) ||
    place.coordinates.length !== 2 ||
    typeof place.coordinates[0] !== 'number' ||
    typeof place.coordinates[1] !== 'number'
  ) {
    err(`${ctx}: coordinates 须为 [lat, lng] 数字对`);
  } else {
    const [lat, lng] = place.coordinates;
    // 全球范围粗检；core 点告警若远离关中
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      err(`${ctx}: 坐标超出合法范围`);
    } else if (
      place.scope === 'core' &&
      (lat < 33.5 || lat > 35.5 || lng < 107.5 || lng > 110.5)
    ) {
      warn(`${ctx}: core 地点坐标疑似偏离关中包围盒`);
    }
  }
  // 禁止仙界/梦境类虚构地点作标记
  const ban = /仙界|梦境|天姥|蓬莱/;
  if (ban.test(place.name) || ban.test(place.id)) {
    err(`${ctx}: 禁止将仙界/梦境等不可定位虚构地点建为标记`);
  }
  if (Array.isArray(place.images)) {
    for (const [i, img] of place.images.entries()) {
      if (img.status && !IMAGE_STATUSES.has(img.status)) {
        err(`${ctx} images[${i}]: status 非法 ${img.status}`);
      }
      if (img.status === 'placeholder' && !img.prompt) {
        warn(`${ctx} images[${i}]: placeholder 建议附 prompt`);
      }
    }
  }
}

for (const poem of poems) {
  const ctx = `诗词 ${poem?.id ?? '?'}`;
  if (!requireString(poem, 'id', ctx)) continue;
  requireString(poem, 'title', ctx);
  if (!requireString(poem, 'poetId', ctx)) {
    // already logged
  } else if (!poetById.has(poem.poetId)) {
    err(`${ctx}: poetId 外键不存在 ${poem.poetId}`);
  }
  if (!PERIODS.has(poem.period)) err(`${ctx}: period 非法 ${poem.period}`);
  if (!requireArray(poem, 'content', ctx, 1)) {
    // logged
  } else if (!poem.content.every((line) => typeof line === 'string')) {
    err(`${ctx}: content 元素须均为字符串`);
  }
  if (!requireArray(poem, 'highlight', ctx, 1)) {
    // logged
  } else if (!poem.highlight.every((h) => typeof h === 'string' && h.trim())) {
    err(`${ctx}: highlight 元素须为非空字符串`);
  }
  if (!requireArray(poem, 'places', ctx, 1)) {
    // logged
  } else {
    for (const [i, ref] of poem.places.entries()) {
      if (!ref.placeId || !placeById.has(ref.placeId)) {
        err(`${ctx} places[${i}]: placeId 外键不存在 ${ref?.placeId}`);
      }
      if (!RELATIONS.has(ref.relation)) {
        err(`${ctx} places[${i}]: relation 非法 ${ref?.relation}`);
      }
    }
  }
  if (poem.year != null && typeof poem.year !== 'number') {
    err(`${ctx}: year 须为数字`);
  }
  if (poem.yearPrecision && !YEAR_PRECISIONS.has(poem.yearPrecision)) {
    err(`${ctx}: yearPrecision 非法 ${poem.yearPrecision}`);
  }
  if (!Array.isArray(poem.sources) || poem.sources.length === 0) {
    err(`${ctx}: sources 强校验必填，至少一项出处`);
  }
}

// 汇总
console.log('=== 唐诗地图数据校验 ===');
console.log(`诗人: ${poets.length}`);
console.log(`地点: ${places.length}`);
console.log(`诗词: ${poems.length}`);

if (warnings.length) {
  console.log(`\n警告 (${warnings.length}):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}

if (errors.length) {
  console.error(`\n错误 (${errors.length}):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error('\n校验失败');
  process.exit(1);
}

console.log('\n校验通过 ✓');
process.exit(0);
