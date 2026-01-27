# Tag/Deck Management System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement deck (called "tags" in UI) creation, management, and display using many-to-many relationship

**Architecture:** 
- Add `color` and `deletedAt` fields to Deck model
- **Create junction table `CardDeck` for many-to-many relationship** (BEST PRACTICE)
- Remove `deckId` foreign key from Card model
- When deck deleted: cascade delete only relation records (cards preserved)
- Create API routes for deck CRUD operations
- Convert sidebar tags section to client component with modal integration

**Tech Stack:** 
- Next.js 15 (App Router), Prisma 7, PostgreSQL
- Many-to-many relationship: Card ↔ CardDeck ↔ Deck
- Updated Deck model: `id`, `title`, `description`, `color`, `deletedAt`, `createdAt`, `updatedAt`, `userId`
- Junction table: `CardDeck(cardId, deckId)` with automatic cascade
- Client components for interactivity, server actions for mutations
- TypeScript with Zod validation

**Important Note:** UI uses "tags" terminology but database uses "Deck" model. This is intentional - "tags" are organizational units (decks) for grouping cards.

**Best Practice Design Decisions:**

1. **Many-to-Many Junction Table** (SUPERIOR APPROACH)
   - Create `CardDeck` relation table
   - Remove `deckId` foreign key from Card model
   - Cards can belong to multiple decks (future flexibility)
   - When deck deleted: cascade delete relation records only
   - Benefits:
     - ✅ Clean cascade (Prisma handles automatically)
     - ✅ Cards never have NULL deck references
     - ✅ No manual transaction needed
     - ✅ A card can be in multiple decks (future feature)
     - ✅ Relations are first-class entities
     - ✅ Data integrity enforced by database

2. **Soft Delete**: Uses `deletedAt` timestamp
   - Preserves data for recovery/auditing
   - Filter queries with `WHERE deletedAt IS NULL`

3. **Color Field**: Stored in database as hex string

---

## Task 1: Update Database Schema with Junction Table

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Add CardDeck junction table and update models**

Locate and update the models in schema:

First, add the junction table (insert after User model, before Deck):

```prisma
// 关系表：卡片-卡组 多对多关系
model CardDeck {
  cardId     String
  deckId     String
  
  card       Card   @relation(fields: [cardId], references: [id], onDelete: Cascade)
  deck       Deck   @relation(fields: [deckId], references: [id], onDelete: Cascade)
  
  @@id([cardId, deckId])
  @@index([cardId])
  @@index([deckId])
}
```

Then update the Deck model (around lines 20-37):

```prisma
// 3. 卡组表 (Deck) - 类似于文件夹，比如 "英语四级", "前端面试题"
model Deck {
  id          String   @id @default(cuid())
  title       String
  description String?
  color       String?  @default("#137fec") // 标签颜色 (hex)
  isPublic    Boolean  @default(false) // 是否公开给其他人使用
  deletedAt   DateTime? // 软删除时间戳 (null = 未删除)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  cardDecks   CardDeck[] // Changed from 'cards'

  // 在同一个 userId 下，title 不能重复。
  // 但是不同用户可以使用相同的 title。
  @@unique([userId, title])
}
```

Then update the Card model (around lines 40-75):

```prisma
// 4. 卡片表 (Card) - ★★★ 最核心的部分 ★★★
model Card {
  id          String   @id @default(cuid())
  front       String   // 卡片正面（问题），支持 Markdown 或 HTML
  back        String   // 卡片背面（答案）
  note        String?  // 助记提示
  
  // --- 艾宾浩斯/SM-2 算法所需字段 ---
  
  // 下一次需要复习的具体时间点
  nextReviewAt DateTime @default(now()) 

  // 当前间隔天数 (Interval)
  interval     Int      @default(0)

  // 熟悉度因子 (Ease Factor / E-Factor)
  easeFactor   Float    @default(2.5)

  // 连续正确次数 (Repetitions)
  repetitions  Int      @default(0)

  // 卡片状态
  state        CardState @default(NEW)
  
  // --- 关系 ---
  cardDecks    CardDeck[] // Changed from 'deckId' and 'deck'
  
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  logs        ReviewLog[] // 关联历史复习记录

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, nextReviewAt]) // 建立索引，加速查询"今天需要复习的卡片"
}
```

**Step 2: Create migration**

Run:
```bash
npx prisma migrate dev --name add_card_deck_junction_table_and_deck_color
```

Expected: 
- New migration file created
- CardDeck junction table created
- Card model: deckId and deck fields removed
- Deck model: cards field replaced with cardDecks
- Deck: color and deletedAt columns added
- Data migration: Existing card-deck relations moved to CardDeck table

**Step 3: Generate Prisma client**

Run:
```bash
npx prisma generate
```

Expected: Updated types in `generated/prisma/client/`

