import { NextRequest, NextResponse } from 'next/server';
import { evaluateOutputAnswer } from '@/app/lib/output-exercises';
import { requireAuth } from '@/app/lib/api-helpers';
import { z } from 'zod';

// 评估请求验证 schema
const evaluateRequestSchema = z.object({
  targetWord: z.string().min(1),
  standardAnswer: z.string().min(1),
  userAnswer: z.string().min(1),
  level: z.union([z.number(), z.string()]).transform((v) => parseInt(String(v)) as 1 | 2 | 3 | 4),
});

/**
 * POST /api/output-exercises/evaluate
 *
 * 评估用户的自由作答（Level 3-4）
 *
 * Request body:
 * {
 *   targetWord: string
 *   standardAnswer: string
 *   userAnswer: string
 *   level: 1 | 2 | 3 | 4
 * }
 *
 * Response:
 * {
 *   evaluation: AIEvaluationResult
 * }
 */
export async function POST(req: NextRequest) {
  const userId = await requireAuth(req);
  if (userId instanceof NextResponse) return userId;

  try {
    const body = await req.json();

    // 验证输入
    const parsed = evaluateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { targetWord, standardAnswer, userAnswer, level } = parsed.data;

    // 调用 AI 评估
    const result = await evaluateOutputAnswer({
      targetWord,
      standardAnswer,
      userAnswer,
      level,
    });

    if (!result.data || result.error) {
      return NextResponse.json(
        { error: result.error || 'Failed to evaluate answer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      evaluation: result.data,
    });
  } catch (error) {
    console.error('Error in evaluate route:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}
