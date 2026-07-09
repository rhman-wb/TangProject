# 长安诗境 · 唐诗地图

以交互式地图呈现唐代诗人在长安及关联地点的诗词。纯前端静态站点（Leaflet + JSON 数据）。

## 本地运行

```bash
npm run serve
# 打开 http://localhost:5173
```

请勿直接用 `file://` 双击打开（ES Modules + fetch 需要 HTTP）。

## 数据校验与测试

```bash
npm run validate
npm test
```

## 技术要点

- 数据：`data/poets.json` / `places.json` / `poems.json`
- 校验：`scripts/validate-data.mjs`
- 架构决策：`docs/adr/`
- 术语：`CONTEXT.md`
- 任务账本：`tickets.md`

## 部署

推荐 [Cloudflare Pages](https://pages.cloudflare.com/)：构建命令留空，输出目录为仓库根目录。已包含 `_headers`、`_redirects`、`404.html`、`sitemap.xml`。

备选 GitHub Pages：Settings → Pages → Deploy from branch `main` / root。
