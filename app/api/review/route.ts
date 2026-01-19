// src/app/api/review/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // 假设你初始化了 prisma client
import { calculateReview } from '@/app/lib/srs-algorithm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cardId, quality } = body; 
    // quality: 前端传来的评分 (对应 SM-2 的 0-5)

    // 1. 从数据库获取当前卡片状态
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // 2. 运行核心算法
    const result = calculateReview({
      interval: card.interval,
      repetitions: card.repetitions,
      easeFactor: card.easeFactor,
      quality: quality, 
    });

    // 3. 事务更新：同时更新 卡片状态 和 插入 复习日志
    await prisma.$transaction([
      // A. 更新卡片主表
      prisma.card.update({
        where: { id: cardId },
        data: {
          interval: result.interval,
          repetitions: result.repetitions,
          easeFactor: result.easeFactor,
          nextReviewAt: result.nextReviewDate,
          state: quality < 3 ? 'RELEARNING' : 'REVIEW', // 根据是否忘记更新状态
        },
      }),
      
      // B. 插入历史记录 (用于统计)
      prisma.reviewLog.create({
        data: {
          cardId: cardId,
          userId: card.userId,
          rating: quality,
          reviewTime: 0, // 如果前端传了耗时，这里可以填
          scheduledDays: card.interval, // 计划间隔
          elapsedDays: result.interval, // 实际新间隔
          lastEaseFactor: card.easeFactor,
          newEaseFactor: result.easeFactor,
        },
      }),
    ]);

    return NextResponse.json({ success: true, nextReview: result.nextReviewDate });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Review failed' }, { status: 500 });
  }
}