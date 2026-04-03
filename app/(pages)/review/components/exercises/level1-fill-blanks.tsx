'use client';

import { useState } from 'react';
import type { OutputExercise } from '@/app/lib/types';

interface Level1FillBlanksProps {
  exercise: OutputExercise;
  onSubmit: (userAnswer: string, isCorrect: boolean) => void;
  onContinue?: () => void;
  showContinue?: boolean;
  disabled: boolean;
}

const BLANK_PLACEHOLDER = '_____';

export function Level1FillBlanks({ exercise, onSubmit, onContinue, showContinue, disabled }: Level1FillBlanksProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 将模板分割为空白前后的文本部分
  const parts = exercise.fillBlankTemplate.split(BLANK_PLACEHOLDER);

  const handleSubmit = () => {
    if (disabled || !userAnswer.trim()) return;

    const normalize = (s: string) =>
      s.trim().toLowerCase().replace(/[.,!?;:'"()\-]/g, '');

    const normalizedAnswer = normalize(userAnswer);

    // The actual word in the sentence (extracted by diffing template against sentence)
    const [before, after] = exercise.fillBlankTemplate.split(BLANK_PLACEHOLDER);
    const wordInSentence = exercise.englishSentence
      .slice(before.length, exercise.englishSentence.length - after.length);

    const correct =
      normalizedAnswer === normalize(exercise.targetWord) ||
      normalizedAnswer === normalize(wordInSentence);

    setIsCorrect(correct);
    setHasSubmitted(true);
    onSubmit(userAnswer, correct);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !hasSubmitted) {
      handleSubmit();
    }
  };

  // 渲染带输入框的句子
  const renderSentenceWithInput = () => {
    if (hasSubmitted) {
      // 提交后显示完整句子
      return (
        <span className={userAnswer.trim().toLowerCase() === exercise.targetWord.toLowerCase() ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {userAnswer || '(空)'}
        </span>
      );
    }

    return (
      <input
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="输入单词"
        disabled={disabled}
        className="inline-block mx-1 px-2 py-1 text-xl border-b-2 border-blue-400 bg-blue-50 focus:border-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] text-center"
        style={{ width: Math.max(120, userAnswer.length * 16 + 40) }}
        autoFocus
      />
    );
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

        {/* 填空句子 - 直接在句子中输入 */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">请填入正确的单词</div>
          <div className="text-xl text-gray-900 p-6 bg-blue-50 rounded-lg leading-relaxed">
            {parts[0]}
            {renderSentenceWithInput()}
            {parts[1] && parts[1]}
          </div>
        </div>

        {!hasSubmitted ? (
          <>
            {/* 提交按钮 */}
            <button
              onClick={handleSubmit}
              disabled={disabled || !userAnswer.trim()}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              提交答案
            </button>
            {/* 提示信息 */}
            <div className="mt-4 text-center text-sm text-gray-500">
              按 <kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd> 提交答案
            </div>
          </>
        ) : (
          /* 结果反馈 */
          <div className="space-y-4">
            <div className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
              <div className="flex items-start gap-3">
                <div className={`text-2xl ${isCorrect ? '✅' : '❌'}`} />
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
            {showContinue && onContinue && (
              <button
                onClick={onContinue}
                disabled={disabled}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                继续 →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
