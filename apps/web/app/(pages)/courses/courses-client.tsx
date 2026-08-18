'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AudioLines,
  GraduationCap,
  Loader2,
  Mic,
  Plus,
  RefreshCw,
  Trash2,
  Video,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react'
import type { CourseSummary, SpeakingProgress, SpeakingDifficultyValue } from '@ebbinghaus/shared'

function formatDuration(ms: number): string {
  if (!ms) return '--:--'
  const totalSec = Math.round(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

const DIFFICULTY_LABEL: Record<SpeakingDifficultyValue, string> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
}

const DIFFICULTIES: SpeakingDifficultyValue[] = ['EASY', 'MEDIUM', 'HARD']

/** 学习方式选择弹窗：听力入口 + 三难度口语入口（各带进度） */
function LearnModeModal({ course, onClose }: { course: CourseSummary; onClose: () => void }) {
  const [speaking, setSpeaking] = useState<SpeakingProgress[] | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/courses/${course.id}/speak`)
      .then(async (res) => {
        if (!res.ok) throw new Error('failed')
        const data: { progress: SpeakingProgress[] } = await res.json()
        if (alive) setSpeaking(data.progress)
      })
      .catch(() => {
        // 口语进度拉取失败不阻断听力入口；难度按钮显示占位
      })
    return () => {
      alive = false
    }
  }, [course.id])

  const listeningDone = course.progress?.completedSentenceIds.length ?? 0
  const listeningPct = course.sentenceCount > 0 ? Math.round((listeningDone / course.sentenceCount) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{course.title}</h2>
            <p className="mt-0.5 text-xs text-gray-400">选择学习方式</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg" title="关闭">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <Link
            href={`/courses/${course.id}`}
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <AudioLines className="w-4 h-4" />
              听力学习
            </span>
            <span className="text-xs text-blue-500">
              {course.progress?.status === 'COMPLETED' ? '已完成 ✓' : listeningPct > 0 ? `${listeningDone}/${course.sentenceCount} 句` : '开始学习'}
            </span>
          </Link>

          <p className="pt-1 text-xs text-gray-400">口语学习</p>
          {DIFFICULTIES.map((d) => {
            const row = speaking?.find((p) => p.difficulty === d)
            const done = row?.completedSentenceIds.length ?? 0
            return (
              <Link
                key={d}
                href={`/courses/${course.id}/speak?level=${d}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mic className="w-4 h-4 text-blue-600" />
                  {DIFFICULTY_LABEL[d]}
                </span>
                <span className="text-xs text-gray-500">
                  {row?.status === 'COMPLETED' ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 已完成
                    </span>
                  ) : (
                    <>
                      {done}/{course.sentenceCount} 句
                      <span className="ml-2 text-blue-600 font-medium">{done > 0 ? '继续' : '开始'}</span>
                    </>
                  )}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ course }: { course: CourseSummary }) {
  if (course.status === 'READY') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> 就绪
      </span>
    )
  }
  if (course.status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full" title={course.error ?? ''}>
        <AlertCircle className="w-3 h-3" /> 转写失败
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
      <Loader2 className="w-3 h-3 animate-spin" /> 待转写
    </span>
  )
}

export function CoursesClient() {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transcribingId, setTranscribingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [modalCourse, setModalCourse] = useState<CourseSummary | null>(null)
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/courses')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: { courses: CourseSummary[] } = await res.json()
      setCourses(data.courses)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current)
    }
  }, [load])

  // 有转写中的课程时轮询刷新
  useEffect(() => {
    const anyProcessing = courses.some((c) => c.status === 'PROCESSING')
    if (!anyProcessing) return
    pollTimer.current = setTimeout(load, 5000)
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current)
    }
  }, [courses, load])

  async function triggerTranscribe(id: string) {
    setTranscribingId(id)
    try {
      await fetch(`/api/courses/${id}/transcribe`, { method: 'POST' })
    } catch {
      // 轮询会反映最终状态
    } finally {
      setTranscribingId(null)
      load()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除这门课程？媒体文件与进度将一并删除。')) return
    setDeletingId(id)
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' })
      setCourses((prev) => prev.filter((c) => c.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-blue-600" />
          听力课程
        </h1>
        <Link
          href="/courses/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          上传课程
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <AudioLines className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">还没有课程，上传一个音频或视频开始听力练习</p>
          <Link
            href="/courses/new"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 border border-blue-300 text-blue-600 text-sm rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> 上传第一个课程
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const MediaIcon = course.mediaType === 'VIDEO' ? Video : AudioLines
            const done = course.progress?.completedSentenceIds.length ?? 0
            const pct = course.sentenceCount > 0 ? Math.round((done / course.sentenceCount) * 100) : 0
            return (
              <div key={course.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow flex flex-col">
                <div className="relative aspect-video bg-gray-100">
                  {course.coverPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/courses/${course.id}/media?type=cover`}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <MediaIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge course={course} />
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-medium text-gray-900 truncate" title={course.title}>
                    {course.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                    <span>{formatDuration(course.durationMs)}</span>
                    <span>·</span>
                    <span>{course.sentenceCount > 0 ? `${course.sentenceCount} 句` : '未转写'}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-0.5">
                      <MediaIcon className="w-3 h-3" />
                      {course.mediaType === 'VIDEO' ? '视频' : '音频'}
                    </span>
                  </p>

                  {course.sentenceCount > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {course.progress?.status === 'COMPLETED' ? '已完成 ✓' : `${done}/${course.sentenceCount} 句`}
                      </p>
                    </div>
                  )}

                  {course.status === 'FAILED' && course.error && (
                    <p className="mt-2 text-xs text-red-500 line-clamp-2" title={course.error}>
                      {course.error}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    {course.status === 'READY' ? (
                      <button
                        onClick={() => setModalCourse(course)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {pct > 0 ? '继续学习' : '开始学习'}
                      </button>
                    ) : (
                      <button
                        onClick={() => triggerTranscribe(course.id)}
                        disabled={transcribingId === course.id || course.status === 'PROCESSING'}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:opacity-60 transition-colors"
                      >
                        {transcribingId === course.id || course.status === 'PROCESSING' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {course.status === 'PROCESSING' ? '转写中…' : '转写中…'}
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            {course.status === 'FAILED' ? '重试转写' : '开始转写'}
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(course.id)}
                      disabled={deletingId === course.id}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="删除课程"
                    >
                      {deletingId === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalCourse && <LearnModeModal course={modalCourse} onClose={() => setModalCourse(null)} />}
    </div>
  )
}
