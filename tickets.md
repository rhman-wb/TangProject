# Tickets: 唐诗地图（长安诗境）首期建设

把经 `/grill-with-docs` 评审定稿的 PRD/Design（v1.1）+ `CONTEXT.md` + `docs/adr/0001–0008` 落地为可运行的唐诗地图静态站点。每张票是一条 tracer-bullet 垂直切片（schema→数据→UI→测试），可独立 demo。参考源：`20260709/PRD-…`、`20260709/Design-…`、`CONTEXT.md`、`docs/adr/`。

**按 frontier 推进**：阻塞都已完成的票即可开工。T1 完成后，**T2（代码主线）与 T10（数据主线）并行**。每张票用 `/implement` 逐张推进、清空上下文。

---

## T1 — 项目骨架 + 数据 Schema + 校验器

**What to build:** 搭起可构建的纯前端静态站点骨架，定义三类实体 JSON Schema（含评审定稿的全部字段），提供开发期/CI 可跑的数据校验器；附最小种子数据让校验器有东西验、首切有东西加载。

**Blocked by:** None — 可立即开工。

- [x] `index.html` + `css/`（main/theme/poem）+ `js/` 模块骨架（main/app/config/data-loader 等，按 Design §3.1）
- [x] 三类 Schema：`period=early|high|middle|late`、`place.scope=core|extended`、`poem.highlight=string[]`、`poem.places=[{placeId,relation}]`、`images[].{status,prompt}`
- [x] `scripts/validate-data.mjs`：必填/枚举/外键（`poetId`、`places[].placeId`）/scope 合法性；CI 运行
- [x] 最小种子：1 诗人（王维）、1–2 地点（含 1 个 extended 如阳关）、1–2 诗（如《送元二》，多地点）
- [x] 校验器对种子退出码 0；站点可本地打开

## T2 — 地图首切：种子数据 → 标记 → 详情

**What to build:** 加载种子数据，在长安地图渲染地点中心标记，点击打开详情面板显示古今地名与诗卡全文——端到端最薄一条路径打通。

**Blocked by:** T1 — 项目骨架 + 数据 Schema + 校验器

- [x] data-loader：fetch JSON + 建 id→实体索引
- [x] map-core：Leaflet 初始化（长安中心/默认缩放/maxBounds）+ WGS-84↔GCJ-02 坐标适配层（按瓦片源声明，见 ADR-0003）
- [x] map-markers：地点中心标记（每地一标），点击触发选中
- [x] detail-panel：桌面右侧滑出/移动底部抽屉，显示古今地名 + 诗卡（诗名/作者/时期徽章/全文/名句高亮）
- [x] 事件总线（EventTarget pub/sub）打通 marker→detail

## T3 — 时期四段筛选 + 标记着色 + 列表联动

**What to build:** 用户按初/盛/中/晚/全部筛选，标记按四时期着色，列表与标记双向联动；多地点诗点击飞向首个核心地点。

**Blocked by:** T2 — 地图首切：种子数据 → 标记 → 详情

- [x] filter-manager：初/盛/中/晚/全部分段筛选器
- [x] 标记按四时期色着色（初青绿 / 盛黛青候选 / 中鎏金 / 晚紫檀）
- [x] list-panel：当前筛选下诗词列表，悬停联动标记放大、点击飞行 + 详情
- [x] 多地点诗列表点击：飞向首个 `scope=core` 地点（无则首项），其余标记高亮
- [x] `filter:changed` 事件贯通 filter→markers→list

## T4 — 诗人筛选 + 诗人介绍页

**What to build:** 按诗人筛选标记；每位诗人有独立介绍页，可从详情作者名与筛选列表进入。

**Blocked by:** T3 — 时期四段筛选 + 标记着色 + 列表联动

- [x] 诗人筛选：按时期分组的复选清单，选中仅显对应诗人标记
- [x] poet-view：画像/生卒/字号/时期/小传/与长安渊源/收录作品列表
- [x] 详情作者名、筛选列表均可跳转诗人页

## T5 — 时间轴（四段边界 + 诚实年代）

**What to build:** 底部时间轴按年代驱动标记显隐，标注四段边界，对不可考年代诚实标注。

**Blocked by:** T3 — 时期四段筛选 + 标记着色 + 列表联动

