# 数据库结构

## 概述

使用 **PostgreSQL** 数据库，通过 **Prisma 7** ORM 管理。Schema 文件位于 `/workspace/prisma/schema.prisma`。

---

## 数据模型关系图

```
┌────────────┐       ┌──────────────┐       ┌─────────────┐
│    User    │       │   Session    │       │   Account   │
│ ─────────  │ 1───N │ ──────────── │       │ ─────────── │
│ id         │       │ id           │       │ id          │
│ name       │       │ token        │       │ accountId   │
│ email      │ 1───N │ userId       │       │ providerId  │
│ ...        │       │ expiresAt    │       │ userId      │
└────────────┘       └──────────────┘       │ password?   │
      │                                     └─────────────┘
      │ 1───N
      ▼
┌─────────────────────────────────┐
│              Card               │
│ ─────────────────────────────── │
│ id           cardType           │
│ front        back               │
│ note                            │
│ articleTitle  articleContent    │
│ recallBlocks  wordCount         │
│ readTimeMins  totalStudyTimeMs  │
│ nextReviewAt  interval          │
│ easeFactor    repetitions       │
│ outputRepetitions               │
│ state                           │
│ userId                          │
└─────────────────────────────────┘
      │        │         │
      │ 1───N  │ M───N   │ 1───1
      ▼        ▼         ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  ReviewLog   │  │   CardDeck   │  │     Deck     │  │  OutputExercise  │
│ ──────────── │  │ ──────────── │  │ ──────────── │  │ ──────────────── │
│ id           │  │ cardId (PK)  │  │ id           │  │ id               │
│ rating       │  │ deckId (PK)  │  │ title        │  │ cardId (unique)  │
│ reviewTime   │  └──────────────┘  │ description  │  │ targetWord       │
│ reviewedAt   │                    │ color        │  │ englishSentence  │
│ scheduledDays│                    │ isPublic     │  │ chineseSentence  │
│ elapsedDays  │                    │ deletedAt?   │  │ fillBlankTemplate│
│ lastEaseFactor│                   │ userId       │  │ wordList (JSON)  │
│ newEaseFactor │                   └──────────────┘  │ standardAnswer   │
│ cardId       │                                      │ contextPrompt    │
│ userId       │                                      └──────────────────┘
└──────────────┘                                              │ 1───N
                                                              ▼
                                                   ┌──────────────────────┐
                                                   │  OutputPracticeLog   │
                                                   │ ──────────────────── │
                                                   │ id                   │
                                                   │ cardId               │
                                                   │ exerciseId           │
                                                   │ userId               │
                                                   │ level (1-4)          │
                                                   │ isCorrect            │
                                                   │ userAnswer           │
                                                   │ aiVocabScore?        │
                                                   │ aiGrammarScore?      │
                                                   │ aiNativeScore?       │
                                                   │ aiFeedback?          │
                                                   │ aiSuggestedAnswer?   │
                                                   └──────────────────────┘
```

---

## 模型详解

### User（用户）

```prisma
model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions  Session[]
  accounts  Account[]
  decks     Deck[]
  cards     Card[]
  logs      ReviewLog[]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | String | 由 better-auth 生成 |
| `email` | String | 唯一，用于登录 |
| `emailVerified` | Boolean | 当前未强制验证 |
| `image` | String? | 头像 URL（预留） |

---

### Session（会话）

```prisma
model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

| 字段 | 说明 |
|------|------|
| `token` | 随机令牌，存储在 Cookie 中 |
| `expiresAt` | 7 天后过期 |
| `userId` | 级联删除：用户删除时 Session 自动删除 |

---

### Account（账号）

```prisma
model Account {
  id                    String    @id
  accountId             String
  providerId            String    // "credential" for email/password
  userId                String
  password              String?   // bcrypt 哈希
  accessToken           String?
  refreshToken          String?
  // ... OAuth 字段
}
```

存储认证提供商账号信息。当前仅使用 email/password (`providerId = "credential"`)。

---

### Card（卡片）—— 核心模型

