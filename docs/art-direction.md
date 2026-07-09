# 配图唐风 Art Direction（ADR-0008）

## 统一 prompt 模板

```
唐风水墨与工笔结合，{地点或诗意主题}，古画质感，宣纸底色，
色调呼应胭脂红(#9d2933)、黛青、青绿与鎏金点染，
构图留白，无现代建筑，无文字，无水印，无logo，高清插画
```

## 状态字段

- `images[].status = placeholder`：占位图 + 已填 `prompt`
- `images[].status = generated`：已用生图模型生成并替换 `src`

## 版权

全部使用 AI 生成或项目自绘占位，不抓取未授权摄影/馆藏高清图。
