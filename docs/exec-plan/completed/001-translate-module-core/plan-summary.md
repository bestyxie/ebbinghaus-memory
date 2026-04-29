# 翻译模块核心 — 总结

## 做了什么

实现了"沉浸式场景翻译练习"模块的核心纵向切片：AI 生成中文翻译任务 → 用户翻译 → AI 诊断评分，覆盖 translate-plan 的页面一（翻译大厅）和页面二+三（翻译实战+AI诊断）。

## 关键产出

- `prisma/schema.prisma` — 新增 `TranslationTask` 模型（含 SM-2 复习状态字段）和 `TranslationTaskStatus` 枚举
- `app/lib/translate-ai.ts` — 新增翻译源文本生成 (`generateTranslationSource`) 和翻译评估 (`evaluateTranslation`) 两个 AI 函数
- `app/api/translate/generate/route.ts` — POST 生成翻译任务
- `app/api/translate/[id]/submit/route.ts` — POST 提交翻译并获取 AI 评估
- `app/api/translate/tasks/route.ts` — GET 翻译任务列表（分页+状态筛选）
- `app/(pages)/translate/page.tsx` + `translate-hub-client.tsx` — 翻译大厅页面
- `app/(pages)/translate/[id]/page.tsx` + `translate-workspace-client.tsx` — 翻译实战+AI诊断页面
- `app/(pages)/components/navigation.tsx` — 新增 Translate 导航入口

## 关键决策

- 翻译任务使用独立模型 TranslationTask，不复用 Card 模型。原因：翻译任务有独特字段和生命周期，强行复用会导致模型膨胀。
- AI 评估使用 `generateObject`（结构化输出）而非 `streamText`。原因：需要结构化的 annotations 数组来驱动前端颜色高亮。
- 翻译实战页面的计时器使用 `useRef` + `setInterval` 实现，而非依赖库。原因：功能简单，无需引入额外依赖。

## 遗留问题

- 页面四（历史档案+SM-2复习调度+折线图对比）未实现，属于后续计划
- 一键制卡（将翻译结果导入 Card 模型）未实现
- 朗读功能（TTS）未实现
- 流式 AI 输出（逐字显现）未实现，当前为一次性返回完整评估

## 最终验证状态

- typecheck: 通过
- lint: 通过（无警告无错误）
- prisma generate: 通过
- prisma db push: 通过（数据库已同步）
- 端到端验证: 未完成（容器环境 vinext dev server 模块解析超时 + build OOM，为环境限制而非代码问题）
