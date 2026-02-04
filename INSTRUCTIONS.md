# 🚀 Parallel Session Setup Instructions

## Step 1: Create a Git Worktree

Open a new terminal and run:

```bash
# Create worktree for this feature
git worktree add ../ebbinghaus-memory-tags main

# Navigate to the worktree
cd ../ebbinghaus-memory-tags

# Install dependencies
pnpm install
```

## Step 2: Start a New Claude Code Session

In the worktree directory, start a new Claude Code session:

```bash
cd ../ebbinghaus-memory-tags
claude
```

## Step 3: Load the Execution Skill

Once in the new session, invoke the executing-plans skill:

```
@superpowers:executing-plans
```

Then provide the plan location:

```
I need you to execute the implementation plan at: docs/plans/2026-01-26-tag-system-implementation.md

This plan implements a deck/tag management system with:
- CardDeck junction table for many-to-many relationships
- Soft delete pattern
- Color field on Deck model
- Sidebar integration

Please execute task by task, following the plan exactly.
```

## Step 4: Monitor Progress

The autonomous session will:
- Execute tasks sequentially
- Commit after each task
- Create checkpoints at key milestones
- Report progress back to you

## Key Files Created

- **Database Schema**: `prisma/schema.prisma` (CardDeck table added)
- **API Routes**: `app/api/decks/route.ts`, `app/api/decks/[id]/route.ts`
- **Components**: `app/(pages)/components/sidebar-tags-section.tsx`
- **Modal**: `app/components/tags-modal.tsx` (already exists)

## Checkpoints

The session will pause at these checkpoints for verification:
1. ✅ After database migration (Task 1)
2. ✅ After API routes created (Task 3)
3. ✅ After integration complete (Task 6)

## Return to This Session

Once complete, return here and I'll help you:
- Review the implementation
- Run tests
- Fix any issues
- Merge the worktree back to main

---

**Ready?** Open a new terminal and follow the steps above! 🚀
