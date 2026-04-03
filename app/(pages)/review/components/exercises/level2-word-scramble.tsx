'use client';

import { useState } from 'react';
import type { OutputExercise } from '@/app/lib/types';

interface Level2WordScrambleProps {
  exercise: OutputExercise;
  onSubmit: (userAnswer: string, isCorrect: boolean) => void;
  onContinue?: () => void;
  showContinue?: boolean;
  disabled: boolean;
}

export function Level2WordScramble({ exercise, onSubmit, onContinue, showContinue, disabled }: Level2WordScrambleProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([...exercise.wordList]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 选择一个单词
  const handleSelectWord = (index: number) => {
    if (disabled || hasSubmitted) return;

    const word = availableWords[index];
    const newAvailable = availableWords.filter((_, i) => i !== index);
    const newSelected = [...selectedWords, word];

    setAvailableWords(newAvailable);
    setSelectedWords(newSelected);
  };

  // 取消选择一个单词
  const handleDeselectWord = (index: number) => {
    if (disabled || hasSubmitted) return;

    const word = selectedWords[index];
    const newSelected = selectedWords.filter((_, i) => i !== index);
    const newAvailable = [...availableWords, word];

    setSelectedWords(newSelected);
    setAvailableWords(newAvailable);
  };

  // 重置
  const handleReset = () => {
    if (disabled || hasSubmitted) return;
    setSelectedWords([]);
    setAvailableWords([...exercise.wordList]);
  };

  const handleSubmit = () => {
    if (disabled || selectedWords.length === 0) return;

    const userAnswer = selectedWords.join(' ');

    // 只比较实际单词，忽略标点符号（AI wordList 将标点作为独立 token，join 后会有空格）
    const extractWords = (s: string) => (s.toLowerCase().match(/[a-z']+/g) ?? []);
    const correct = JSON.stringify(extractWords(userAnswer)) === JSON.stringify(extractWords(exercise.englishSentence));

    setIsCorrect(correct);
    setHasSubmitted(true);
    onSubmit(userAnswer, correct);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 p-8">
        {/* 练习标题 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Level 2
            </span>
            <span className="text-gray-500 text-sm">连词成句</span>
          </div>
        </div>

        {/* 中文提示 */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">中文翻译</div>
          <div className="text-lg text-gray-800 p-4 bg-gray-50 rounded-lg">
            {exercise.chineseSentence}
          </div>
        </div>

        {/* 已选单词区域 */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">你的答案 (点击单词可以撤销)</div>
          <div className="min-h-[80px] p-4 bg-purple-50 rounded-lg border-2 border-dashed border-purple-300 flex flex-wrap gap-2">
            {selectedWords.length === 0 ? (
              <span className="text-gray-400 italic">点击下方单词构建句子...</span>
            ) : (
              selectedWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleDeselectWord(index)}
                  disabled={disabled || hasSubmitted}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {word}
                </button>
              ))
            )}
          </div>
        </div>

        {/* 待选单词区域 */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">点击单词添加到答案</div>
          <div className="flex flex-wrap gap-2">
            {availableWords.map((word, index) => (
              <button
                key={`${word}-${index}`}
                onClick={() => handleSelectWord(index)}
                disabled={disabled || hasSubmitted}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        {!hasSubmitted ? (
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={disabled || selectedWords.length === 0}
              className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              提交答案
            </button>
            <button
              onClick={handleReset}
              disabled={disabled || selectedWords.length === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              重置
            </button>
          </div>
        ) : (
          /* 结果反馈 */
          <div className="space-y-4">
            <div className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
              <div className="flex items-start gap-3">
                <div className={`text-3xl ${isCorrect ? '✅' : '❌'}`} />
                <div className="flex-1">
                  <div className={`font-semibold text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect ? '完全正确！' : '顺序错误'}
                  </div>
                  {!isCorrect && (
                    <>
                      <div className="text-gray-700 mb-2">
                        你的答案: <span className="italic">{selectedWords.join(' ')}</span>
                      </div>
                      <div className="text-gray-700">
                        正确答案: <span className="font-semibold text-purple-600">{exercise.englishSentence}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {showContinue && onContinue && (
              <button
                onClick={onContinue}
                disabled={disabled}
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