```prisma
model Card {
  id       String   @id @default(cuid())
  cardType CardType @default(FLASHCARD)

  // 闪卡内容
  front    String
  back     String
  note     String?

  // 文章内容
  articleTitle     String?  @db.Text
  articleContent   String?  @db.Text
  recallBlocks     Json?
  wordCount        Int?
  readTimeMins     Int?
  totalStudyTimeMs Int?     @default(0)
  lastStudyAt      DateTime?

  // SM-2 算法
  nextReviewAt DateTime  @default(now())
  interval     Int       @default(0)
  easeFactor   Float     @default(2.5)
  repetitions       Int       @default(0)
  outputRepetitions Int       @default(0)
  state        CardState @default(NEW)

  cardDecks    CardDeck[]
  outputExercise OutputExercise?
  outputPracticeLogs OutputPracticeLog[]
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  logs      ReviewLog[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, nextReviewAt])
  @@index([userId, createdAt])
  @@index([userId, easeFactor])
}
```

#### 枚举类型

**CardType**：
```prisma
enum CardType {
  FLASHCARD
  ARTICLE
}
```

**CardState**：
```prisma
enum CardState {
  NEW        // 从未复习
  LEARNING   // 初次学习中（interval < 6天）
  REVIEW     // 正常间隔复习（interval >= 6天）
  RELEARNING // 遗忘后重新学习
}
```

#### 关键索引

| 索引 | 用途 |
|------|------|
| `(userId, nextReviewAt)` | 高效查询"到期待复习卡片" |
| `(userId, createdAt)` | 仪表盘按创建时间排序 |
| `(userId, easeFactor)` | 仪表盘按难度排序 |

#### recallBlocks 字段结构（JSON）

```json
[
  {
    "id": "rb_xxx",
    "question": "SM-2 算法的最小 easeFactor 是多少？",
    "answer": "1.3",
    "position": 0
  }
]
```

---

### CardDeck（卡片-牌组关联）

```prisma
model CardDeck {
  cardId String
  deckId String
  card   Card   @relation(fields: [cardId], references: [id], onDelete: Cascade)
  deck   Deck   @relation(fields: [deckId], references: [id], onDelete: Cascade)

  @@id([cardId, deckId])
  @@index([cardId])
  @@index([deckId])
}
```

- 复合主键：`(cardId, deckId)`
- 双向级联删除：卡片或牌组删除时，关联记录自动删除

---

### Deck（牌组）

```prisma
model Deck {
  id          String    @id @default(cuid())
  title       String
  description String?
  color       String    @default("#137fec")
  isPublic    Boolean   @default(false)
  deletedAt   DateTime?   // 软删除标记

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  cardDecks CardDeck[]

  @@unique([userId, title])  // 同用户下牌组名唯一
}
```

| 字段 | 说明 |
|------|------|
| `color` | 十六进制颜色值，用于 UI 标识 |
| `deletedAt` | null=正常，有值=软删除 |
| `isPublic` | 预留字段，未实现公开分享功能 |

---

### ReviewLog（复习日志）

```prisma
model ReviewLog {
  id         String   @id @default(cuid())
  rating     Int               // 用户评分 1-5
  reviewTime Int               // 思考时间（毫秒）
  reviewedAt DateTime @default(now())

  // 算法快照
  scheduledDays  Int    // 计划间隔天数
  elapsedDays    Int    // 实际间隔天数（复习时距上次的实际天数）
  lastEaseFactor Float  // 本次复习前的 easeFactor
  newEaseFactor  Float  // 本次复习后的 easeFactor

  cardId String
  card   Card   @relation(fields: [cardId], references: [id], onDelete: Cascade)
  userId String
  user   User   @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([userId, rating])  // 用于保留率计算
}
```

#### ReviewLog 的用途

1. **保留率统计**：`COUNT WHERE rating >= 3 / COUNT ALL × 100%`
2. **学习分析**：追踪每张卡片的学习历史
3. **算法调试**：保存算法快照，便于回溯问题

---

### Verification（验证码）

```prisma
model Verification {
  id         String   @id
  identifier String   // 用途标识符（如邮箱地址）
  value      String   // 验证码值
  expiresAt  DateTime // 过期时间

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([identifier])
}
```

