'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Lightbulb,
  Send,
  RefreshCw,
  ChevronRight,
  Star,
  Plus,
  X,
} from 'lucide-react';
import Link from 'next/link';

// === 类型 ===

interface Annotation {
  segment: string;
  type: 'good' | 'bad';
  comment: string;
}

interface TaskData {
  id: string;
  topic: string;
  difficulty: string;
  sourceText: string;
  hintWords: string[];
  hintUsed: boolean;
  status: string;
  userTranslation: string | null;
  score: number | null;
  accuracyScore: number | null;
  fluencyScore: number | null;
  vocabScore: number | null;
  aiFeedback: string | null;
  aiPolished: string | null;
  aiNativeAlt: string | null;
}

type Phase = 'loading' | 'translating' | 'submitting' | 'result';

// === Deck type ===

interface DeckOption {
  id: string;
  title: string;
}

// === 计时器 hook ===

function useTimer() {
  const [ms, setMs] = useState(0);
  const running = useRef(false);
  const startRef = useRef(0);

  const start = useCallback(() => {
    startRef.current = Date.now();
    running.current = true;
    setMs(0);
  }, []);

  useEffect(() => {
    if (!running.current) return;
    const interval = setInterval(() => {
      if (running.current) {
        setMs(Date.now() - startRef.current);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stop = useCallback(() => {
    running.current = false;
    return Date.now() - startRef.current;
  }, []);

  const formatted = `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

  return { ms, formatted, start, stop };
}

// === 难度 badge ===

function difficultyBadge(d: string) {
  switch (d) {
    case 'basic': return 'bg-green-100 text-green-700';
    case 'advanced': return 'bg-blue-100 text-blue-700';
    case 'expert': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function difficultyLabel(d: string) {
  switch (d) {
    case 'basic': return '基础';
    case 'advanced': return '进阶';
    case 'expert': return '骨灰';
    default: return d;
  }
}

// === 主组件 ===

export function TranslateWorkspaceClient() {
  const params = useParams();
  const router = useRouter();
  const taskId = String(params.id ?? '');
  const [generatingNext, setGeneratingNext] = useState(false);

  const timer = useTimer();
  const [task, setTask] = useState<TaskData | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [translation, setTranslation] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [error, setError] = useState('');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Card creation state
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [decks, setDecks] = useState<DeckOption[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [creatingCard, setCreatingCard] = useState(false);
  const [cardCreated, setCardCreated] = useState(false);

  // Auto-save draft to localStorage
  const draftKey = `translate-draft-${taskId}`;

  // Reset working state when navigating to a new task
  useEffect(() => {
    setTranslation('');
    setAnnotations([]);
    setShowHints(false);
    setHintUsed(false);
    setError('');
    setPhase('loading');
    setTask(null);
    setGeneratingNext(false);
  }, [taskId]);

  // Load task data
  useEffect(() => {
    async function loadTask() {
      try {
        const res = await fetch(`/api/translate/tasks/${taskId}`);
        if (!res.ok) throw new Error('Task not found');
        const data = await res.json();

        setTask(data.task);

        if (data.task.status === 'COMPLETED' && data.task.userTranslation) {
          setTranslation(data.task.userTranslation);
          setPhase('result');
        } else {
          // Restore draft if exists
          const draft = localStorage.getItem(draftKey);
          if (draft) setTranslation(draft);
          setPhase('translating');
          timer.start();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        setPhase('loading');
      }
    }
    loadTask();
  }, [taskId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save draft
  useEffect(() => {
    if (phase === 'translating' && translation) {
      localStorage.setItem(draftKey, translation);
    }
  }, [translation, phase, draftKey]);

  // Handle submit
  async function handleSubmit() {
    if (!translation.trim()) return;
    setPhase('submitting');
    setError('');

    const timeSpent = timer.stop();

    try {
      const res = await fetch(`/api/translate/${taskId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTranslation: translation,
          timeSpentMs: timeSpent,
          hintUsed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '提交失败');
        setPhase('translating');
        return;
      }

      setTask(data.task);
      setAnnotations(data.annotations || []);
      setPhase('result');
      localStorage.removeItem(draftKey);
    } catch {
      setError('网络错误，请重试');
      setPhase('translating');
    }
  }

  // Re-translate same task
  function handleRetry() {
    setTranslation('');
    setAnnotations([]);
    setPhase('translating');
    timer.start();
    textareaRef.current?.focus();
  }

  // Generate next task with same topic/difficulty
  async function handleGenerateNext() {
    if (!task) return;
    setGeneratingNext(true);
    setError('');
    try {
      const res = await fetch('/api/translate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: task.topic, difficulty: task.difficulty }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '生成失败');
        return;
      }
      router.push(`/translate/${data.task.id}`);
    } catch {
      setError('网络错误，请重试');
    } finally {
      setGeneratingNext(false);
    }
  }

  // Open card creation modal
  function openCardModal(front: string, back: string) {
    setCardFront(front);
    setCardBack(back);
    setShowCardModal(true);
    setCardCreated(false);
    // Load decks
    fetch('/api/decks')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setDecks(list.map((d: DeckOption) => ({ id: d.id, title: d.title })));
      })
      .catch(() => {});
  }

  // Create card
  async function handleCreateCard() {
    setCreatingCard(true);
    try {
      const res = await fetch(`/api/translate/${taskId}/create-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          front: cardFront,
          back: cardBack,
          deckId: selectedDeckId || undefined,
        }),
      });
      if (res.ok) {
        setCardCreated(true);
      }
    } catch {
      // silently fail
    } finally {
      setCreatingCard(false);
    }
  }

  // === Render ===

  if (phase === 'loading' && !task) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/translate" className="text-blue-600 hover:text-blue-700 text-sm">
          返回翻译大厅
        </Link>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/translate"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          返回大厅
        </Link>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {phase === 'translating' && (
            <span className="font-mono">{timer.formatted}</span>
          )}
          <span className="flex items-center gap-1">
            <span className={`text-xs px-1.5 py-0.5 rounded ${difficultyBadge(task.difficulty)}`}>
              {difficultyLabel(task.difficulty)}
            </span>
            {task.topic}
          </span>
        </div>
      </div>

      {/* Source text */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">
          场景源文本
        </div>
        <p className="text-lg text-gray-900 leading-relaxed">
          {task.sourceText}
        </p>
        {phase === 'translating' && (
          <button
            onClick={() => {
              const arr = task.hintWords;
              if (arr && arr.length > 0) {
                setShowHints(!showHints);
                if (!hintUsed) setHintUsed(true);
              }
            }}
            className="mt-3 text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {showHints ? '隐藏提示' : '获取核心词汇提示（扣2分）'}
          </button>
        )}
        {showHints && task.hintWords && (
          <div className="mt-2 flex flex-wrap gap-2">
            {task.hintWords.map((word, i) => (
              <span key={i} className="px-2 py-1 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                {word}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Translation input */}
      {(phase === 'translating' || phase === 'submitting') && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">
            你的翻译
          </div>
          <textarea
            ref={textareaRef}
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            disabled={phase === 'submitting'}
            placeholder="Type your English translation here..."
            className="w-full h-40 p-4 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
          <button
            onClick={handleSubmit}
            disabled={phase === 'submitting' || !translation.trim()}
            className="mt-3 w-full h-11 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {phase === 'submitting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI 诊断中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                提交并获取 AI 诊断
              </>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && phase !== 'loading' && (
        <p className="text-sm text-red-600 text-center mb-4">{error}</p>
      )}

      {/* AI Diagnostic Results */}
      {phase === 'result' && task.score !== null && (
        <div className="space-y-4">
          {/* Score overview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-4 font-medium">
              AI 诊断报告
            </div>
            <div className="flex items-center gap-6 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{task.score}</div>
                <div className="text-xs text-gray-400 mt-1">综合评分</div>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-3">
                {[
                  { label: '准确度', value: task.accuracyScore },
                  { label: '流利度', value: task.fluencyScore },
                  { label: '词汇量', value: task.vocabScore },
                ].map((dim) => (
                  <div key={dim.label} className="text-center">
                    <div className="text-lg font-semibold text-gray-700">{dim.value}</div>
                    <div className="text-xs text-gray-400">{dim.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* User translation with annotations */}
            {annotations.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-2">逐句诊断</div>
                <div className="text-sm leading-relaxed">
                  {highlightTranslation(task.userTranslation || '', annotations)}
                </div>
                <div className="mt-3 space-y-1">
                  {annotations.map((ann, i) => (
                    <div key={i} className="text-xs flex items-start gap-1.5">
                      <span>{ann.type === 'good' ? '🟢' : '🔴'}</span>
                      <span className={ann.type === 'good' ? 'text-green-700' : 'text-red-700'}>
                        {ann.comment}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI feedback */}
            {task.aiFeedback && (
              <div className="text-sm text-gray-700 bg-gray-50 rounded-md p-3 mb-3">
                {task.aiFeedback}
              </div>
            )}
          </div>

          {/* Polished version */}
          {task.aiPolished && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                  润色优化
                </div>
                <button
                  onClick={() => openCardModal(task.aiPolished ?? '', task.sourceText)}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  提取制卡
                </button>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">{task.aiPolished}</p>
            </div>
          )}

          {/* Native alternative */}
          {task.aiNativeAlt && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-amber-600 uppercase tracking-wider font-medium flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" />
                  地道表达进阶
                </div>
                <button
                  onClick={() => openCardModal(task.aiNativeAlt ?? '', task.sourceText)}
                  className="text-xs text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  整句制卡
                </button>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">{task.aiNativeAlt}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 h-10 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              针对此句再译一次
            </button>
            <button
              onClick={handleGenerateNext}
              disabled={generatingNext}
              className="flex-1 h-10 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors"
            >
              {generatingNext ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4" />
                  生成下一个任务
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Card creation modal */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">提取制卡</h3>
              <button onClick={() => setShowCardModal(false)}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            {cardCreated ? (
              <div className="p-6 text-center">
                <div className="text-green-600 font-medium mb-2">制卡成功</div>
                <p className="text-sm text-gray-500">卡片已加入你的记忆库</p>
                <button
                  onClick={() => setShowCardModal(false)}
                  className="mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  关闭
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    正面 (Front)
                  </label>
                  <textarea
                    value={cardFront}
                    onChange={(e) => setCardFront(e.target.value)}
                    className="w-full h-20 p-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    背面 (Back)
                  </label>
                  <textarea
                    value={cardBack}
                    onChange={(e) => setCardBack(e.target.value)}
                    className="w-full h-20 p-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    归属卡包（可选）
                  </label>
                  <select
                    value={selectedDeckId}
                    onChange={(e) => setSelectedDeckId(e.target.value)}
                    className="w-full h-9 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">无分类（默认）</option>
                    {decks.map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleCreateCard}
                  disabled={creatingCard || !cardFront.trim() || !cardBack.trim()}
                  className="w-full h-10 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingCard ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 创建中...</>
                  ) : (
                    '加入 Ebbinghaus 记忆库'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// === Highlight helper ===

function highlightTranslation(text: string, annotations: Annotation[]) {
  if (!annotations.length) return <span>{text}</span>;

  // Sort annotations by position in text
  const sorted = [...annotations]
    .map((ann) => ({
      ...ann,
      index: text.indexOf(ann.segment),
    }))
    .filter((ann) => ann.index !== -1)
    .sort((a, b) => a.index - b.index);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const ann of sorted) {
    if (ann.index < lastIndex) continue; // Skip overlapping

    if (ann.index > lastIndex) {
      parts.push(
        <span key={`t-${lastIndex}`}>{text.slice(lastIndex, ann.index)}</span>
      );
    }

    const color = ann.type === 'good'
      ? 'bg-green-100 text-green-800 border-b-2 border-green-400'
      : 'bg-red-100 text-red-800 border-b-2 border-red-400';

    parts.push(
      <span key={`a-${ann.index}`} className={`${color} px-0.5 rounded-sm`} title={ann.comment}>
        {ann.segment}
      </span>
    );

    lastIndex = ann.index + ann.segment.length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return parts;
}
