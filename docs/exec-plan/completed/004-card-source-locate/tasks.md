# Tasks

## 已完成任务摘要

T1-T6 全部完成：卡片来源定位功能完整实现。
- shared 层：sourceAnchorSchema + cardSourceSchema + 类型（19 单测）
- Prisma 迁移：六列新增，旧 source 拆分迁移删除（38 URL + 1 provenance）
- 扩展捕获链路：computeSourceAnchor + buildTextFragmentUrl → QueuedWord → CaptureTooltip → toFlashcardDTO 六字段 → API
- web app：API route 持久化六字段，flash-card 渲染来源链接（sourceTitle + ↗ sourceWord）
- 扩展定位：source-locate.ts 纯函数 locate 算法（CSS→context→fragment 三级回退 + retry-fade），Plasmo content-script + webNavigation.onCompleted + manifest `<all_urls>`
- E2E 验证：174 单测全绿，type-check 通过，Prisma 六字段写入/读取 E2E 通过，Text Fragment 解析 E2E 通过，历史数据迁移无丢失。浏览器 E2E 因环境限制未执行，locate 算法由 21 个 jsdom 单测覆盖。

预存失败（非本计划引入）：extension 3 个 storage 测试、web 4 个 Playwright E2E、web lint。

## 下一个待执行任务

**当前**: 无（本计划所有 task 已完成；按 ExecPlan 规范，需归档并起草下一份 plan）

## 任务列表

- [x] T1: shared 层 SourceAnchor 类型 + Zod schema + CreateCardInput 扩展 — tasks/001-shared-types-schema.md
- [x] T2: Prisma schema 迁移 + 历史数据拆分 — tasks/002-prisma-schema-migration.md
- [x] T3: 扩展捕获链路（anchor 计算 + DTO 映射 + 入库） — tasks/003-extension-capture-anchor.md
- [x] T4: web app API 写入 + 卡片背面来源链接渲染 — tasks/004-web-api-and-card-back-render.md
- [x] T5: 扩展定位 content-script + locate 算法 + webNavigation 注册 — tasks/005-extension-locate-content-script.md
- [x] T6: 端到端验证（agent-browser） — tasks/006-e2e-validation.md
- [ ] T3: 扩展捕获链路（anchor 计算 + DTO 映射 + 入库）
- [ ] T4: web app API 写入 + 卡片背面来源链接渲染
- [ ] T5: 扩展定位 content-script + locate 算法 + webNavigation 注册
- [ ] T6: 端到端验证（agent-browser）
