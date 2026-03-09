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
