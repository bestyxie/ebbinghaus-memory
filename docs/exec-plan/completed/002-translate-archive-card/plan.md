# 翻译模块第二阶段：历史档案 + SM-2 复习调度 + 一键制卡

## Purpose

补全 translate-plan 中页面三（知识入库）和页面四（历史档案+复习调度）的核心功能。用户完成翻译后，可以将生词/地道表达一键制卡，历史任务支持筛选和 SM-2 复习调度。

## Plan of Work

### T1: SM-2 复习调度集成
- 翻译提交后，根据 score 映射为 SM-2 quality（0-5），调用 `calculateReview` 更新 TranslationTask 的 SM-2 字段
- score < 60 → quality 1, 60-69 → 2, 70-79 → 3, 80-89 → 4, 90+ → 5
- status 逻辑：score >= 80 → COMPLETED，score < 80 → NEEDS_REVIEW
- 修改 submit route 加入 SM-2 计算

### T2: 一键制卡 API
- `POST /api/translate/[id]/create-card` — 从翻译结果创建 Card
- 支持两种模式：选词制卡（front=词, back=释义）和整句 Cloze 制卡
- 接收 deckId（可选）、cardType、front、back、clozeText 等字段
- Card 的 source 标记为 "translate"

### T3: 翻译诊断页增加制卡交互
- 润色区域增加"提取生词制卡"按钮 → 弹出制卡弹窗
- 地道表达区域增加"整句生成填空卡"按钮 → 弹出制卡弹窗
- 制卡弹窗：front/back 预填，deck 下拉选择（可选），确认创建

### T4: 增强历史档案（页面四）
- 翻译大厅的历史列表升级：搜索、主题筛选、状态筛选
- 任务卡片视图（主题、难度、得分、SM-2 状态标签）
- NEEDS_REVIEW 任务标记 🔴，COMPLETED 且巩固标记 🟢
- "立即重译"按钮直接进入 workspace

### T5: 获取单个任务 API
- `GET /api/translate/tasks/[id]` — 单独获取任务详情（workspace 页面需要）

## Validation
- type-check + lint 通过
- 提交翻译后 SM-2 字段正确更新
- 一键制卡能创建 Card 并关联到指定 deck
- 历史列表支持筛选
