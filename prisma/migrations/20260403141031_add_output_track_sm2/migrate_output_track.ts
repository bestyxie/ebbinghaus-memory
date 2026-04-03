/**
 * 数据迁移脚本：计算并更新卡片的输出轨道 SM-2 字段
 *
 * 功能：
 * 1. 为已有卡片的 outputRepetitions, outputInterval, outputEaseFactor 赋初始值
 * 2. 如果卡片有 OutputPracticeLog 记录，基于历史记录计算真实的 SM-2 值
 * 3. 如果 repetitions >= 3，激活输出轨道并设置 outputNextReviewAt
 */

import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * SM-2 算法函数（简化版，用于迁移计算）
 */
function calculateSM2(input: {
  interval: number;
  repetitions: number;
  easeFactor: number;
  quality: number;
}) {
  const { quality } = input;
  let { interval, repetitions, easeFactor } = input;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  return { interval, repetitions, easeFactor };
}

/**
 * 将 OutputPracticeLog 的 isCorrect 转换为 SM-2 quality 分数
 * - Level 1-2: 自动判题，正确=5分，错误=1分
 * - Level 3-4: 用户自评，直接使用评分
 */
function mapToQuality(isCorrect: boolean, level: number): number {
  // Level 1-2: 自动判题
  if (level <= 2) {
    return isCorrect ? 5 : 1;
  }
  // Level 3-4: 用户自评（这里假设正确=4分，实际应该有评分字段）
  return isCorrect ? 4 : 2;
}

/**
 * 基于历史练习记录计算输出轨道 SM-2 值
 */
function calculateOutputTrackFromLogs(logs: Array<{ level: number; isCorrect: boolean; practicedAt: Date }>) {
  // 按时间排序
  const sortedLogs = [...logs].sort((a, b) => a.practicedAt.getTime() - b.practicedAt.getTime());

  let outputInterval = 0;
  let outputRepetitions = 0;
  let outputEaseFactor = 2.5;

  for (const log of sortedLogs) {
    const quality = mapToQuality(log.isCorrect, log.level);
    const result = calculateSM2({
      interval: outputInterval,
      repetitions: outputRepetitions,
      easeFactor: outputEaseFactor,
      quality,
    });
    outputInterval = result.interval;
    outputRepetitions = result.repetitions;
    outputEaseFactor = result.easeFactor;
  }

  return { outputInterval, outputRepetitions, outputEaseFactor };
}

async function main() {
  console.log('开始迁移输出轨道数据...\n');

  // 1. 获取所有卡片
  const cards = await prisma.card.findMany({
    include: {
      outputPracticeLogs: {
        orderBy: { practicedAt: 'asc' },
      },
    },
  });

  console.log(`找到 ${cards.length} 张卡片需要处理\n`);

  let updatedCount = 0;
  let activatedCount = 0;
  let skippedCount = 0;

  for (const card of cards) {
    const updates: Record<string, any> = {};

    // 2. 计算输出轨道 SM-2 值
    if (card.outputPracticeLogs.length > 0) {
      // 基于历史记录计算
      const { outputInterval, outputRepetitions, outputEaseFactor } = calculateOutputTrackFromLogs(
        card.outputPracticeLogs.map(log => ({
          level: log.level,
          isCorrect: log.isCorrect,
          practicedAt: log.practicedAt,
        }))
      );

      updates.outputInterval = outputInterval;
      updates.outputRepetitions = outputRepetitions;
      updates.outputEaseFactor = outputEaseFactor;

      // 计算下次复习时间
      if (outputRepetitions > 0) {
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + outputInterval);
        updates.outputNextReviewAt = nextReviewDate;
      }
    } else {
      // 没有历史记录，设置为初始值
      updates.outputInterval = 0;
      updates.outputRepetitions = 0;
      updates.outputEaseFactor = 2.5;
      updates.outputNextReviewAt = null;
    }

    // 3. 检查是否应该激活输出轨道
    if (card.repetitions >= 3 && !updates.outputNextReviewAt && card.outputPracticeLogs.length === 0) {
      // 输入轨道已激活，但没有输出练习记录
      // 设置初始输出轨道状态
      updates.outputInterval = 1;
      updates.outputRepetitions = 0;
      updates.outputNextReviewAt = new Date(); // 立即可复习
      activatedCount++;
    } else if (card.repetitions >= 3 && updates.outputNextReviewAt) {
      activatedCount++;
    }

    // 4. 执行更新（如果有变化）
    if (Object.keys(updates).length > 0) {
      await prisma.card.update({
        where: { id: card.id },
        data: updates,
      });
      updatedCount++;

      if (updatedCount % 100 === 0) {
        console.log(`已处理 ${updatedCount}/${cards.length} 张卡片...`);
      }
    } else {
      skippedCount++;
    }
  }

  console.log('\n迁移完成！');
  console.log(`- 总卡片数: ${cards.length}`);
  console.log(`- 已更新: ${updatedCount}`);
  console.log(`- 输出轨道已激活: ${activatedCount}`);
  console.log(`- 跳过: ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error('迁移失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
