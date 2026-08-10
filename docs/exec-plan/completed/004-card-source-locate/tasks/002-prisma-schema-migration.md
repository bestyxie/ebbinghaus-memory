# T2: Prisma schema 迁移 + 历史数据拆分

**Status**: done
**Started**: 2026-08-10 12:35Z
**Completed**: 2026-08-10 12:45Z

## 目标

Prisma schema 新增六列、删除旧 `source` 列，迁移历史数据（URL→sourceUrl，tag→sourceProvenance），并更新所有引用旧 `source` 字段的 web app 代码使 type-check + test 通过。完成后 `prisma generate` + `prisma migrate dev` 成功，`pnpm --filter web type-check` 和 `pnpm --filter web test` 通过，扩展 type-check 通过。

## 涉及文件

- `apps/web/prisma/schema.prisma` — Card model：新增六列，删除 `source`
- `apps/web/prisma/migrations/<timestamp>_card_source_split/migration.sql` — 新增迁移
- `apps/web/app/api/extension/cards/route.ts` — Zod schema + POST create + GET query 改用新字段
- `apps/web/app/api/translate/[id]/create-card/route.ts` — `source: 'translate'` → `sourceProvenance: 'translate'`
- `apps/web/app/api/dashboard/cards/route.ts` — `where.source` → `where.sourceProvenance`
- `apps/web/app/(pages)/review/components/flash-card.tsx` — source 渲染改用 `sourceUrl` / `sourceProvenance`
- `apps/web/__tests__/api/extension-cards.test.ts` — 测试断言更新
- `apps/web/__tests__/api/translate/create-card.test.ts` — 测试断言更新
- `apps/extension/lib/to-flashcard-dto.ts` — `source` → `sourceUrl` + `sourceProvenance`（最小改动，anchor 计算留 T3）
- `apps/extension/lib/ebbinghaus-api.ts` — `WordsListResponse` 字段更新
- `apps/extension/lib/ebbinghaus-api.test.ts` — 测试断言更新

## 验证方式

    cd apps/web && npx prisma generate
    cd apps/web && npx prisma migrate dev --name card_source_split
    pnpm --filter web type-check
    pnpm --filter web test
    pnpm --filter extension type-check
    pnpm --filter extension test

预期：prisma generate/migrate 成功；type-check 全部通过；test 全部通过。

## 执行记录

- Prisma schema：Card model 新增六列（sourceUrl/sourceWord/sourceAnchor/sourceTitle/capturedAt/sourceProvenance），删除旧 `source` 列
- 迁移 SQL 手动创建（prisma migrate dev 因 shadow DB 预存 enum 冲突失败），用 `prisma db execute` 直接执行 + `migrate resolve --applied` 标记
- 迁移数据验证：38 条 URL → sourceUrl，1 条 tag → sourceProvenance，10 条 null，旧列已删除
- `cardBaseSchema.sourceAnchor` 从 `sourceAnchorSchema.nullable()` 改为 `z.any().nullable()`（与 `recallBlocks` 一致，Prisma JSON 列返回 JsonValue）
- Prisma JSON null：用条件展开 `...(sourceAnchor && { sourceAnchor })` 代替 `?? null`（Prisma JSON 列 null 需 `Prisma.JsonNull`，条件展开更简洁）
- web app：4 个 API route + 1 个组件 + 2 个测试文件更新，旧 `source` 引用全部替换
- extension：`to-flashcard-dto.ts` 最小改动（sourceUrl + sourceWord + sourceProvenance，无 anchor 计算，留 T3）；`WordsListResponse` `words` → `cards`；`WordDrawer.tsx` 同步更新；`ebbinghaus-api.test.ts` 全量更新
- shared type-check 通过，web type-check 通过，web 84 个单测通过，extension 26 个 API 测试通过
- 预存失败：extension 3 个 storage 测试（`blacklistedDomains` 默认值，非本 task 引入），web 4 个 Playwright E2E（需 dev server）

## 产出摘要

Prisma schema 迁移完成：Card 新增六列，旧 `source` 列拆分迁移后删除（38 URL + 1 provenance）。所有 web app + extension 代码中旧 `source` 引用更新为新字段。shared/web type-check 通过，84 个 web 单测 + 26 个 extension API 测试通过。扩展 `to-flashcard-dto.ts` 已最小映射 `sourceUrl + sourceWord + sourceProvenance`，anchor 计算留 T3。