存储邮件验证、密码重置等场景的临时验证码（由 better-auth 管理）。

---

### OutputExercise（输出练习缓存）

```prisma
model OutputExercise {
  id        String   @id @default(cuid())
  cardId    String   @unique
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)

  targetWord        String
  englishSentence   String
  chineseSentence   String
  fillBlankTemplate String
  wordList          Json         // string[]
  standardAnswer    String
  contextPrompt     String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  practiceLogs OutputPracticeLog[]

  @@index([cardId])
}
```

| 字段 | 说明 |
|------|------|
| `cardId` | 唯一：每张卡片最多对应一条练习记录（缓存） |
| `fillBlankTemplate` | Level 1 填空模板，目标词替换为 `_____` |
| `wordList` | Level 2 单词数组，JSON 格式存储 |
| `standardAnswer` | Level 3-4 AI 评估参考答案 |
| `contextPrompt` | Level 4 情景描述，中文，由 AI 生成 |

---

### OutputPracticeLog（输出练习日志）

```prisma
model OutputPracticeLog {
  id         String   @id @default(cuid())
  cardId     String
  exerciseId String
  userId     String
  level      Int              // 1=填空, 2=连词, 3=翻译, 4=情景
  isCorrect  Boolean
  userAnswer String   @db.Text

  // AI 反馈（Level 3-4）
  aiVocabScore      Int?
  aiGrammarScore    Int?
  aiNativeScore     Int?
  aiFeedback        String? @db.Text
  aiSuggestedAnswer String? @db.Text

  practicedAt DateTime @default(now())

  card     Card           @relation(fields: [cardId], references: [id], onDelete: Cascade)
  exercise OutputExercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  user     User           @relation(fields: [userId], references: [id])

  @@index([cardId])
  @@index([userId])
  @@index([exerciseId])
}
```

| 字段 | 说明 |
|------|------|
| `level` | 练习等级：1 填空、2 连词、3 翻译、4 情景造句 |
| `isCorrect` | Level 1-2 自动判断，Level 3-4 用户自评 |
| `aiVocabScore` | AI 词汇使用评分 (0-100)，仅 Level 3-4 |
| `aiGrammarScore` | AI 语法正确性评分 (0-100)，仅 Level 3-4 |
| `aiNativeScore` | AI 地道表达评分 (0-100)，仅 Level 3-4 |

---

## 数据一致性保障

### 事务操作

以下操作使用数据库事务确保原子性：

1. **闪卡复习**：更新 Card + 插入 ReviewLog
2. **文章复习**：更新 Card + 插入 ReviewLog
3. **创建牌组**：清除旧软删除记录 + 创建新记录

### 级联删除关系

```
删除 User    → Session, Account, Deck, Card, ReviewLog 全部删除
删除 Card    → CardDeck, ReviewLog 级联删除
删除 Deck    → CardDeck 级联删除（Card 保留）
```

### 软删除（Deck）

Deck 模型使用软删除避免数据丢失：
- 删除操作只设置 `deletedAt = now()`
- 查询时过滤 `deletedAt = null`
- Card 和 CardDeck 不受影响

---

## 常用查询模式

### 获取今日待复习卡片

```typescript
prisma.card.findMany({
  where: {
    userId,
    nextReviewAt: { lte: new Date() }
  },
  include: { cardDecks: { include: { deck: true } } },
  orderBy: { nextReviewAt: 'asc' },
  take: 10,
  cursor: cursor ? { id: cursor } : undefined,
})
```

### 计算保留率

```typescript
const [total, successful] = await Promise.all([
  prisma.reviewLog.count({ where: { userId } }),
  prisma.reviewLog.count({ where: { userId, rating: { gte: 3 } } }),
]);
const retentionRate = total > 0 ? Math.round((successful / total) * 100) : 0;
```

### 获取牌组及卡片数

```typescript
prisma.deck.findMany({
  where: { userId, deletedAt: null },
  include: { _count: { select: { cardDecks: true } } },
})
```
