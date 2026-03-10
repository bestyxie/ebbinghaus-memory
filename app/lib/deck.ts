import { auth } from "./auth"
import { headers } from "next/headers"
import { prisma } from './prisma'
import { Deck } from './types'

// 获取用户的 Decks - 用于 Server Component，直接传入 userId
export async function getUserDecks(userId: string): Promise<Deck[]> {
  if (!userId) return [];

  return prisma.deck.findMany({
    where: {
      userId: userId,
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
  });
}

// Server Action 版本 - 用于 Client Components
"use server"
export async function getUserDecksAction(): Promise<Deck[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  return prisma.deck.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
  });
}

// Server Action - 获取用户 decks 并包含卡片计数
export interface DeckWithCount extends Deck {
  cardCount: number;
}

"use server"
export async function getUserDecksWithCountAction(): Promise<DeckWithCount[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  const decks = await prisma.deck.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    include: {
      _count: {
        select: { cardDecks: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return decks.map(deck => ({
    ...deck,
    cardCount: deck._count.cardDecks,
  }));
}
