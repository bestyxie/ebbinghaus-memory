import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/api-helpers';
import { prisma } from '@/app/lib/prisma';
import { generateTranslationSource, type TranslationDifficulty } from '@/app/lib/translate-ai';

const VALID_DIFFICULTIES: TranslationDifficulty[] = ['basic', 'advanced', 'expert'];

export async function POST(request: NextRequest) {
  const userId = await requireAuth(request);
  if (userId instanceof NextResponse) return userId;

  try {
    const body = await request.json();
    const { topic, difficulty } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json(
        { error: `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Call AI to generate source text
    const result = await generateTranslationSource({ topic, difficulty });

    if (!result.data) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate translation task' },
        { status: 500 }
      );
    }

    // Save to database
    const task = await prisma.translationTask.create({
      data: {
        userId,
        topic,
        difficulty,
        sourceText: result.data.sourceText,
        hintWords: result.data.hintWords,
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error in POST /api/translate/generate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
