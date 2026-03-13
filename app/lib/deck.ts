import { auth } from "./auth"
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