- [x] 时间轴 618–907，标 618/712/762/835/907 四界
- [x] 拖动游标 / 播放按 `year` 显隐标记；按 `yearPrecision` 标注「约X年 / 活动年代」
- [x] 时间轴与筛选取交集

## T6 — 核心/扩展范围开关

**What to build:** 「扩展范围」开关显隐远地标记，并相应调整地图浏览范围。

**Blocked by:** T3 — 时期四段筛选 + 标记着色 + 列表联动

- [x] 默认仅显 `scope=core`；开关打开追加 `scope=extended`（淡入）并放宽 maxBounds，关闭收回
- [x] 用种子里阳关/马嵬 demo

## T7 — 搜索（内存索引 + 防抖联想）

**What to build:** 单一搜索框跨诗名/诗人/诗句/地点模糊匹配，实时分类提示。

**Blocked by:** T2 — 地图首切：种子数据 → 标记 → 详情

- [x] 数据加载后一次性建内存索引；300ms 防抖
- [x] 跨诗名/诗人/诗句/地点匹配，分类下拉提示
- [x] 选中结果飞行定位 + 打开详情

## T8 — 唐长安城复原图层

**What to build:** 可开关的唐长安城坊/宫城/街道 GeoJSON 叠加层。

**Blocked by:** T2 — 地图首切：种子数据 → 标记 → 详情

- [x] map-overlay：`changan-city.geojson` 叠加开关，按 type 半透明着色
- [x] 高缩放显坊名；注明「示意复原，非精确考古边界」
- [x] 超期降级：带地理配准的半透明 PNG `imageOverlay`

## T9 — 深链路由 + 主题切换 + 引导页

**What to build:** 可分享的深链、浅/暗主题、首次访问引导。

**Blocked by:** T2 — 地图首切：种子数据 → 标记 → 详情；T4 — 诗人筛选 + 诗人介绍页

- [x] router：`?poem / ?place / ?poet` 解析（pushState/replaceState，移动端返回键关面板），初始化后定位
- [x] 主题：浅/暗/跟随系统，底图样式同步
- [x] intro：首次访问项目简介 + 三步引导，localStorage 记忆可跳过

## T10 — 数据生产流水线 + 首批 30 首

**What to build:** 落地数据生产流程（ADR-0007），产出首期数据集（强校验字段齐）。

**Blocked by:** T1 — 项目骨架 + 数据 Schema + 校验器

- [x] AI 起草 + 人工校验 + 分级流程文档化（强校验 vs 最小可用）
- [x] 25 位诗人 + 30 首诗 + 地点，强校验字段（诗名/作者/时期/全文/名句/坐标/出处）齐
- [x] `scope` / `period` 准确；仙界/梦境排除；多地点诗用 `places[{placeId,relation}]`
- [x] 校验器退出码 0

## T11 — 数据扩充至 ≥60 首

**What to build:** 把数据集扩到 PRD 验收规模并抽查一致性。

**Blocked by:** T10 — 数据生产流水线 + 首批 30 首

- [x] 诗 ≥60、地点 ≥30
- [x] 抽查：李白/杜甫→盛唐；马嵬→extended；《长恨歌》名句数组≥3、仙界无标记；《送元二》渭城 core + 阳关 related
- [x] 校验器退出码 0

## T12 — 配图：占位符 → Grok 生图

**What to build:** 用 Grok 生图模型按统一唐风方向批量替换占位配图。

**Blocked by:** T10 — 数据生产流水线 + 首批 30 首；T11 — 数据扩充至 ≥60 首

- [x] 定唐风 art-direction prompt 模板（水墨/工笔/古画质感，呼应色板）
- [x] 用 Grok 生图批量生成全部地点配图，替换占位、置 `status=generated`
- [x] 风格一致、无版权风险

## T13 — 性能 + 多端测试 + 部署上线

**What to build:** 性能/可访问性达标，多端可用，部署到公网静态站点。

**Blocked by:** T9 — 深链路由 + 主题切换 + 引导页；T11 — 数据扩充至 ≥60 首；T12 — 配图：占位符 → Grok 生图

- [x] Lighthouse Performance ≥80、Accessibility ≥90
- [x] 响应式 375px+；Chrome/Edge/Safari/Firefox + iOS/Android 抽测
- [x] 图片 WebP + lazy；JSON 按需加载
- [x] 部署 Cloudflare Pages（`_headers` / `_redirects` / `404.html` / `sitemap.xml`）；公网可访问
