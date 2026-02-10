"use server"
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { prisma } from './prisma'
import { auth } from '@/auth'
import { createCardSchema, calculateInitialEaseFactor } from './zod'
import { Deck } from './types'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      console.error('AuthError in authenticate:', error.type, error.cause)
      switch (error.type) {
        case 'CredentialsSignin':
          // 获取 cause 中的错误消息
          console.log('error.cause:', error.cause)
          const errorMessage = (error.cause as { message?: string })?.message || 'Invalid credentials.'
          return errorMessage
        // 兜底：多数回调/验证错误也提示为凭证错误，避免总是 "Something went wrong"
        case 'CallbackRouteError':
          const callbackMessage = (error.cause as { message?: string })?.message || 'Invalid credentials.'
          return callbackMessage
        default:
          return 'Something went wrong.'
      }
    }
    throw error;
  }
}

export async function register(
  prevState: string|undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          // 获取 cause 中的错误消息
          const errorMessage = error.cause?.err?.message || 'Invalid credentials.'
          return errorMessage
        case 'CallbackRouteError':
          const callbackMessage = error.cause?.err?.message || 'Invalid credentials.'
          return callbackMessage
        default:
          return 'Something went wrong.'
      }
    }
    throw error;
  }
}

// 创建卡片
export async function createCard(prevState: unknown, formData: FormData) {
  const session = await auth();
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
}

// 获取用户的 Decks with React.cache for request deduplication
export const getUserDecks = cache(async (): Promise<Deck[]> => {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.deck.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
  });
});