**Step 4: Verify migration**

Run:
```bash
npx prisma studio
```

Verify:
- CardDeck table exists with cardId and deckId
- Card table no longer has deckId field
- Deck table has color and deletedAt fields
- Existing relations migrated to CardDeck

**Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ generated/prisma/
git commit -m "feat: add CardDeck junction table, deck color, and soft delete"
```

---

## Task 2: Update Existing Code to Use Junction Table

**Files:**
- Modify: `app/api/dashboard/cards/route.ts`
- Modify: `app/(pages)/dashboard/components/create-card-modal.tsx`

**Step 1: Update cards API to work with junction table**

Update `app/api/dashboard/cards/route.ts` query (around line 50):

```typescript
    const cards = await prisma.card.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        cardDecks: {
          where: {
            deck: {
              deletedAt: null, // Only include non-deleted decks
            },
          },
          include: {
            deck: {
              select: {
                id: true,
                title: true,
                color: true,
              },
            },
          },
        },
      },
    });
```

Then transform the data before returning:

```typescript
    // Transform cardDecks to deck (single deck per card for now)
    const transformedCards = cards.map(card => ({
      ...card,
      deck: card.cardDecks[0]?.deck || null, // Take first deck, or null
    }));

    return NextResponse.json({
      cards: transformedCards,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
```

**Step 2: Update create-card-modal to work with junction table**

Find where cards are created and update to use junction table.

**Step 3: Commit**

```bash
git add app/api/dashboard/cards/route.ts app/\(pages\)/dashboard/components/create-card-modal.tsx
git commit -m "refactor: update card queries to use CardDeck junction table"
```

---

## Task 3: Create Deck API Routes

**Files:**
- Create: `app/api/decks/route.ts`
- Create: `app/api/decks/[id]/route.ts`

**Step 1: Create deck list and create route**

Create `app/api/decks/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const createDeckSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isPublic: z.boolean().optional().default(false),
});

// GET - Fetch all user's decks with card counts
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decks = await prisma.deck.findMany({
      where: { 
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: { cardDecks: true }, // Count relations instead of cards
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
      { status: 500 }
    );
  }
}

