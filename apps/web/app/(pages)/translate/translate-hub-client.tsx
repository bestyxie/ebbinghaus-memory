'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Languages, Loader2, RotateCcw, Eye, Search } from 'lucide-react';
import Link from 'next/link';

// === 主题配置 ===

interface TopicOption {
  value: string;
  label: string;
}

const TOPIC_CATEGORIES: Record<string, TopicOption[]> = {
  'IT & 技术': [
    { value: 'IT 全栈开发', label: 'IT 全栈开发' },
    { value: 'DevOps 与系统运维', label: 'DevOps 与系统运维' },
    { value: '医疗 IT 与实施', label: '医疗 IT 与实施' },
  ],
  '商务': [
    { value: '奢侈品鉴定与零售', label: '奢侈品鉴定与零售' },
    { value: '金融与投资', label: '金融与投资' },
    { value: '项目管理', label: '项目管理' },
  ],
  '日常': [
    { value: '日常社交', label: '日常社交' },
    { value: '旅行与交通', label: '旅行与交通' },
    { value: '美食与烹饪', label: '美食与烹饪' },
  ],
  '学术': [
    { value: '学术写作', label: '学术写作' },
    { value: '医学研究', label: '医学研究' },
    { value: '法律与合规', label: '法律与合规' },
  ],
};

const DIFFICULTIES = [
  { value: 'basic', label: '基础表达', desc: '短句，常见词汇' },
  { value: 'advanced', label: '进阶长句', desc: '复杂句式，领域术语' },
  { value: 'expert', label: '骨灰级', desc: '长难句，高级表达' },
] as const;

// === 任务类型 ===

interface TaskSummary {
  id: string;
  topic: string;
  difficulty: string;
  sourceText: string;
  score: number | null;
  status: string;
  createdAt: string;
}

// === 状态颜色映射 ===

function statusColor(status: string) {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-700';
    case 'COMPLETED': return 'bg-green-100 text-green-700';
    case 'NEEDS_REVIEW': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'PENDING': return '待翻译';
    case 'COMPLETED': return '已完成';
    case 'NEEDS_REVIEW': return '需复习';
    default: return status;
  }
}

export function TranslateHubClient() {
  const router = useRouter();
  const [topic, setTopic] = useState('医疗 IT 与实施');
  const [difficulty, setDifficulty] = useState<'basic' | 'advanced' | 'expert'>('advanced');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // History state
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterTopic, setFilterTopic] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // All topics for filter dropdown
  const allTopics = Object.values(TOPIC_CATEGORIES).flat().map((t) => t.value);

  // Load history on mount and when filters change
  useEffect(() => {
    loadTasks();
  }, [filterStatus, filterTopic]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadTasks() {
    setLoadingTasks(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`/api/translate/tasks?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingTasks(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/translate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty }),
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
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Languages className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">沉浸式场景翻译练习</h1>
        </div>
        <p className="text-gray-500 text-sm">突破哑巴英语，将语言转化为你的硬技能。</p>
      </div>

      {/* Config Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        {/* Topic selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            当前练习主题
          </label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(TOPIC_CATEGORIES).map(([category, options]) => (
              <optgroup key={category} label={category}>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Difficulty selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            难度偏好
          </label>
          <div className="flex gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`flex-1 py-2 px-3 rounded-md border text-sm transition-colors ${
                  difficulty === d.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{d.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full h-11 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              生成场景中...
            </>
          ) : (
            '生成并开始挑战'
          )}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          历史任务档案
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索源文本..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="h-9 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部主题</option>
            {allTopics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            <option value="NEEDS_REVIEW">需复习</option>
            <option value="COMPLETED">已完成</option>
            <option value="PENDING">待翻译</option>
          </select>
        </div>

        {loadingTasks ? (
          <div className="text-center text-gray-400 py-8 text-sm">加载中...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            还没有翻译任务，点击上方按钮开始第一次挑战
          </div>
        ) : (
          <div className="space-y-3">
            {tasks
              .filter((task) => {
                if (filterTopic && task.topic !== filterTopic) return false;
                if (searchQuery && !task.sourceText.includes(searchQuery)) return false;
                return true;
              })
              .map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(task.status)}`}>
                      {statusLabel(task.status)}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      task.difficulty === 'basic' ? 'bg-green-50 text-green-600' :
                      task.difficulty === 'advanced' ? 'bg-blue-50 text-blue-600' :
                      'bg-purple-50 text-purple-600'
                    }`}>
                      {task.difficulty === 'basic' ? '基础' : task.difficulty === 'advanced' ? '进阶' : '骨灰'}
                    </span>
                    <span className="text-xs text-gray-500">{task.topic}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-1 mb-2">
                  {task.sourceText}
                </p>
                <div className="flex items-center justify-between">
                  {task.score !== null && (
                    <span className="text-sm font-medium text-gray-900">
                      得分: {task.score}
                    </span>
                  )}
                  {task.status === 'NEEDS_REVIEW' ? (
                    <Link
                      href={`/translate/${task.id}`}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 立即重译
                    </Link>
                  ) : (
                    <Link
                      href={`/translate/${task.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      {task.status === 'PENDING' ? (
                        <><RotateCcw className="w-3.5 h-3.5" /> 继续翻译</>
                      ) : (
                        <><Eye className="w-3.5 h-3.5" /> 查看详情</>
                      )}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
