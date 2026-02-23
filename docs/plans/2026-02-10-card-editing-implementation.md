# Card Editing Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a modal-based card editing interface that allows users to update card content (front, back, note) and deck assignment without affecting learned SM-2 algorithm data.

**Architecture:** Modal UI component managed by CardRow state, server action for updates, Prisma for persistence, revalidatePath for automatic data refresh.

**Tech Stack:** Next.js 15 App Router, React 19, useActionState, Prisma 7, Zod validation

---

## Task 1: Add UpdateCardSchema validation

**Files:**
- Modify: `app/lib/zod.ts`

**Step 1: Add updateCardSchema to zod.ts**

Add this schema to `app/lib/zod.ts` (after `createCardSchema`, around line 35):

```typescript
// 卡片编辑验证
export const editCardSchema = z.object({
  cardId: z.string().min(1, "Card ID required"),
  front: z.string().min(1, "Title required"),
  back: z.string().min(1, "Content required"),
  note: z.string().optional(),
  deckId: z.string().optional(),
});
```

**Step 2: Export the type**

Add this line to `app/lib/types.ts` (around line 17):

```typescript
export type EditCardInput = z.infer<typeof editCardSchema>
```

Also add the import at the top:

```typescript
import { z } from 'zod'
import {
  cardBaseSchema,
  deckBaseSchema,
  createCardSchema,
  createDeckSchema,
  updateCardSchema,
  updateDeckSchema,
  editCardSchema,  // Add this
} from './zod'
```

**Step 3: Commit**

```bash
git add app/lib/zod.ts app/lib/types.ts
git commit -m "feat: add editCardSchema validation"
```

---

## Task 2: Create updateCard server action

**Files:**
- Modify: `app/lib/actions.ts`

**Step 1: Add updateCard action**

Add this function to `app/lib/actions.ts` (after `createCard`, around line 124):

```typescript
// 更新卡片
export async function updateCard(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // 验证表单数据
  const validated = editCardSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const { cardId, front, back, note, deckId } = validated.data;
  const userId = session.user.id;

  // 验证卡片属于当前用户
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      userId,
    },
    include: {
      cardDecks: true,
    },
  });

  if (!card) {
    return { error: "Card not found" };
  }

  try {
    // 如果选择了 deckId，验证该 deck 属于当前用户且未被删除
    if (deckId) {
      const deck = await prisma.deck.findFirst({
        where: {
          id: deckId,
          userId,
          deletedAt: null,
        },
      });
      if (!deck) {
        return { error: "Invalid deck" };
      }
    }

    // 更新卡片（只修改内容，保留 SM-2 算法数据）
    await prisma.card.update({
      where: { id: cardId },
      data: {
        front,
        back,
        note: note || null,
      },
    });

    // 更新 CardDeck 关系（如果 deckId 改变了）
    if (deckId !== undefined) {
      // 删除旧的关联
      await prisma.cardDeck.deleteMany({
        where: { cardId },
      });

      // 如果新 deckId 不为空，创建新关联
      if (deckId) {
        await prisma.cardDeck.create({
          data: {
            cardId,
            deckId,
          },
        });
      }
    }

    // Revalidate dashboard page to refresh server components
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error("updateCard error:", error);
    return { error: "Failed to update card" };
  }
}
```

**Step 2: Add import for editCardSchema**

Add to the imports at the top of `app/lib/actions.ts`:

```typescript
import { createCardSchema, editCardSchema } from './zod'
```

**Step 3: Commit**

```bash
git add app/lib/actions.ts
git commit -m "feat: add updateCard server action"
```

---

## Task 3: Create EditCardModal component

**Files:**
- Create: `app/(pages)/dashboard/components/edit-card-modal.tsx`

**Step 1: Create the component file**

Create `app/(pages)/dashboard/components/edit-card-modal.tsx` with this content:

