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

- Use route groups for authenticated pages: `app/(pages)/`
- Keep utility functions in `app/lib/`
- Place validation schemas in `app/lib/zod.ts`
- Organize components by feature/section

### Code Style

- avoid using type 'any' as much as possible

## Critical Files Reference

| File                       | Purpose                    |
| -------------------------- | -------------------------- |
| `CLAUDE.md` (root)         | Full project documentation |
| `app/lib/srs-algorithm.ts` | SM-2 algorithm core        |
| `app/lib/prisma.ts`        | Prisma client              |
| `prisma/schema.prisma`     | Database schema            |
| `app/(pages)/layout.tsx`   | Authenticated layout       |
| `auth.config.ts`           | Auth configuration         |

Always ask clarifying questions when there are multiple valid approaches to a task.
