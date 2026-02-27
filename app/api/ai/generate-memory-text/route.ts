import { NextRequest, NextResponse } from 'next/server';
import { generateMemoryText } from '@/app/lib/ai';
import { requireAuth } from '@/app/lib/api-helpers';

/**
 * POST /api/ai/generate-memory-text
 *
 * Generate AI-assisted memory text for vocabulary cards
 *
 * Request body:
 * {
 *   cardFronts: string[] - Array of card front text (vocabulary words/concepts)
 * }
 *
 * Response:
 * {
 *   text: string - AI-generated memory assistance text
 *   error?: string - Error message if generation failed
 * }
 */
export async function POST(req: NextRequest) {
  const userId = await requireAuth();
  if (userId instanceof NextResponse) return userId;

  try {
    const body = await req.json();
    const { cardFronts } = body;

    // Validate input
    if (!Array.isArray(cardFronts)) {
      return NextResponse.json(
        { error: 'cardFronts must be an array of strings' },
        { status: 400 }
      );
    }

    if (cardFronts.length === 0) {
      return NextResponse.json(
        { error: 'cardFronts array cannot be empty' },
        { status: 400 }
      );
    }

    if (cardFronts.some(item => typeof item !== 'string' || !item.trim())) {
      return NextResponse.json(
        { error: 'All items in cardFronts must be non-empty strings' },
        { status: 400 }
      );
    }

    // Generate memory text
    const result = await generateMemoryText(cardFronts);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      text: result.text,
    });
  } catch (error) {
    console.error('Error in generate-memory-text route:', error);
    return NextResponse.json(
      { error: 'Failed to generate memory text' },
      { status: 500 }
    );
  }
}
