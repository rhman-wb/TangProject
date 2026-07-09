# 数据生产流水线（ADR-0007）

## 流程

1. **AI 起草**：按 PRD 诗人名录与地点范围起草诗文条目、背景故事、坐标建议与配图 prompt。
2. **权威核对**：诗名、作者、全文、出处以《全唐诗》通行本及权威选本核对；争议作品不收录或标注。
3. **人工校验**：坐标在地图上点验；`period` 按 ADR-0001 四段；`scope` 按 ADR-0006 策展；多地点用 `places[{placeId,relation}]`。
4. **分级合入**：
   - **强校验必填**：诗名 / 作者 / 时期 / 全文 / 名句 / 坐标 / 出处（100%）
   - **最小可用**：背景故事、古今对照说明（v1 可简）
5. **机器校验**：`node scripts/validate-data.mjs` 退出码 0 方可合入。

## 命令

```bash
node scripts/generate-dataset.mjs   # 批量生成/刷新结构化 JSON（可选）
node scripts/validate-data.mjs      # 必跑
```

## 禁止

- 仙界 / 梦境等不可定位虚构地点建 `places` 标记（仅可在 `story` 中说明）。
