"use server"
import { auth } from "./auth"
import { headers } from "next/headers"
import { prisma } from './prisma'
import { createCardSchema, editCardSchema, calculateInitialEaseFactor } from './zod'
import { revalidatePath } from 'next/cache'

// 创建卡片
export const createCard = async (prevState: unknown, formData: FormData) => {
  const headerList = await headers()
  try {

    const session = await auth.api.getSession({ headers: headerList });
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // 验证表单数据
    const validated = createCardSchema.safeParse(Object.fromEntries(formData));
    if (!validated.success) {
      return { error: validated.error.message };
    }

    const { front, back, note, deckId, quality } = validated.data;
    const userId = session.user.id;

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

    // 创建卡片
    try {
      await prisma.card.create({
        data: {
          front,
          back,
          note: note || null,
          userId,
          nextReviewAt: new Date(),
          interval: 0,
          easeFactor: calculateInitialEaseFactor(parseInt(quality)),
          repetitions: 0,
          state: "NEW",
          ...(deckId && {
            cardDecks: {
              create: {
                deckId,
              },
            },
          }),
        },
      });

      // Revalidate dashboard page to refresh server components
      revalidatePath('/dashboard');

      return { success: true };
    } catch (error) {
      console.error("createCard error:", error);
      return { error: "Failed to create card" };
    }
  } catch (err) {
    console.error("createCard error:", err);
    return { error: "Failed to create card" };
  }
}

// 更新卡片
export async function updateCard(prevState: unknown, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // 验证表单数据
  const validated = editCardSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { error: validated.error.message };
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