```typescript
"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { updateCard } from "@/app/lib/actions";
import {
  CloseIcon,
  CheckIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
  ListIcon,
} from "../../../components/ui/icons";
import { DeckSelector } from "./deck-selector";
import { CardWithDeck } from "@/app/lib/types";

interface EditCardModalProps {
  card: CardWithDeck;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCardModal({ card, isOpen, onClose }: EditCardModalProps) {
  const [state, formAction, isPending] = useActionState(updateCard, null);
  const hasHandledSuccess = useRef(false);

  // Close modal on success (revalidatePath handles data refresh automatically)
  useEffect(() => {
    if (state?.success && !isPending && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      onClose();
    }
  }, [state?.success, isPending, onClose]);

  // Reset the success handler when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasHandledSuccess.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form action={formAction} className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-[720px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Edit Knowledge Point</h2>
            <p className="text-sm text-slate-500 mt-1">
              Update your knowledge point content.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <CloseIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
          {/* Card ID (hidden) */}
          <input type="hidden" name="cardId" value={card.id} />

          {/* Title & Hint */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                name="front"
                required
                defaultValue={card.front}
                placeholder="e.g., Photosynthesis Basics"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hint</label>
              <input
                name="note"
                defaultValue={card.note || ""}
                placeholder="A brief reminder for front"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Detailed Content</label>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="flex gap-1 p-2 border-b border-slate-200 bg-slate-50">
                <button type="button" className="p-2 hover:bg-slate-200 rounded">
                  <BoldIcon />
                </button>
                <button type="button" className="p-2 hover:bg-slate-200 rounded">
                  <ItalicIcon />
                </button>
                <button type="button" className="p-2 hover:bg-slate-200 rounded">
                  <UnderlineIcon />
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1" />
                <button type="button" className="p-2 hover:bg-slate-200 rounded">
                  <LinkIcon />
                </button>
                <button type="button" className="p-2 hover:bg-slate-200 rounded">
                  <ListIcon />
                </button>
              </div>
              <textarea
                name="back"
                required
                defaultValue={card.back}
                placeholder="Describe knowledge point in detail..."
                className="w-full h-36 p-4 resize-none focus:outline-none"
              />
            </div>
          </div>

          {/* Deck Selector with default value */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (Deck)</label>
            <div className="flex gap-2">
              <select
                name="deckId"
                defaultValue={card.deck?.id || ""}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No deck</option>
                {/* Options will be populated by DeckSelector */}
                {card.deck && (
                  <option key={card.deck.id} value={card.deck.id}>
                    {card.deck.title}
                  </option>
                )}
              </select>
              {/* Note: We'll use inline deck options here instead of component to avoid double mounting */}
            </div>
          </div>

          {/* Error Display */}
          {state?.error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg">
              {state.error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckIcon />
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/(pages)/dashboard/components/edit-card-modal.tsx
git commit -m "feat: add EditCardModal component"
```

---

## Task 4: Update CardRow to use EditCardModal

**Files:**
- Modify: `app/(pages)/dashboard/components/card-row.tsx`

**Step 1: Add import for EditCardModal**

Add to imports at top of file:

```typescript
import { EditCardModal } from './edit-card-modal';
```

**Step 2: Add state for modal**

Add this state inside the CardRow component (after the props interface):

```typescript
export function CardRow({ card, sortBy = 'nextReviewAt', sortOrder = 'asc', deckId }: CardRowProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // ... rest of the component
```

**Step 3: Update edit button click handler**

Find the edit button (around line 120) and update the onClick:

```typescript
<button
  onClick={() => setIsEditModalOpen(true)}
  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
  aria-label={`Edit ${card.front}`}
  title="Edit card"
>
  <Pencil className="h-4 w-4" />
</button>
```

**Step 4: Add EditCardModal component**

Add this at the end of the component, just before the closing `}` (around line 142):

```typescript
return (
  <>
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      {/* ... existing tr content ... */}
    </tr>

    <EditCardModal
      card={card}
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
    />
  </>
);
```

Also wrap the return in a fragment `<>...</>` instead of just `<tr>...</tr>`.

**Step 5: Commit**

```bash
git add app/(pages)/dashboard/components/card-row.tsx
git commit -m "feat: integrate EditCardModal into CardRow"
```

---

## Task 5: Test the implementation

**Files:**
- No new files

**Step 1: Start development server**

```bash
cd .worktrees/feature/card-edit
pnpm dev
```

**Step 2: Manual testing checklist**

1. Navigate to `/dashboard`
2. Find a card in the table
3. Click the pencil (edit) icon
4. Verify modal opens with card's current data
5. Modify the title and save
6. Verify modal closes and table shows updated title
7. Repeat for content field
8. Repeat for hint field
9. Try changing deck assignment
10. Try saving without changes (should work)
11. Try submitting empty required fields (should show validation error)
12. Verify SM-2 data (easeFactor, interval) is unchanged

**Step 3: Optional - Add automated tests**

If tests are added to the project, they would be in a test directory following the project's testing conventions.

**Step 4: Final commit if any fixes needed**

If any bugs were found and fixed:

```bash
git add .
git commit -m "fix: <description of fix>"
```

---

## Completion

After all tasks are complete:

1. Run `pnpm lint` to ensure no linting errors
2. Run `pnpm build` to verify production build succeeds
3. Review the implementation in the browser

When ready to merge:

```bash
# Push to remote
git push -u origin feature/card-edit

# Create PR using gh CLI or web interface
gh pr create --title "feat: add card editing functionality" --body "Adds modal-based card editing interface for updating content and deck assignment without affecting SM-2 algorithm data."
```

Or use the `finishing-a-development-branch` skill to review and merge.
