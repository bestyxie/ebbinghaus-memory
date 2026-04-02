'use client';

import { useState } from 'react';
import type { OutputExercise } from '@/app/lib/types';

interface Level1FillBlanksProps {
  exercise: OutputExercise;
  onSubmit: (userAnswer: string, isCorrect: boolean) => void;
  disabled: boolean;
}

export function Level1FillBlanks({ exercise, onSubmit, disabled }: Level1FillBlanksProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (disabled || !userAnswer.trim()) return;

    const trimmedAnswer = userAnswer.trim().toLowerCase();
    const correctAnswer = exercise.targetWord.toLowerCase();
    const correct = trimmedAnswer === correctAnswer;

    setIsCorrect(correct);
    setHasSubmitted(true);
    onSubmit(userAnswer, correct);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !hasSubmitted) {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-8">
        {/* 练习标题 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Level 1
            </span>
            <span className="text-gray-500 text-sm">填空练习</span>
          </div>
        </div>

        {/* 中文提示 */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">中文翻译</div>
          <div className="text-lg text-gray-800 p-4 bg-gray-50 rounded-lg">
            {exercise.chineseSentence}
          </div>
        </div>

        {/* 填空句子 */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">请填入正确的单词</div>
          <div className="text-xl text-gray-900 p-6 bg-blue-50 rounded-lg leading-relaxed">
            {exercise.fillBlankTemplate}
          </div>
        </div>

        {/* 答案输入 */}
        {!hasSubmitted ? (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入目标词汇..."
                disabled={disabled}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={disabled || !userAnswer.trim()}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              提交答案
            </button>
          </div>
        ) : (
          /* 结果反馈 */
          <div className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
            <div className="flex items-start gap-3">
              <div className={`text-3xl ${isCorrect ? '✅' : '❌'}`} />
              <div className="flex-1">
                <div className={`font-semibold text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '正确！' : '错误'}
                </div>
                {!isCorrect && (
                  <div className="text-gray-700 mb-2">
                    正确答案: <span className="font-semibold text-blue-600">{exercise.targetWord}</span>
                  </div>
                )}
                <div className="text-gray-700">
                  完整句子: <span className="italic">{exercise.englishSentence}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 提示信息 */}
        {!hasSubmitted && (
          <div className="mt-4 text-center text-sm text-gray-500">
            按 <kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd> 提交答案
          </div>
        )}
      </div>
    </div>
  );
}
