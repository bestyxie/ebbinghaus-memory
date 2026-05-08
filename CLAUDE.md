# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ebbinghaus Memory — 基于 SM-2 算法的间隔重复记忆卡片应用。Next.js 15 · Prisma 7 · PostgreSQL · better-auth · Tailwind CSS 4。

## Monorepo Structure

```
/
├── apps/web/          # Next.js 应用（页面、API、Prisma、auth）
├── apps/extension/    # Chrome 扩展（Plasmo · 词汇捕获 · 后台同步）
├── packages/shared/   # @ebbinghaus/shared（跨端类型、Zod schemas、常量）
├── docs/              # 文档与规范
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Dev Commands

```bash
pnpm dev / type-check / test / lint / build          # 全局
pnpm --filter web dev / test                         # 单包
pnpm --filter extension dev / build / test           # 扩展
cd apps/web && npx prisma generate / migrate dev     # Prisma
```

## Architecture Invariants

- `srs-algorithm.ts` 纯函数，不碰 DB/网络/全局状态
- `app/lib/` 不导入 React/Next.js（auth.ts cookies、dashboard-data.ts React.cache 例外）
- API 返回 JSON，页面渲染 HTML，边界严格
- 每个 API 路由首行 `requireAuth()`，无路由级 middleware 做 API auth
- 验证在边界做（Zod），lib 内部信任输入已验证
- Card SM-2 状态是扁平列，双轨系统（input + output track）

## 开发环境自体验自验证

完成前端开发后，必须通过 `agent-browser` 在浏览器实际查看效果。

## 规范索引（详细内容见 docs/）

| 规范       | 文件                      | 要点                                               |
| ---------- | ------------------------- | -------------------------------------------------- |
| TypeScript | `docs/TYPESCRIPT.md`      | 禁 `any`/`as`/`!`/`@ts-ignore`（lint 强制）        |
| 测试       | `docs/TESTING.md`         | vitest，100% 覆盖，`__internal` 模式，纵向切片     |
| ExecPlan   | `docs/exec-plan/PLANS.md` | 渐进式迭代，自包含活文档，偏差即修正               |
| 任务拆分   | `docs/exec-plan/TASKS.md` | 纵向切片，只拆下一个，同一时刻最多一个 in-progress |
| 架构详情   | `docs/architecture.md`    | 代码导览、跨切面关注、性能优化                     |
| 功能文档   | `docs/features/*.md`      | 各功能模块详细说明                                 |
| 产品规格   | `docs/production-specs/`  | 产品需求与设计规格                                 |

## Docs 写作规范

- `docs/` 下 token 即成本：一句话能说清不写两句。
- **有 lint 强制执行的规则**：规则名 + 一行摘要，不需要正反示例。
- **没有 lint 兜底的规则**：最小必要示例（一个 ❌ + 一个 ✅）。
- **禁止填充语**："原则是…"、"换句话说…"、"需要注意的是…"。

## Caveat

- `Tag` interface (`{ id, name, color }`) maps to `Deck` model: `id → id`, `name → title`, `color → color`
