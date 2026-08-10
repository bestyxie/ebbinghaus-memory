# T4: web app API 写入 + 卡片背面来源链接渲染

**Status**: done
**Started**: 2026-08-10 12:56Z
**Completed**: 2026-08-10 13:00Z

## 目标

web app API 路由正确校验 + 持久化六字段 source block，复习页卡片背面渲染来源链接（sourceTitle + ↗ sourceWord），API 测试覆盖完整 source block。

## 涉及文件

- `apps/web/app/(pages)/review/components/flash-card.tsx` — source 渲染增加 sourceWord 定位提示
- `apps/web/__tests__/api/extension-cards.test.ts` — 新增完整 source block 测试

## 验证方式

    cd apps/web && npx vitest run __tests__/
    pnpm --filter web type-check

预期：85 个单测通过（含新增完整 source block 测试），type-check 通过。

## 执行记录

- T2 已完成 API route 更新（Zod schema + POST/GET 新字段），review 路由用 `include` 自动返回所有 Card 列（含 source 字段），无需改动
- flash-card.tsx：source 链接渲染升级为 spec 设计——`sourceTitle || sourceUrl` 作为标签 + `↗ <em>sourceWord</em>` 作为定位目标提示
- 新增测试 `accepts full source block with anchor, title, and capturedAt`：验证六字段全量写入 Prisma create data，含 capturedAt ISO→Date 转换
- 85 web 单测通过，type-check 通过

## 产出摘要

flash-card 组件渲染来源链接按 spec 设计（sourceTitle + ↗ sourceWord），API 测试覆盖完整六字段 source block。web 85 单测通过，type-check 通过。T2 已完成 API route 层改动，T4 补全 UI 渲染 + 测试覆盖。
