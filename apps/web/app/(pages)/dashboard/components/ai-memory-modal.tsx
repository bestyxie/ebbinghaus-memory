"use client";

import { X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AIMemoryCard } from "@/app/lib/ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: AIMemoryCard[];
}

export function AIMemoryModal({ isOpen, onClose, cards }: AIMemoryModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function fetchGeneratedText() {
    setIsLoading(true);
    setError(null);
    setGeneratedText('');

    try {
      const cardFronts = cards.map(card => card.front);
      const response = await fetch('/api/ai/generate-memory-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardFronts }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate memory text');
      }

      const data = await response.json();
      setGeneratedText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }


  useEffect(() => {
    if (isOpen && cards.length > 0) {
      fetchGeneratedText();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cards]);

  function handleRetry() {
    fetchGeneratedText();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-[700px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-[-0.5px] text-slate-900">
                AI 辅助记忆
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {cards.length} 个待复习单词
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-900" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Cards Preview */}
          <div className="bg-slate-50/50 border-b border-slate-100 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.7px] text-slate-900 mb-3">
              待复习单词
            </h3>
            <div className="flex flex-wrap gap-2">
              {cards.map(card => (
                <span
                  key={card.id}
                  className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700"
                >
                  {card.front}
                </span>
              ))}
            </div>
          </div>

          {/* AI Generated Text */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-600">AI 正在生成记忆辅助内容...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-red-500 mt-0.5">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-800 mb-1">
                      生成失败
                    </h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
                <button
                  onClick={handleRetry}
                  className="mt-3 w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  重试
                </button>
              </div>
            ) : generatedText ? (
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-base font-semibold text-slate-900 mt-5 mb-2">{children}</h4>,
                    p: ({ children }) => <p className="text-slate-700 mb-3 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="text-slate-700 mb-3 ml-4">{children}</ul>,
                    ol: ({ children }) => <ol className="text-slate-700 mb-3 ml-4">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                    em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
                  }}
                >
                  {generatedText}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                没有生成内容
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
