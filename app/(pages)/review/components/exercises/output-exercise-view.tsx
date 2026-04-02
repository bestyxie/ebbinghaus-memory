'use client';

import { useEffect, useState, useCallback } from 'react';
import type { OutputExercise, OutputLevel, AIEvaluationResult, CardWithDeck } from '@/app/lib/types';
import { Level1FillBlanks } from './level1-fill-blanks';
import { Level2WordScramble } from './level2-word-scramble';
import { Level3FreeTranslation } from './level3-free-translation';
import { Level4ContextualPrompt } from './level4-contextual-prompt';

interface OutputExerciseViewProps {
  card: CardWithDeck;
  level: OutputLevel;
  onSubmit: (answer: string, isCorrect?: boolean, quality?: number) => void;
  disabled: boolean;
}

export function OutputExerciseView({ card, level, onSubmit, disabled }: OutputExerciseViewProps) {
  const [exercise, setExercise] = useState<OutputExercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExercise = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/output-exercises/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to load exercise');
      }

      const data = await response.json();
      setExercise(data.exercise);
    } catch (err) {
      console.error('Error loading exercise:', err);
      setError('Failed to load exercise. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [card.id]);

  useEffect(() => {
    loadExercise();
  }, [loadExercise]);

  const handleEvaluate = async (userAnswer: string): Promise<AIEvaluationResult | null> => {
    try {
      if (!exercise) return null;

      const response = await fetch('/api/output-exercises/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetWord: exercise.targetWord,
          standardAnswer: exercise.standardAnswer,
          userAnswer,
          level,
        }),
      });

      if (!response.ok) {
        throw new Error('Evaluation failed');
      }

      const data = await response.json();
      return data.evaluation;
    } catch (err) {
      console.error('Error evaluating answer:', err);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load exercise'}</p>
          <button
            onClick={loadExercise}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 根据级别渲染对应的组件
  switch (level) {
    case 1:
      return (
        <div className="min-h-screen bg-gray-50 py-10">
          <Level1FillBlanks
            exercise={exercise}
            onSubmit={(answer, isCorrect) => onSubmit(answer, isCorrect)}
            disabled={disabled}
          />
        </div>
      );
    case 2:
      return (
        <div className="min-h-screen bg-gray-50 py-10">
          <Level2WordScramble
            exercise={exercise}
            onSubmit={(answer, isCorrect) => onSubmit(answer, isCorrect)}
            disabled={disabled}
          />
        </div>
      );
    case 3:
      return (
        <div className="min-h-screen bg-gray-50 py-10">
          <Level3FreeTranslation
            exercise={exercise}
            onSubmit={(answer, quality) => onSubmit(answer, undefined, quality)}
            onEvaluate={handleEvaluate}
            disabled={disabled}
          />
        </div>
      );
    case 4:
      return (
        <div className="min-h-screen bg-gray-50 py-10">
          <Level4ContextualPrompt
            exercise={exercise}
            onSubmit={(answer, quality) => onSubmit(answer, undefined, quality)}
            onEvaluate={handleEvaluate}
            disabled={disabled}
          />
        </div>
      );
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-red-600">Invalid exercise level</p>
        </div>
      );
  }
}
