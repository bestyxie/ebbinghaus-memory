import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/api-helpers';
import { prisma } from '@/app/lib/prisma';
import { evaluateTranslation } from '@/app/lib/translate-ai';
import { calculateReview } from '@/app/lib/srs-algorithm';

/** Map translation score (0-100) to SM-2 quality (0-5) */
function scoreToQuality(score: number): number {
  if (score >= 90) return 5;
  if (score >= 80) return 4;
  if (score >= 70) return 3;
  if (score >= 60) return 2;
  return 1;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth(request);
  if (userId instanceof NextResponse) return userId;

  try {
    const { id } = await params;
    const body = await request.json();
    const { userTranslation, timeSpentMs, hintUsed } = body;

    if (!userTranslation || typeof userTranslation !== 'string') {
      return NextResponse.json(
        { error: 'userTranslation is required' },
        { status: 400 }
      );
    }

    // Fetch the task
    const task = await prisma.translationTask.findUnique({ where: { id } });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (task.status === 'COMPLETED' && task.userTranslation) {
      // Re-translation: reset status to allow re-evaluation
    }

    // Evaluate with AI
    const difficultyLevel = task.difficulty === 'basic' ? 'basic' as const
      : task.difficulty === 'advanced' ? 'advanced' as const
      : task.difficulty === 'expert' ? 'expert' as const
      : 'basic' as const;
    const evaluation = await evaluateTranslation(
      task.sourceText,
      userTranslation,
      difficultyLevel
    );

    if (!evaluation.data) {
      return NextResponse.json(
        { error: evaluation.error || 'AI evaluation failed' },
        { status: 500 }
      );
    }

    // Calculate SM-2 review scheduling
    const quality = scoreToQuality(evaluation.data.score);
    const sm2 = calculateReview({
      interval: task.interval,
      repetitions: task.repetitions,
      easeFactor: task.easeFactor,
      quality,
    });

    const newStatus = evaluation.data.score >= 80 ? 'COMPLETED' : 'NEEDS_REVIEW';

    // Update the task
    const updated = await prisma.translationTask.update({
      where: { id },
      data: {
        userTranslation,
        timeSpentMs: timeSpentMs ?? null,
        hintUsed: hintUsed ?? task.hintUsed,
        score: evaluation.data.score,
        accuracyScore: evaluation.data.accuracyScore,
        fluencyScore: evaluation.data.fluencyScore,
        vocabScore: evaluation.data.vocabScore,
        aiFeedback: evaluation.data.feedback,
        aiPolished: evaluation.data.polished,
        aiNativeAlt: evaluation.data.nativeAlt,
        aiNativeAnnotations: evaluation.data.nativeAnnotations ?? undefined,
        status: newStatus,
        nextReviewAt: sm2.nextReviewDate,
        interval: sm2.interval,
        easeFactor: sm2.easeFactor,
        repetitions: sm2.repetitions,
      },
    });

    return NextResponse.json({
      task: updated,
      annotations: evaluation.data.annotations,
      nativeAnnotations: evaluation.data.nativeAnnotations,
    });
  } catch (error) {
    console.error('Error in POST /api/translate/[id]/submit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
