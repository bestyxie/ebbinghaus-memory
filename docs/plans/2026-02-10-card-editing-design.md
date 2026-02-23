# Card Editing Feature Design

**Date**: 2026-02-10
**Status**: Designed

## Overview

A card editing modal that allows users to update the content (front, back, note) and deck assignment of an existing card, without affecting the learned SM-2 algorithm data (easeFactor, interval, repetitions, state).

## Key Design Decisions

- **Modal UI**: Reuses the same visual pattern as CreateCardModal for consistency
- **Content-only editing**: Preserves learning progress - users can fix typos or improve explanations without resetting their memory curve
- **Self-contained state**: Each CardRow manages its own modal state, keeping the component simple and independent
- **Server action pattern**: Follows the same useActionState pattern as card creation

## Architecture

```
CardRow (client component)
  └─ EditCardModal (new client component)
       └─ useActionState → updateCard (new server action)
            └─ Prisma update
            └─ revalidatePath('/dashboard')
```

## Components & Files

### 1. EditCardModal Component (New)

**File**: `app/(pages)/dashboard/components/edit-card-modal.tsx`

**Props**:
```typescript
interface EditCardModalProps {
  card: CardWithDeck;
  isOpen: boolean;
  onClose: () => void;
}
```

**Structure**:
- Header: "Edit Knowledge Point" with close button
- Form fields (pre-filled):
  - Title (front) - required text input
  - Hint (note) - optional text input
  - Detailed Content (back) - required textarea with toolbar
  - Deck Selector - dropdown for deck assignment
- Footer: Cancel and "Save Changes" buttons
- Error display: Validation/server errors below form

**Differences from CreateCardModal**:
- No difficulty selector
- Form fields pre-populated with card data
- Hidden input for cardId
- Button text: "Save Changes" / "Saving..."

### 2. updateCard Server Action (New)

**File**: `app/lib/actions.ts`

**Function signature**:
```typescript
export async function updateCard(prevState: unknown, formData: FormData)
```

**Flow**:
1. Auth check - get current user
2. Extract cardId from formData
3. Validate with updateCardSchema
4. Verify card belongs to current user
5. If deckId provided, verify deck belongs to user
6. Update card (front, back, note only)
7. Update CardDeck relation if deckId changed
8. revalidatePath('/dashboard')
9. Return { success: true } or { error: "message" }

### 3. Validation Schema (New)

**File**: `app/lib/zod.ts`

```typescript
export const updateCardSchema = z.object({
  cardId: z.string().min(1, "Card ID required"),
  front: z.string().min(1, "Title required"),
  back: z.string().min(1, "Content required"),
  note: z.string().optional(),
  deckId: z.string().optional(),
});
```

### 4. CardRow Integration (Modify)

**File**: `app/(pages)/dashboard/components/card-row.tsx`

**Changes**:
- Add state: `const [isEditModalOpen, setIsEditModalOpen] = useState(false)`
- Update edit button: `onClick={() => setIsEditModalOpen(true)}`
- Add EditCardModal component at bottom

## Data Flow

### Update Strategy

**Content fields**: Update `front`, `back`, `note`

**Deck relationship**:
- If deckId changes: delete old CardDeck, create new one
- If deckId same: no changes to relation

**Preserved fields** (NOT modified):
- `easeFactor` - learned difficulty
- `interval` - days until next review
- `repetitions` - correct answer count
- `state` - NEW/LEARNING/REVIEW/RELEARNING
- `nextReviewAt` - scheduled review time

**Auto-refresh**: `revalidatePath('/dashboard')` triggers card-table-server.tsx to refetch data

## Error Handling

1. **Client-side**: HTML5 `required` attributes
2. **Server-side**: Zod schema validation
3. **Ownership check**: `card.userId === session.user.id`
4. **Deck validation**: Prevent assigning to invalid deck
5. **Database**: Try/catch around Prisma operations

**Error display**: Red box below form (same as CreateCardModal)

## Security

- Verify card ownership before update
- Verify deck ownership if deckId provided
- Prevent unauthorized updates
- User cannot modify other users' cards

## Testing Considerations

- Edit card content - verify fields update correctly
- Change deck assignment - verify relationship updates
- Leave fields unchanged - verify only modified fields update
- Submit empty required fields - verify validation errors
- Edit other user's card (should fail auth)
- Assign to non-existent deck - should show error
- SM-2 data unchanged - verify easeFactor, interval, repetitions preserved
- Modal close on success - verify automatic close
- Data refresh - verify table shows updated data after save
