# T1: shared 层 SourceAnchor 类型 + Zod schema + CreateCardInput 扩展

**Status**: done
**Started**: 2026-08-10 12:25Z
**Completed**: 2026-08-10 12:32Z

## 目标

`packages/shared` 新增 `SourceAnchor` / `CardSource` 类型 + Zod schema，`createCardSchema` 和 `cardBaseSchema` 新增六字段。完成后 `pnpm --filter shared type-check` 和 `pnpm --filter shared test` 通过，新类型可被 `apps/extension` 和 `apps/web` 导入。

## 涉及文件

- `packages/shared/src/zod.ts` — 新增 `sourceAnchorSchema`、`cardSourceSchema`；`createCardSchema` 新增六字段；`cardBaseSchema` 新增六字段
- `packages/shared/src/types.ts` — 新增 `SourceAnchor`、`CardSource` 类型导出
- `packages/shared/src/__tests__/source-anchor.unit.test.ts` — 新增，测试 `sourceAnchorSchema` 和 `cardSourceSchema` 边界解析

## 验证方式

    pnpm --filter shared type-check
    pnpm --filter shared test

预期：type-check 无错误；test 全部通过，含新增的 source-anchor 测试用例。

## 执行记录

- 读取 `packages/shared/src/zod.ts`、`types.ts`、`index.ts`，确认现有 schema 结构
- `zod.ts`：新增 `sourceAnchorSchema`、`cardSourceSchema`；`createCardSchema` 移除旧 `source` 字段，新增六字段（sourceUrl/sourceWord/sourceAnchor/sourceTitle/capturedAt/sourceProvenance）；`cardBaseSchema` 同步更新
- `types.ts`：新增 `SourceAnchor`、`CardSource` 类型导出，import 更新
- 新增 `src/__tests__/source-anchor.unit.test.ts`：19 个测试用例覆盖 sourceAnchorSchema（7）、cardSourceSchema（6）、createCardSchema source 字段（6）
- type-check 通过，test 19/19 通过
- lint：web 有 pre-existing `ai-memory-modal.tsx` lint 错误（`a.getSource is not a function`），stash 确认非本 task 引入

## 产出摘要

新增 `sourceAnchorSchema`、`cardSourceSchema` 两个 Zod schema 和 `SourceAnchor`、`CardSource` 两个类型。`createCardSchema` 和 `cardBaseSchema` 移除旧 `source` 字段，新增六字段（五字段原子化来源定位 + sourceProvenance）。19 个单测全部通过。注意：旧 `source` 字段从 schema 移除，但 Prisma `Card.source` 列和 web API 路由仍引用它，T2/T4 中同步更新。
