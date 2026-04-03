'use client';

import { useState } from 'react';
import type { OutputExercise, AIEvaluationResult } from '@/app/lib/types';

interface Level4ContextualPromptProps {
  exercise: OutputExercise;
  onSubmit: (userAnswer: string, quality: number) => void;
  onEvaluate: (userAnswer: string) => Promise<AIEvaluationResult | null>;
  disabled: boolean;
}

export function Level4ContextualPrompt({ exercise, onSubmit, onEvaluate, disabled }: Level4ContextualPromptProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [evaluation, setEvaluation] = useState<AIEvaluationResult | null>(null);

  const handleEvaluate = async () => {
    if (disabled || !userAnswer.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const result = await onEvaluate(userAnswer);
      if (result) {
        setEvaluation(result);
        setHasEvaluated(true);
      }
    } catch (error) {
      console.error('Evaluation error:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmit = (quality: number) => {
    onSubmit(userAnswer, quality);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && !hasEvaluated) {
      handleEvaluate();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-8">
        {/* 练习标题 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
              Level 4
            </span>
            <span className="text-gray-500 text-sm">情景造句</span>
            <span className="ml-auto px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full text-sm font-medium">
              高级挑战
            </span>
          </div>
        </div>

        {/* 目标词汇 */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">目标词汇</div>
          <div className="text-2xl font-bold text-amber-600 p-4 bg-amber-50 rounded-lg text-center">
            {exercise.targetWord}
          </div>
        </div>

        {/* 情景提示 */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">情景提示</div>
          <div className="text-lg text-gray-800 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
            <span className="text-2xl mr-2">💡</span>
            {exercise.contextPrompt}
          </div>
        </div>

        {/* 参考释义 */}
        <div className="mb-6">
          <details className="group">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition">
              查看词汇释义 ▼
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700">
              {exercise.standardAnswer}
            </div>
          </details>
        </div>

        {/* 答案输入 */}
        <div className="mb-6">
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="根据情景，用目标词汇写一个句子..."
            disabled={disabled || hasEvaluated}
            rows={5}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* 评估按钮 */}
        {!hasEvaluated && (
          <div className="space-y-4">
            <button
              onClick={handleEvaluate}
              disabled={disabled || !userAnswer.trim() || isEvaluating}
              className="w-full py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isEvaluating ? '评估中...' : '提交评估 (Ctrl+Enter)'}
            </button>
            <div className="text-center text-sm text-gray-500">
              发挥创意，AI 将评估你的词汇运用和表达
            </div>
          </div>
        )}

        {/* 评估结果 */}
        {hasEvaluated && evaluation && (
          <div className="space-y-4">
            {/* 总体评价 */}
            <div className={`p-4 rounded-lg text-center ${
              evaluation.overall === 'correct' ? 'bg-green-50 border-2 border-green-300' :
              evaluation.overall === 'partial' ? 'bg-yellow-50 border-2 border-yellow-300' :
              'bg-red-50 border-2 border-red-300'
            }`}>
              <div className="text-lg font-semibold mb-1">
                {evaluation.overall === 'correct' ? '🎉 太棒了！' :
                 evaluation.overall === 'partial' ? '👍 不错！' :
                 '💪 继续努力！'}
              </div>
              <div className="text-sm text-gray-600">
                {evaluation.overall === 'correct' ? '你的句子已经很好了！' :
                 evaluation.overall === 'partial' ? '有些地方可以改进' :
                 '需要多加练习'}
              </div>
            </div>

            {/* 分数面板 */}
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg text-center ${evaluation.vocabScore >= 80 ? 'bg-green-50' : evaluation.vocabScore >= 50 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <div className="text-2xl font-bold text-gray-900">{evaluation.vocabScore}</div>
                <div className="text-sm text-gray-600">词汇</div>
              </div>
              <div className={`p-4 rounded-lg text-center ${evaluation.grammarScore >= 80 ? 'bg-green-50' : evaluation.grammarScore >= 50 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <div className="text-2xl font-bold text-gray-900">{evaluation.grammarScore}</div>
                <div className="text-sm text-gray-600">语法</div>
              </div>
              <div className={`p-4 rounded-lg text-center ${evaluation.nativeScore >= 80 ? 'bg-green-50' : evaluation.nativeScore >= 50 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <div className="text-2xl font-bold text-gray-900">{evaluation.nativeScore}</div>
                <div className="text-sm text-gray-600">地道</div>
              </div>
            </div>

            {/* 反馈 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">AI 反馈</div>
              <div className="text-gray-700">{evaluation.feedback}</div>
            </div>

            {/* 建议答案 */}
            {evaluation.suggestedAnswer && !evaluation.suggestedAnswer.includes('已经很好') && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-900 mb-2">参考表达</div>
                <div className="text-gray-700 italic">{evaluation.suggestedAnswer}</div>
              </div>
            )}

            {/* 评分按钮 */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-3 text-center">
                参考AI反馈后，请为你的答案评分
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => handleSubmit(1)}
                  disabled={disabled}
                  className="flex flex-col items-center gap-1 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg disabled:opacity-50 transition"
                >
                  <span className="text-2xl">😰</span>
                  <span className="text-sm">完全不会</span>
                  <span className="text-xs opacity-70">重学</span>
                </button>
                <button
                  onClick={() => handleSubmit(2)}
                  disabled={disabled}
                  className="flex flex-col items-center gap-1 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold rounded-lg disabled:opacity-50 transition"
                >
                  <span className="text-2xl">🤔</span>
                  <span className="text-sm">有难度</span>
                  <span className="text-xs opacity-70">需巩固</span>
                </button>
                <button
                  onClick={() => handleSubmit(3)}
                  disabled={disabled}
                  className="flex flex-col items-center gap-1 px-4 py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold rounded-lg disabled:opacity-50 transition"
                >
                  <span className="text-2xl">👍</span>
                  <span className="text-sm">基本掌握</span>
                  <span className="text-xs opacity-70">还行</span>
                </button>
                <button
                  onClick={() => handleSubmit(4)}
                  disabled={disabled}
                  className="flex flex-col items-center gap-1 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-lg disabled:opacity-50 transition"
                >
                  <span className="text-2xl">😊</span>
                  <span className="text-sm">完全掌握</span>
                  <span className="text-xs opacity-70">很好</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
