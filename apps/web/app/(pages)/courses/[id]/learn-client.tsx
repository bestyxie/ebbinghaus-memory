'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

import Link from 'next/link'
import { ArrowLeft, Eye, Loader2, Play, Send, Trophy } from 'lucide-react'
import type { Transcript, UpdateCourseProgressInput } from '@ebbinghaus/shared'
import {
  initDictation,
  handleSpace,
  handleBackspace,
  compareAll,
  revealAll,
  type DictationState,
} from '@/app/lib/dictation-flow'
import { useSentenceAudio } from './use-sentence-audio'

interface CourseDetail {
  id: string
  title: string
  mediaType: 'AUDIO' | 'VIDEO'
  durationMs: number
  status: 'PROCESSING' | 'READY' | 'FAILED'
  error: string | null
  transcript: Transcript
  progress: {
    sentenceIndex: number
    completedSentenceIds: number[]
    status: 'IN_PROGRESS' | 'COMPLETED'
  } | null
}

/** 词框样式：输入中/锁定对/锁定错/揭示 */
function wordBoxClass(word: DictationState['words'][number], focused: boolean): string {
  const base =
    'inline-block rounded border-b-2 bg-transparent px-1 py-0.5 text-center text-lg outline-none transition-colors font-mono'
  if (word.isProperNoun) {
    return `${base} border-transparent text-gray-800 cursor-default`
  }
  if (word.locked && word.verdict === 'correct') {
    return `${base} border-green-500 text-green-700 bg-green-50`
  }
  if (word.locked && word.verdict === 'wrong') {
    // 错词保持可改：红框输入态
    return `${base} border-red-400 text-red-600 bg-red-50`
  }
  if (!word.locked && word.verdict === 'wrong') {
    return `${base} border-red-400 text-red-600 bg-red-50`
  }
  if (word.locked && word.verdict === 'revealed') {
    return `${base} border-gray-300 text-gray-800 bg-gray-50`
  }
  // 可输入
  return `${base} border-gray-300 focus:border-blue-500 focus:bg-blue-50 ${focused ? 'border-blue-500 bg-blue-50' : 'bg-white'}`
}

function inputWidth(word: DictationState['words'][number]): number {
  // 宽度随实际输入动态扩展，保证单词完整可见（min 3ch）；句子容器 flex-wrap 自动换行
  return Math.max(word.expected.length, word.input.length, 3)
}

