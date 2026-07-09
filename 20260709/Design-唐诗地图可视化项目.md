# 唐诗地图可视化项目 — 技术设计文档（Design Doc）

| 项目名称 | 唐诗地图（长安诗境）Tang Poetry Map |
| --- | --- |
| 文档版本 | v1.1（经 /grill-with-docs 评审修订；决策见 docs/adr/） |
| 编写日期 | 2026-07-09 |
| 关联文档 | 《PRD-唐诗地图可视化项目.md》、CONTEXT.md、docs/adr/ |
| 参考项目 | [worldhistoryviz](https://github.com/SeanFeng91/worldhistoryviz) |

---

## 1. 设计概述

### 1.1 设计原则

沿用参考项目 worldhistoryviz 经过验证的架构思路，并针对本项目特点做适配：

1. **纯前端静态站点**：无后端、无数据库，数据以结构化 JSON 文件承载，可免费部署于任何静态托管平台（Cloudflare Pages / GitHub Pages）。
2. **数据与代码分离**：新增诗词/地点只需追加 JSON 数据，不需要修改代码。
3. **模块化设计**：功能按域划分为独立 ES Module，模块间通过明确定义的接口与事件通信，降低耦合。
4. **渐进增强**：P0 核心功能不依赖任何构建工具即可运行；开发体验层（Vite）仅作为可选增强。

### 1.2 与参考项目的差异

| 维度 | worldhistoryviz | 本项目 |
| --- | --- | --- |
| 空间尺度 | 全球，历史疆界多边形为主 | 城市（西安），POI 点标记为主 |
| 底图 | historical-basemaps 历史疆界 GeoJSON | 现代瓦片底图 + 唐长安城复原图叠加层 |
| 时间轴 | 公元前 10000 年至今 | 618–907 年（唐代） |
| 数据类型 | 事件/迁徙/技术/物种等 8 类 | 诗人/地点/诗词 3 类实体 |
| 核心交互 | 时间驱动（拖时间轴看疆界变化） | 空间驱动（点地图标记读诗），时间轴为辅 |

## 2. 技术选型

| 层面 | 选型 | 理由 |
| --- | --- | --- |
| 地图引擎 | **Leaflet.js 1.9+** | 轻量（~42KB gzip）、生态成熟、与参考项目一致，学习成本低 |
| 标记聚合 | Leaflet.markercluster | 官方生态插件，解决城市尺度标记重叠问题 |
| 底图瓦片 | 高德瓦片（主）/ OpenStreetMap + 天地图（备） | 中文标注质量高；通过配置项可切换，规避单一来源风险 |
| 语言 | 原生 JavaScript（ES2020 Modules） | 与参考项目一致；无框架依赖，适合静态站点与长期维护 |
| 样式 | 原生 CSS + CSS Variables | 变量驱动主题切换（浅色/暗色/唐风色板） |
| 开发服务器 | Vite（仅开发期） | 热更新提升开发效率；构建产物仍是纯静态文件 |
| 搜索 | 前端内存索引（自实现，数据量 <200 条无需引入库） | 数据规模小，避免过度设计 |
| 部署 | Cloudflare Pages（主）/ GitHub Pages（备） | 免费、CDN 加速、与参考项目部署方式一致 |

> 底图说明：若使用高德/天地图瓦片需遵守其服务条款（天地图需免费申请 key）。代码中将瓦片源抽象为配置数组，一处修改即可整站切换。

## 3. 系统架构

### 3.1 模块划分

参考 worldhistoryviz 的模块结构，结合本项目实体简化：

```
index.html
css/
  ├── main.css              # 布局与组件样式
  ├── theme.css             # 色板与主题变量（浅色/暗色）
  └── poem.css              # 诗词排版专用样式（竖排、名句高亮）
js/
  ├── main.js               # 入口：DOMContentLoaded 后启动 App
  ├── app.js                # 应用核心：初始化各模块、持有全局状态、协调通信
  ├── config.js             # 全局配置：地图中心/边界、瓦片源、色板、常量
  ├── data-loader.js        # 数据加载：fetch JSON、缓存、索引构建（id→实体映射）
  ├── map-core.js           # 地图核心：初始化 Leaflet 实例、底图切换、视野控制
  ├── map-markers.js        # 标记层：创建/更新诗词地点标记、聚合、气泡
  ├── map-overlay.js        # 叠加层：唐长安城复原图 GeoJSON 图层开关（F9）
  ├── filter-manager.js     # 筛选器：时期/诗人筛选状态管理（F4）
  ├── list-panel.js         # 列表侧栏：诗词列表渲染与联动（F5）
  ├── detail-panel.js       # 详情面板：诗词详情/地点详情渲染（F3）
  ├── poet-view.js          # 诗人介绍视图（F8）
  ├── search.js             # 搜索：内存索引 + 防抖联想（F6）
  ├── timeline.js           # 时间轴：年代游标与播放控制（F7）
  ├── router.js             # URL 参数路由：?poem= / ?place= 深链（F11）
  └── intro.js              # 首次访问引导（F12）
data/
  ├── poets.json            # 诗人数据
  ├── places.json           # 地点数据
  ├── poems.json            # 诗词数据
  └── changan-city.geojson  # 唐长安城复原图层（城郭/宫城/坊）
assets/
  └── images/               # 地点配图（WebP，按地点 id 组织）
```

### 3.2 模块依赖关系

```
main.js
 └── app.js
      ├── config.js
      ├── data-loader.js
      ├── map-core.js
      │    ├── map-markers.js
      │    └── map-overlay.js
      ├── filter-manager.js
      ├── list-panel.js
      ├── detail-panel.js
      │    └── poet-view.js
      ├── search.js
      ├── timeline.js
      ├── router.js
      └── intro.js
```

### 3.3 通信机制与数据流

模块间不直接互相调用，统一通过 `app.js` 持有的**事件总线**（简单的 pub/sub，基于 `EventTarget`）通信，事件定义：

| 事件 | 载荷 | 发布者 | 订阅者 |
| --- | --- | --- | --- |
| `filter:changed` | `{periods, poetIds}` | filter-manager / timeline | map-markers, list-panel |
| `poem:selected` | `{poemId, source}` | map-markers / list-panel / search / router | detail-panel, map-core（飞行定位） |
| `place:selected` | `{placeId}` | map-markers / search | detail-panel, map-core |
| `poet:selected` | `{poetId}` | detail-panel / filter-manager | poet-view |
| `theme:changed` | `{mode}` | app | map-core（底图样式） |

典型数据流（用户点击地图标记）：

```
用户点击标记
  → map-markers 发布 poem:selected
    → map-core 飞行定位（flyTo）该地点
    → detail-panel 从 data-loader 索引取 poem/place/poet 数据并渲染
    → router 更新 URL（?poem=xxx，pushState）
```

### 3.4 状态管理

全局状态集中于 `app.js` 内的单一 `state` 对象，只允许通过事件回调修改：

```js
const state = {
  filter: { periods: ['early','high','middle','late'], poetIds: null }, // null=全部
  timeline: { year: null, playing: false },  // null=不启用时间过滤
  selection: { poemId: null, placeId: null },
  theme: 'auto',
};
```

## 4. 数据模型设计

### 4.1 poets.json（诗人）

```json
{
  "poets": [
    {
      "id": "wangwei",
      "name": "王维",
      "courtesyName": "摩诘",
      "period": "high",
      "birthYear": 701,
      "deathYear": 761,
      "activeYears": [721, 761],
      "portrait": "assets/images/poets/wangwei.webp",
      "bio": "字摩诘，号摩诘居士。开元九年进士，官至尚书右丞……（200字内小传）",
      "changanStory": "王维长期在长安为官，晚年半官半隐于蓝田辋川……"
    }
  ]
}
```

字段约束：
- `period`：枚举 `early | high | middle | late`（初/盛/中/晚四段，见 ADR-0001；前端展示、筛选、色板、时间轴分界统一依据）。不再保留 `literaryPeriod`——四段化后展示口径与文学史一致，双字段冗余；
- `id`：小写拼音，全局唯一，作为外键被 poems 引用。

### 4.2 places.json（地点）

```json
{
  "places": [
    {
      "id": "dayanta",
      "name": "大雁塔",
      "ancientName": "大慈恩寺浮图",
      "modernName": "大雁塔（大慈恩寺）",
      "coordinates": [34.2186, 108.9640],
      "locationPrecision": "exact",
      "scope": "core",
      "category": "temple",
      "description": "唐代新科进士曲江宴后题名于大雁塔下，'雁塔题名'为士人殊荣……",
      "images": [
        { "src": "assets/images/places/dayanta-1.webp", "caption": "大雁塔现貌", "status": "placeholder", "prompt": "唐风水墨，大雁塔晨景，工笔质感，宣纸底", "credit": "" }
      ]
    }
  ]
}
```

字段约束：
- `coordinates`：`[纬度, 经度]`（与 Leaflet 参数顺序一致），WGS-84；若采用高德底图需在渲染层做 GCJ-02 纠偏（见 §7.3）；
- `locationPrecision`：枚举 `exact | approximate`（精确 / 约略位置），约略位置的标记在 UI 上以虚线圆圈样式区分；
- `scope`：枚举 `core | extended`（核心关中 / 扩展远地，见 ADR-0006），决定「扩展范围」开关关闭时是否显示；与诗↔地语义 `relation` 正交；
- `category`：枚举 `palace | temple | scenic | street | bridge | mountain | suburb`，决定标记图标；
- `images[]`：地点配图；每项含 `src`、`caption`、`status`（`placeholder | generated`）、`prompt`（供 Grok 生图）、`credit`。首期 `status=placeholder`，后续批量生图替换（见 ADR-0008）。

> 不可定位的文学/虚构地点（如《长恨歌》仙界、《梦游天姥吟留别》梦境）v1 不收录为 place、不建标记，仅在对应诗篇的背景故事中说明（评审决议 #12）。

### 4.3 poems.json（诗词）

```json
{
  "poems": [
    {
      "id": "songyuanershi-anxi",
      "title": "送元二使安西",
      "poetId": "wangwei",
      "period": "high",
      "year": 750,
      "yearPrecision": "approximate",
      "content": ["渭城朝雨浥轻尘，", "客舍青青柳色新。", "劝君更尽一杯酒，", "西出阳关无故人。"],
      "highlight": ["劝君更尽一杯酒，西出阳关无故人。"],
      "places": [
        { "placeId": "weicheng", "relation": "described" },
        { "placeId": "yangguan", "relation": "related" }
      ],
      "story": "此诗为王维送友人元二出使安西都护府时所作。渭城即秦都咸阳故城，唐代自长安西行者多在此送别……（100–300字）",
      "sources": ["《全唐诗》卷一二八"]
    }
  ]
}
```

字段约束：
- `content`：字符串数组，每元素一句，便于逐句渲染与竖排排版；
- `highlight`：字符串数组（一首可有多句名句），气泡/列表展示首句，详情可高亮多句；
- `places`：地点关联数组，每项 `{ placeId, relation }`；`relation` 枚举 `composed（创作于此） | described（描绘此地） | related（关联地点）`。一首诗关联多个地点、且各地关系不同时（如《送元二使安西》：渭城 described、阳关 related），由每项各自标注；渲染层为每个地点各建一枚标记（见 ADR-0004）。此结构取代早期的 `placeId` 数组 + 标量 `placeRelation` 方案——标量无法表达一诗多地的不同关系；
- `year`：创作年份（公元），不可考时取诗人主要活动年代中值，`yearPrecision` 标注 `exact | approximate | inferred`，供时间轴使用；UI 须按精度诚实标注（如"约 X 年 / 活动年代"），避免误导。

### 4.4 changan-city.geojson（长安城复原图层）

标准 GeoJSON FeatureCollection，Feature 的 `properties` 包含 `name`（坊/宫名）、`type`（`wall | palace | ward | street`），渲染时按 `type` 应用不同的半透明填充与描边样式。

### 4.5 数据校验

提供 `scripts/validate-data.mjs`（Node 脚本，开发期使用）：
- 校验必填字段、枚举值（含 `period` 四值、`scope` 二值）、外键引用完整性（`poetId`、`poems[].places[].placeId` 必须存在）；
- 核心/扩展归属按地点 `scope` 字段校验（不靠坐标自动判定）；坐标包围盒（33.5–35.5°N, 107.5–110.5°E）仅作异常排查（如坐标明显越界告警）；
- CI（GitHub Actions）中对每次数据提交自动执行。

## 5. UI / 交互设计

### 5.1 页面布局

单页应用，桌面端三栏结构：

```
┌──────────────────────────────────────────────────────┐
│ 顶栏：Logo「长安诗境」｜时期分段筛选｜搜索框｜主题切换 │
├───────────┬──────────────────────────────┬───────────┤
│ 左侧栏     │                              │ 右侧面板   │
│ 诗人筛选   │        Leaflet 地图          │ 诗词详情   │
│ 诗词列表   │   （标记 + 聚合 + 叠加层）    │ （默认隐藏）│
│ (可折叠)   │                              │           │
├───────────┴──────────────────────────────┴───────────┤
│ 底部：时间轴 618 ──●──────── 907  ▶ 播放              │
└──────────────────────────────────────────────────────┘
```

移动端（<768px）：地图全屏；顶栏保留筛选与搜索入口（收纳为图标）；列表与详情均为底部上滑抽屉（半屏/全屏两档）；时间轴收纳为可展开的悬浮按钮。

### 5.2 视觉设计（唐风色板）

以 CSS Variables 定义，浅色主题主色板：

| 变量 | 色值 | 用途 |
| --- | --- | --- |
| `--color-bg` | `#f7f3e9`（宣纸米白） | 页面背景 |
| `--color-ink` | `#2b2b2b`（墨色） | 正文文字 |
| `--color-primary` | `#9d2933`（胭脂红） | 主按钮、选中态、Logo |
| `--color-early` | `#4a7c59`（青绿） | 初唐标记与徽章 |
| `--color-high` | `#2c6e8f`（黛青）候选 | 盛唐标记与徽章（设计阶段定稿，需与初/中/晚 + 主色拉开并过 AA） |
| `--color-middle` | `#c9a227`（鎏金） | 中唐标记与徽章 |
| `--color-late` | `#7b4b94`（紫檀） | 晚唐标记与徽章 |
| `--color-panel` | `#fffdf8` | 面板背景 |

暗色主题以深墨底（`#1a1a1f`）配同色系降饱和变体。四个时期色在两主题下均需与背景保持 ≥ 4.5:1 对比度。

字体：正文使用系统字体栈；诗词正文优先 `"Noto Serif SC", "STSong", serif` 衬线字体；标题可用 WebFont 楷体子集（仅子集化常用字，控制体积 <100KB）。

### 5.3 标记与气泡设计

- 标记：SVG 自定义 icon，水滴形底 + 时期色填充 + 白色"诗"字或类别小图标；`approximate` 位置的标记外圈加虚线圆；
- 聚合簇：圆形，显示数量，颜色取簇内多数时期色；
- 悬停气泡（Tooltip）：`诗名 · 诗人`＋一句名句，最大宽度 240px；
- 点击后 Popup 不使用（信息量大），直接打开详情面板。

### 5.4 关键交互细节

- 地图飞行：`map.flyTo(latlng, 15, {duration: 0.8})`，动画结束后再展开面板，避免卡顿感；
- 列表 ↔ 标记双向联动：悬停列表项时对应标记放大 1.2 倍并置顶；
- 多地点诗的列表点击：列表中一首诗仍为一项，点击飞向其首个核心范围内（`scope=core`）地点（无则取首项），该诗其余地点的标记做高亮；
- 筛选变化时标记增删使用淡入淡出过渡（CSS opacity，200ms）；
- 时间轴播放：每 500ms 前进 5 年，可暂停；到 907 年自动停止；
- 详情面板内长诗默认显示前 8 句 + "展开全文"。

## 6. 性能设计

| 措施 | 说明 |
| --- | --- |
| 数据按需加载 | 首屏只加载 `poets.json` + `places.json` + `poems.json`（三者合计预估 <300KB）；`changan-city.geojson` 与诗人画像延迟到相应功能触发时加载 |
| 图片优化 | 全部转 WebP，详情图 ≤200KB/张；`loading="lazy"`；列表不加载图片 |
| 标记渲染 | 使用 markercluster；筛选时增量更新（diff 现有标记）而非全量重建 |
| 输入防抖 | 搜索输入 300ms 防抖；时间轴拖动 rAF 节流 |
| 缓存 | 静态资源由 CDN 缓存；数据 JSON 设置 `Cache-Control` 并以文件名 hash（构建期）失效 |
| 体积控制 | 生产依赖仅 Leaflet + markercluster（合计 ~60KB gzip）；不引入框架 |

## 7. 关键技术问题与方案

### 7.1 标记聚合与同点多诗

- 同一 `placeId` 的多首诗只建**一个标记**，角标显示诗词数；点击后详情面板顶部为地点信息，下方为该地点诗词卡片列表；
- 不同地点的邻近标记交由 markercluster 在 zoom < 14 时聚合；
- 「扩展范围」开关：默认仅渲染 `scope=core` 标记；打开时追加 `scope=extended`（淡入），并放宽地图 `maxBounds` 到含扩展大盒，关闭则收回。

### 7.2 唐长安城复原图层

- 数据来源：依据学术复原图（如史念海《西安历史地图集》的公开研究成果）自行绘制简化 GeoJSON（城郭轮廓 + 宫城/皇城 + 主要街道 + 重点坊约 20 个），使用 geojson.io 手工绘制；
- 仅作示意用途并在图层说明中注明"示意复原，非精确考古边界"；
- 若绘制成本超期，降级方案：以一张带地理配准的半透明 PNG 用 `L.imageOverlay` 叠加。

### 7.3 坐标系纠偏

国内瓦片服务（高德）使用 GCJ-02 坐标系，而数据以 WGS-84 录入：

- 在 `map-core.js` 中内置 WGS-84 → GCJ-02 转换函数（约 30 行标准算法），仅当当前瓦片源声明 `crs: 'gcj02'` 时对标记坐标做转换；
- 若切换到 OSM/天地图（WGS-84/CGCS2000）则不转换。该逻辑封装在坐标适配层，业务代码无感知。

### 7.4 搜索索引

数据加载完成后一次性构建内存索引：

```js
// 每条记录: { type: 'poem'|'poet'|'place', id, searchText, display }
// searchText 拼接: 诗名+诗人名+全文+地点名，统一小写
```

查询用 `String.includes` 顺序扫描（<200 条记录，单次 <1ms），按类型分组返回前 10 条。无需引入 Fuse.js 等库。

### 7.5 深链路由

- 使用 `URLSearchParams` 解析 `?poem= / ?place= / ?poet=`；
- 应用初始化完成（数据加载 + 地图 ready）后由 `router.js` 执行一次初始定位；
- 用户操作时 `history.replaceState` 更新 URL（不产生历史堆栈噪音，仅详情打开用 pushState 以支持返回键关闭面板——移动端体验关键）。

## 8. 目录与工程规范

### 8.1 代码规范

- ES Modules，每个模块导出单个类或明确的函数集合；
- 命名：模块文件 kebab-case；类 PascalCase；事件名 `域:动作` 小写；
- 每个模块头部注释声明职责、发布/订阅的事件；
- 禁止模块间直接 import 兄弟模块的实例（只 import 类型/纯函数），实例经 app.js 注入。

### 8.2 Git 与 CI

- 分支：`main`（发布）+ `dev`（集成）+ 特性分支；
- GitHub Actions：PR 时运行数据校验脚本 + ESLint；`main` 推送自动触发 Cloudflare Pages 部署；
- 数据文件的修改与代码修改分开提交，便于内容审校。

### 8.3 部署配置

沿用参考项目做法：

- `_headers`：设置 CORS 与缓存策略；
- `_redirects`：SPA 路由回退到 `index.html`；
- `404.html`、`robots.txt`、`sitemap.xml`。

## 9. 测试方案

| 类型 | 范围 | 工具 |
| --- | --- | --- |
| 数据校验 | Schema、外键、坐标范围（每次提交） | 自研 Node 脚本 + CI |
| 单元测试 | 坐标转换、筛选逻辑、搜索索引等纯函数 | Vitest |
| 手工回归 | P0 核心流程 checklist（浏览→筛选→定位→详情），桌面 + iOS + Android | 人工 |
| 性能 | Lighthouse（Performance ≥ 80，A11y ≥ 90） | Chrome DevTools |
| 兼容性 | Chrome / Edge / Safari / Firefox 最新两版 | 人工抽测 |

## 10. 迭代与扩展预留

- **数据扩展**：Schema 中实体独立、外键引用，未来可扩展"诗词路线"（如诗人行迹线，参考 worldhistoryviz 的 migrations 实现，用 `L.polyline` 绘制）；
- **多城市**：`config.js` 中地图中心/边界/数据路径均为配置项，可复制部署"洛阳诗境"等姊妹站；
- **音频朗诵**：poems schema 预留 `audio` 字段；
- **游戏化**：预留"打卡模式"（基于 Geolocation API 判断用户是否到达诗词地点），首期不实现。
