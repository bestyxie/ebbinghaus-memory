// src/lib/srs-algorithm.ts

// 输出轨道激活阈值：输入轨道连续正确 3 次后激活
export const OUTPUT_TRACK_ACTIVATION_THRESHOLD = 3;

// 输出轨道初始值
export const OUTPUT_TRACK_INITIAL = {
  interval: 1,
  repetitions: 0,
  easeFactor: 2.5,
};

export interface ReviewInput {
  interval: number;    // 上次复习间隔天数
  repetitions: number; // 连续正确次数
  easeFactor: number;  // 易记因子 (默认 2.5)
  quality: number;     // 用户评分 (0-5)
}

export interface ReviewOutput {
  interval: number;    // 新的间隔天数
  repetitions: number; // 新的连续正确次数
  easeFactor: number;  // 新的易记因子
  nextReviewDate: Date;// 下次复习的具体日期
}

/**
 * SuperMemo-2 算法实现
 * @param input 当前卡片状态
 * @returns 更新后的卡片状态
 */
export function calculateReview(input: ReviewInput): ReviewOutput {
  const { quality } = input;
  let { interval, repetitions, easeFactor } = input;

  // --- 1. 处理评分逻辑 ---
  // SM-2 标准评分是 0-5 分：
  // 5 - 完美记忆
  // 4 - 犹豫了一下但在想起来了
  // 3 - 困难，但想起来了
  // < 3 - 忘记了 (黑洞)
  
  if (quality >= 3) {
    // === 如果记住了 (评分 >= 3) ===
    
    // 1. 更新间隔 (Interval)
    if (repetitions === 0) {
      interval = 1; // 第一次复习，间隔 1 天
    } else if (repetitions === 1) {
      interval = 6; // 第二次复习，间隔 6 天
    } else {
      // 之后：旧间隔 * 易记因子
      interval = Math.round(interval * easeFactor);
    }

    // 2. 增加连续正确次数
    repetitions += 1;
  } else {
    // === 如果忘记了 (评分 < 3) ===
    
    // 惩罚机制：重置间隔和次数
    repetitions = 0;
    interval = 1; // 明天必须复习
  }

  // --- 2. 更新易记因子 (Ease Factor) ---
  // 这是 SM-2 的核心公式，动态调整卡片的"难度系数"
  // 如果用户评分低，EF 会下降 (下次间隔增长变慢)
  // 如果用户评分高，EF 会上升 (下次间隔增长变快)
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // 设定下限：易记因子不能低于 1.3 (否则间隔永远不会增长)
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // --- 3. 计算下次日期 ---
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    interval,
    repetitions,
    easeFactor,
    nextReviewDate
  };
}