// POST - Create new deck
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, color, isPublic } = createDeckSchema.parse(body);

    const existing = await prisma.deck.findFirst({
      where: {
        userId: session.user.id,
        title: title,
        deletedAt: null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Deck name already exists' },
        { status: 409 }
      );
    }

    const deck = await prisma.deck.create({
      data: {
        title,
        description,
        color: color || '#137fec',
        isPublic,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ deck }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating deck:', error);
    return NextResponse.json(
      { error: 'Failed to create deck' },
      { status: 500 }
    );
  }
}
```

**Step 2: Create deck delete route with cascade**

Create `app/api/decks/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';

// DELETE - Soft delete a deck
// BENEFIT: Prisma automatically cascades delete to CardDeck relations
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify deck exists and belongs to user
    const deck = await prisma.deck.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: { cardDecks: true },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const relationCount = deck._count.cardDecks;

    // Soft delete the deck
    // Prisma will automatically cascade delete CardDeck relations
    // due to onDelete: Cascade in the schema
    await prisma.deck.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true,
      message: relationCount > 0
        ? `Deck "${deck.title}" deleted. ${relationCount} card-deck relations removed.`
        : `Deck "${deck.title}" deleted.`,
      removedRelationCount: relationCount,
    });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json(
      { error: 'Failed to delete deck' },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit**

```bash
git add app/api/decks/
git commit -m "feat: add deck API routes with automatic cascade delete"
```

---

## Task 4: Update TagsModal to Work with Decks

**Files:**
- Modify: `app/components/tags-modal.tsx`

**Step 1: Update Tag interface**

Replace the Tag interface (lines 15-19):

```typescript
export interface Tag {
  id: string;
  name: string;
  color: TagColor;
}
```

**Step 2: Keep rest of modal as-is**

The modal works perfectly with the new Deck structure.

**Step 3: Commit**

```bash
git add app/components/tags-modal.tsx
git commit -m "refactor: update TagsModal for Deck model"
```

---

## Task 5: Create Client-Side Tags Section

**Files:**
- Create: `app/(pages)/components/sidebar-tags-section.tsx`

**Step 1: Create the component**

Create `app/(pages)/components/sidebar-tags-section.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from '../../components/ui/icons';
import { TagsModal, Tag } from '../../components/tags-modal';

interface DeckResponse {
  decks: Array<{
    id: string;
    title: string;
    description: string | null;
    color: string | null;
    _count: {
      cardDecks: number;
    };
  }>;
}

export function SidebarTagsSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDecks() {
      try {
        const response = await fetch('/api/decks');
        if (!response.ok) throw new Error('Failed to fetch');
        const data: DeckResponse = await response.json();
        
        const convertedTags: Tag[] = data.decks.map(deck => ({
          id: deck.id,
          name: deck.title,
          color: (deck.color || '#137fec') as any,
        }));
        
        setTags(convertedTags);
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDecks();
  }, []);

  const handleUpdateTags = async (newTags: Tag[]) => {
    const currentIds = new Set(tags.map(t => t.id));
    const newIds = new Set(newTags.map(t => t.id));
    
    const addedTags = newTags.filter(t => !currentIds.has(t.id));
    
    for (const tag of addedTags) {
      try {
        const response = await fetch('/api/decks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: tag.name,
            description: '',
            color: tag.color,
            isPublic: false,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setTags(prev => prev.map(t => 
            t.id === tag.id ? { ...t, id: data.deck.id } : t
          ));
        }
      } catch (error) {
        console.error('Error creating deck:', error);
      }
    }
    
    const removedTags = tags.filter(t => !newIds.has(t.id));
    
    for (const tag of removedTags) {
      if (tag.id.startsWith('deck-temp-')) continue;
      
      try {
        await fetch(`/api/decks/${tag.id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error deleting deck:', error);
      }
    }
    
    setTags(newTags);
  };

  return (
    <>
      <div className="px-5 py-4">
        <div className="text-sm font-semibold text-gray-700 mb-4">
          Tags ({tags.length})
        </div>
        
        {loading ? (
          <div className="text-sm text-gray-400">Loading tags...</div>
        ) : (
          <div>
            {tags.map((tag) => (
              <button
                key={tag.id}
                className="flex items-center w-full h-10 px-3 rounded-md mb-2 text-left hover:bg-gray-50 transition-colors group"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2 shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {tag.name}
                </span>
              </button>
            ))}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center w-full h-10 px-3 rounded-md text-left text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="w-[18px] h-[22px] shrink-0 text-gray-400" />
              <span className="ml-2 text-sm font-medium">New Tag</span>
            </button>
          </div>
        )}
      </div>

      <TagsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tags={tags}
        onUpdateTags={handleUpdateTags}
      />
    </>
  );
}
```

**Step 4: Commit**

```bash
git add app/\(pages\)/components/sidebar-tags-section.tsx
git commit -m "feat: add client-side decks/tags section"
```

---

## Task 6: Update Sidebar and Dashboard

**Files:**
- Modify: `app/(pages)/components/sidebar.tsx`
- Modify: `app/(pages)/dashboard/components/card-table.tsx`
- Modify: `app/(pages)/dashboard/components/card-row.tsx`

Similar updates as before, but working with junction table structure.

---

## Task 7: Test the Implementation

**Step 1: Test deck creation**

1. Create deck with color
2. Verify in Prisma Studio: deck exists with color
3. Verify in sidebar: colored dot appears

**Step 2: Test deck deletion with cascade (CRITICAL)**

1. Create deck "Test"
2. Assign cards to deck (creates CardDeck relations)
3. Delete "Test" deck
4. Verify in Prisma Studio:
   - Deck has deletedAt timestamp
   - CardDeck records for this deck are DELETED (cascade worked!)
   - Cards still exist (no card data lost)
5. Verify in UI: Deck gone from sidebar, cards show "No deck"

**Step 3: Verify automatic cascade**

Check that no manual transaction is needed - Prisma handles it via schema:
```prisma
onDelete: Cascade  // In CardDeck relation definition
```

---

## Completion Checklist

- [ ] CardDeck junction table created
- [ ] Card model: deckId and deck removed, cardDecks added
- [ ] Deck model: color and deletedAt added, cards replaced with cardDecks
- [ ] Migration successful with data migration
- [ ] API routes work with junction table
- [ ] Deck deletion cascades to CardDeck automatically
- [ ] Cards preserved when deck deleted
- [ ] No orphaned relations in database
- [ ] All tests pass

## Best Practices Implemented

✅ **Many-to-Many Junction Table**: Clean separation of concerns
✅ **Automatic Cascade**: Prisma handles CardDeck deletion via schema
✅ **No NULL Handling**: Cards never have nullable deck references
✅ **Future Flexibility**: Cards can belong to multiple decks
✅ **Data Integrity**: Enforced by database foreign key constraints
✅ **Query Simplicity**: No complex transactions needed
✅ **Soft Delete**: Preserves decks for audit/recovery

## Why Junction Table is Superior

1. **Automatic Cascade**: Database handles cascade, no manual transaction
2. **No Orphaned Data**: Relations are explicit entities
3. **NULL-Free**: Cards don't need nullable deckId field
4. **Many-to-Many**: Cards can be in multiple decks (future feature)
5. **Clean Schema**: Relations are first-class citizens
6. **Performance**: Indexed for fast queries in both directions
7. **Flexibility**: Easy to add metadata to relations (e.g., addedAt)
