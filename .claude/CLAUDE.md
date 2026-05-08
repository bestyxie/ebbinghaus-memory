# Claude Code Configuration

This file provides specific guidance for Claude Code when working with the Ebbinghaus Memory project.

## Important Claude Code Guidelines

### Always Read First

Before starting any task, read the root `CLAUDE.md` file for comprehensive project documentation.

### Development Workflow

#### Code Patterns to Follow

- **Component Structure**:
  - Use `lucide-react` for icons (e.g., `import { Plus, X } from 'lucide-react'`)
  - Follow the established naming conventions
- **API Routes**: Place in `app/api/` with descriptive names

### Authentication Context

- Routes are protected via middleware
- Test account: `test@test.com` / `1234567890`

### File Structure Preferences

- Use route groups for authenticated pages: `apps/web/app/(pages)/`
- Keep utility functions in `apps/web/app/lib/`
- Shared types and schemas: `packages/shared/src/`
- Import shared types via `@ebbinghaus/shared`
- Organize components by feature/section

### Code Style

- No `any`, no `as` assertions, no `!` non-null assertions, no `@ts-ignore`（all lint-enforced）
- Shared types/schemas: `import { ... } from '@ebbinghaus/shared'`

## Critical Files Reference

| File                                | Purpose                    |
| ----------------------------------- | -------------------------- |
| `CLAUDE.md` (root)                  | 规范总入口（TypeScript/测试/ExecPlan/架构） |
| `packages/shared/src/types.ts`      | Cross-platform types       |
| `packages/shared/src/zod.ts`        | Zod validation schemas     |
| `apps/web/app/lib/srs-algorithm.ts` | SM-2 algorithm core        |
| `apps/web/app/lib/prisma.ts`        | Prisma client              |
| `apps/web/prisma/schema.prisma`     | Database schema            |
| `apps/web/app/(pages)/layout.tsx`   | Authenticated layout       |
| `apps/extension/`                   | Chrome 扩展（Plasmo）      |
| `apps/extension/lib/ebbinghaus-api.ts` | Extension API client    |
| `apps/extension/background/`        | 后台同步队列               |
| `docs/architecture.md`              | 高层架构详情与代码导览     |
| `docs/features/`                    | 各功能模块详细说明         |
