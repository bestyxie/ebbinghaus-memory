# 翻译模块第二阶段 — 总结

## 做了什么

实现了 translate-plan 中页面三（知识入库）和页面四（历史档案+复习调度）的核心功能：SM-2 复习调度、一键制卡、增强历史档案、任务详情 API。

## 关键产出

- `app/api/translate/[id]/submit/route.ts` — 集成 SM-2 算法，score→quality 映射，更新复习调度字段
- `app/api/translate/[id]/create-card/route.ts` — POST 一键制卡，支持 deckId 关联
- `app/api/translate/tasks/[id]/route.ts` — GET 单任务详情
- `app/(pages)/translate/[id]/translate-workspace-client.tsx` — 新增制卡按钮和弹窗（front/back 预填 + deck 选择）
- `app/(pages)/translate/translate-hub-client.tsx` — 增强历史档案（搜索 + 主题筛选 + 状态筛选 + 难度 badge）

## 验证状态

- typecheck: 通过
- lint: 通过
- 端到端验证: 通过（agent-browser 完整测试了生成→翻译→AI 诊断→制卡→历史档案流程）

## 遗留问题

- TTS 朗读功能未实现
- 流式 AI 输出未实现（当前为一次性返回）
- 折线图对比（重译时的历史得分对比）未实现
