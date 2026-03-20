# Claude Code Configuration

This file provides specific guidance for Claude Code when working with the Ebbinghaus Memory project.

## Project Context

- **Name**: Ebbinghaus Memory
- **Type**: Spaced repetition flashcard app with SM-2 algorithm
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL via Prisma
- **Auth**: NextAuth 5 with Credentials provider

## Important Claude Code Guidelines

### Always Read First

Before starting any task, read the root `CLAUDE.md` file for comprehensive project documentation.

### Development Workflow

#### Database Changes

1. Modify `prisma/schema.prisma` first
2. Run `npx prisma generate` after schema changes
3. Create new migrations with `npx prisma migrate dev`
4. Never modify the `generated/` directory directly

#### Code Patterns to Follow

- **TypeScript**: Use strict typing, prefer interfaces over types when possible
- **Component Structure**:
  - Keep components in `app/components/` or `app/(pages)/components/`
  - Use `lucide-react` for icons (e.g., `import { Plus, X } from 'lucide-react'`)
  - Follow the established naming conventions
- **API Routes**: Place in `app/api/` with descriptive names
- **Database Access**: Use the centralized Prisma client in `app/lib/prisma.ts`

### Authentication Context

- Routes are protected via middleware
- Use the `auth()` function from `@/auth` to get session data
- Test account: `test@text.com` / `1234567890`

### SM-2 Algorithm Implementation

- Core logic is in `app/lib/srs-algorithm.ts`
- Database schema includes SM-2 fields in the Card model
- Algorithm states: NEW → LEARNING → REVIEW → RELEARNING
- Quality ratings: 0-5 (0-2 = forgot, 3-5 = remembered)

### File Structure Preferences

- Use route groups for authenticated pages: `app/(pages)/`
- Keep utility functions in `app/lib/`
- Place validation schemas in `app/lib/zod.ts`
- Organize components by feature/section

### Testing Considerations

- The app includes a seed route at `/app/seed/route.ts`
- Test with the provided test account for authentication flows
- Database queries should be optimized for the SM-2 algorithm patterns

### Code Style

- Use ESLint configuration from `eslint.config.mjs`
- Follow React 19 patterns with TypeScript
- Prefer functional components with hooks
- Use Tailwind CSS classes for styling
- Icon components accept optional `className` prop for styling
- avoid using type 'any' as much as possible
- **Component Size**: Keep components small and focused
  - Split large components into multiple sub-components when necessary
  - Aim for components under 200 lines
  - Extract reusable logic into separate hooks
  - Each component should have a single, clear responsibility

### Performance Notes

- The app uses Turbopack for development (`pnpm dev`)
- Prisma client is optimized for Next.js queries
- Card reviews are indexed by `userId` and `nextReviewAt`

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
