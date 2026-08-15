# Tasks

## 已完成任务摘要

系统新增 `apps/mobile` Expo React Native 工作区包。`@ebbinghaus/mobile` 通过 `pnpm install` 自动被 `apps/*` glob 识别；`@ebbinghaus/shared` 以 `workspace:*` 接入。欢迎屏渲染 `REVIEW_BATCH_SIZE = 10` 作为"共享层已打通"的可观察证据。mobile 的 `dev`/`type-check`/`lint` 三个脚本均通过。根 `package.json#pnpm.overrides` 增加 `@types/react 19.1.0` / `@types/react-dom 19.1.0` 锁版本，避免 19.2.14 的 ReactPortal.children breaking change。

意外发现：`pnpm turbo type-check --force` 在 HEAD 上揭示 web 自身 pre-existing TS regression（14 处错误），被 husky pre-commit 的 turbo 缓存假阳性通过隐藏；与本计划无关，留给后续修正 plan。

## 下一个待执行任务

**当前**: 无（本 plan 仅含 T1，已完成；按 ExecPlan 规范，需归档并起草下一份 plan）

## 任务列表

- [x] T1: Expo 脚手架 + monorepo + @ebbinghaus/shared 接入 — tasks/001-scaffold-shared-integration.md