export function LearnCourseClient() {
  const { id } = useParams<{ id: string }>()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { playTwice } = useSentenceAudio(audioRef)

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [dictation, setDictation] = useState<DictationState | null>(null)
  const [completedIds, setCompletedIds] = useState<number[]>([])
  const [finished, setFinished] = useState(false)
  const completedRef = useRef<Set<number>>(new Set())

  // 加载课程
  useEffect(() => {
    let alive = true
    fetch(`/api/courses/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: { course: CourseDetail } = await res.json()
        if (!alive) return
        setCourse(data.course)
        const start = data.course.progress?.sentenceIndex ?? 0
        const safeStart = Math.min(start, Math.max(0, data.course.transcript.length - 1))
        setSentenceIndex(safeStart)
        data.course.progress?.completedSentenceIds.forEach((i) => completedRef.current.add(i))
        setCompletedIds([...completedRef.current])
        if (data.course.progress?.status === 'COMPLETED') {
          setFinished(true)
        }
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : '加载失败')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [id])

  const sentences = useMemo(() => course?.transcript ?? [], [course])
  const sentence = sentences[sentenceIndex]

  // 进入句子：初始化状态机 + 自动播两遍
  const enterSentence = useCallback(
    (idx: number) => {
      const s = sentences[idx]
      if (!s) return
      setSentenceIndex(idx)
      setDictation(initDictation(s.words))
      playTwice(s.startMs, s.endMs)
    },
    [sentences, playTwice],
  )

  useEffect(() => {
    if (course && sentences.length > 0 && !dictation) {
      enterSentence(sentenceIndex)
    }
    // 仅初始加载后触发一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course])

  // 保存进度
  const saveProgress = useCallback(
    (idx: number, completed: Set<number>, isFinished: boolean) => {
      const payload: UpdateCourseProgressInput = {
        sentenceIndex: idx,
        completedSentenceIds: [...completed],
        status: isFinished ? 'COMPLETED' : 'IN_PROGRESS',
      }
      fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {})
    },
    [id],
  )

  /** 完成当前句：记录 + 进下一句或结课 */
  const completeSentence = useCallback(() => {
    completedRef.current.add(sentenceIndex)
    setCompletedIds([...completedRef.current])
    const isLast = sentenceIndex >= sentences.length - 1
    if (isLast) {
      setFinished(true)
      saveProgress(sentenceIndex, completedRef.current, true)
    } else {
      saveProgress(sentenceIndex, completedRef.current, false)
    }
  }, [sentenceIndex, sentences.length, saveProgress])

  function nextSentence() {
    if (sentenceIndex < sentences.length - 1) {
      enterSentence(sentenceIndex + 1)
    }
  }

  // === 交互处理器 ===

  function doCompare(state: DictationState) {
    const r = compareAll(state)
    setDictation(r.state)
    return r
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (!dictation) return
    if (e.key === ' ') {
      e.preventDefault()
      const r = handleSpace(dictation, index)
      if (r.shouldCheck) {
        const result = doCompare(r.state)
        if (result.allCorrect) {
          completeSentence()
        }
      } else {
        setDictation(r.state)
      }
    } else if (e.key === 'Backspace') {
      const r = handleBackspace(dictation, index)
      if (r.moved) {
        e.preventDefault()
        setDictation(r.state)
      }
    } else if (e.key === 'Enter') {
      // 完成态下回车进下一句
      if (dictation.phase === 'done') {
        e.preventDefault()
        nextSentence()
      }
    }
  }

  function onInputChange(value: string, index: number) {
    if (!dictation) return
    // 输入不含空格
    const clean = value.replace(/\s/g, '')
    const word = dictation.words[index]
    if (word.locked) return
    setDictation({
      ...dictation,
      words: dictation.words.map((w, i) =>
        i === index ? { ...w, input: clean, verdict: clean === '' ? null : w.verdict } : w,
      ),
    })
  }

  function focusWord(index: number) {
    // 错词本就保持可编辑，无需解锁；占位符提示正确答案
    void index
  }

  function onSubmit() {
    if (!dictation || dictation.phase === 'done') return
    const result = doCompare(dictation)
    if (result.allCorrect) completeSentence()
  }

  function onReveal() {
    if (!dictation || dictation.phase === 'done') return
    setDictation(revealAll(dictation))
    completeSentence()
  }

  function onReplay() {
    if (!sentence) return
    playTwice(sentence.startMs, sentence.endMs)
  }

  function restartCourse() {
    completedRef.current = new Set()
    setCompletedIds([])
    setFinished(false)
    saveProgress(0, new Set(), false)
    enterSentence(0)
  }

  // 焦点管理：cursor 变化时聚焦
  const cursorRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    cursorRef.current?.focus()
  }, [dictation?.cursor])

  const progressPct = useMemo(
    () => (sentences.length > 0 ? Math.round((completedIds.length / sentences.length) * 100) : 0),
    [completedIds.length, sentences.length],
  )

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-red-600 mb-4">{error ?? '课程不存在'}</p>
        <Link href="/courses" className="text-blue-600 hover:underline">
          返回课程列表
        </Link>
      </div>
    )
  }

  if (course.status !== 'READY') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-gray-600 mb-2">
          {course.status === 'PROCESSING' ? '课程还未完成转写' : `转写失败：${course.error ?? '未知错误'}`}
        </p>
        <Link href="/courses" className="text-blue-600 hover:underline">
          返回课程列表
        </Link>
      </div>
    )
  }

  // 完成态
  if (finished) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <Trophy className="w-16 h-16 mx-auto text-amber-400 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">课程完成！</h1>
        <p className="text-gray-500 mb-8">
          {course.title} · 共 {sentences.length} 句
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={restartCourse}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            重新学习
          </button>
          <Link
            href="/courses"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
          >
            返回课程列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col min-h-[80vh]">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-2">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> {course.title}
        </Link>
        <span className="text-sm text-gray-500">
          第 {sentenceIndex + 1} / {sentences.length} 句
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-8">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      {/* 隐藏 audio 元素（视频也只用音轨） */}
      <audio ref={audioRef} src={`/api/courses/${course.id}/media`} preload="auto" className="hidden" />

      {/* 句子区 */}
      {sentence && dictation ? (
        <div className="flex-1 flex items-center justify-center">
          <div
            className={`flex flex-wrap items-baseline justify-center gap-x-2 gap-y-4 max-w-3xl p-6 rounded-2xl transition-colors ${
              dictation.phase === 'done' && dictation.words.every((w) => w.locked)
                ? 'bg-green-50/60'
                : ''
            }`}
          >
            {dictation.words.map((word, i) =>
              word.isProperNoun ? (
                <span
                  key={i}
                  className="text-lg text-gray-800 px-1 py-0.5 select-none"
                  title="专有名词无需输入"
                >
                  {word.expected}
                </span>
              ) : word.locked && word.verdict !== 'wrong' ? (
                <span key={i} className={wordBoxClass(word, false)}>
                  {word.input || word.expected}
                </span>
              ) : (
                <input
                  key={i}
                  ref={i === dictation.cursor ? cursorRef : null}
                  value={word.input}
                  placeholder={word.verdict === 'wrong' ? word.expected : ''}
                  onChange={(e) => onInputChange(e.target.value, i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  onFocus={() => focusWord(i)}
                  disabled={dictation.phase === 'checking'}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  style={{ width: `${inputWidth(word)}ch` }}
                  className={wordBoxClass(word, i === dictation.cursor)}
                />
              ),
            )}
          </div>
        </div>
      ) : null}

      {/* 完成提示 */}
      {dictation?.phase === 'done' && (
        <div className="text-center mb-4">
          <p className="text-sm text-green-600 font-medium">
            {wrongMarkCount(dictation) > 0 ? '本句完成（有标红的词）' : '全部正确！'}
          </p>
          {sentenceIndex < sentences.length - 1 && (
            <button
              onClick={nextSentence}
              className="mt-2 px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
            >
              下一句（回车）
            </button>
          )}
        </div>
      )}

      {/* 底部按钮 */}
      <div className="flex items-center justify-center gap-3 pt-6 border-t border-gray-100">
        <button
          onClick={onReplay}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
        >
          <Play className="w-4 h-4" /> 播放语音
        </button>
        <button
          onClick={onSubmit}
          disabled={!dictation || dictation.phase === 'done'}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> 提交
        </button>
        <button
          onClick={onReveal}
          disabled={!dictation || dictation.phase === 'done'}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <Eye className="w-4 h-4" /> 显示正确答案
        </button>
      </div>
    </div>
  )
}

function wrongMarkCount(state: DictationState): number {
  return state.words.filter((w) => w.verdict === 'wrong').length
}
