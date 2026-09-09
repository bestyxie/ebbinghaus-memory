'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AudioLines, Loader2, Maximize, Minimize, X } from 'lucide-react'
import type { CourseSummary, TranscriptSentence } from '@ebbinghaus/shared'
import { sentenceIndexAtMs } from '@/app/lib/course-words'
import { PlaybackRate } from '@/app/components/playback-rate'

interface CoursePlayerData {
  id: string
  title: string
  mediaType: 'AUDIO' | 'VIDEO'
  coverPath: string | null
  durationMs: number
  status: 'PROCESSING' | 'READY' | 'FAILED'
  transcript: TranscriptSentence[]
}

function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000))
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

/**
 * 全片播放弹窗：播放完整音频/视频，逐句字幕同步高亮，点击句子跳转播放。
 * 入口：课程列表封面点击（仅 READY 课程）。支持原生媒体全屏 + 弹窗全屏两种。
 */
export function CourseFullPlayer({ course, onClose }: { course: CourseSummary; onClose: () => void }) {
  const mediaUrl = `/api/courses/${course.id}/media`
  const coverUrl = course.coverPath ? `${mediaUrl}?type=cover` : null

  const containerRef = useRef<HTMLDivElement | null>(null)
  const mediaRef = useRef<HTMLMediaElement | null>(null)
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [data, setData] = useState<CoursePlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [rate, setRate] = useState(1)
  const [showRate, setShowRate] = useState(false)

  const transcript = useMemo(() => data?.transcript ?? [], [data])

  // 拉取详情（transcript）
  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch(`/api/courses/${course.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const body: { course: CoursePlayerData } = await res.json()
        if (!alive) return
        setData(body.course)
      })
      .catch((e) => {
        if (alive) setLoadError(e instanceof Error ? e.message : '加载失败')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [course.id])

  // 卸载时暂停播放并退出全屏
  useEffect(() => {
    return () => {
      mediaRef.current?.pause()
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  // 播放位置 → 当前句高亮（timeupdate ~4Hz，值不变则跳过重渲染）
  const syncActive = useCallback(() => {
    const el = mediaRef.current
    if (!el) return
    const idx = sentenceIndexAtMs(transcript, el.currentTime * 1000)
    setActiveIdx((prev) => (prev === idx ? prev : idx))
  }, [transcript])

  // 播放倍速同步到媒体元素
  useEffect(() => {
    if (mediaRef.current) mediaRef.current.playbackRate = rate
  }, [rate])

  // 当前句变化时滚入可视区（字幕跟读）
  useEffect(() => {
    if (activeIdx == null) return
    rowRefs.current[activeIdx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIdx])

  // Esc 关闭弹窗（全屏态下 Esc 由浏览器接管退出全屏，不关闭弹窗）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // 监听容器全屏状态（含原生媒体全屏）
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const jumpToSentence = useCallback(
    (idx: number) => {
      const s = transcript[idx]
      const el = mediaRef.current
      if (!s || !el) return
      setActiveIdx(idx)
      el.currentTime = s.startMs / 1000
      void el.play().catch(() => {})
    },
    [transcript],
  )

  const toggleStageFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {})
    } else {
      void el.requestFullscreen().catch(() => {})
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col bg-white overflow-hidden ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl'
        }`}
      >
        {/* 头部：标题 + 播放速度 + 全屏 + 关闭 */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100 shrink-0">
          <h2 className="flex items-center gap-2 min-w-0">
            <AudioLines className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate text-sm font-medium text-gray-900" title={course.title}>
              {course.title}
            </span>
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <PlaybackRate rate={rate} open={showRate} onToggle={() => setShowRate((v) => !v)} onRateChange={setRate} />
            <button
              onClick={toggleStageFullscreen}
              title={isFullscreen ? '退出全屏' : '全屏播放'}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button onClick={onClose} title="关闭" className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loadError ? (
          <div className="px-5 py-10 text-center text-sm text-red-600">
            {loadError}
            <div className="mt-4">
              <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                关闭
              </button>
            </div>
          </div>
        ) : data && data.status !== 'READY' ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">课程还未完成转写，暂不能全片播放</div>
        ) : (
          <div className={`flex min-h-0 flex-col ${isFullscreen ? 'flex-1' : ''}`}>
            {/* 媒体区：视频显示画面；音频显示封面 + 控制条 */}
            <div className="px-5 pt-4 bg-gray-50">
              {course.mediaType === 'VIDEO' ? (
                <video
                  ref={(el) => {
                    mediaRef.current = el
                  }}
                  src={mediaUrl}
                  poster={coverUrl ?? undefined}
                  controls
                  playsInline
                  preload="metadata"
                  onTimeUpdate={syncActive}
                  onEnded={() => setActiveIdx(null)}
                  className="w-full max-h-[52vh] bg-black object-contain rounded-lg"
                />
              ) : (
                <div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-white">
                    {coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gradient-to-br from-blue-50 to-gray-50">
                        <AudioLines className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  <audio
                    ref={(el) => {
                      mediaRef.current = el
                    }}
                    src={mediaUrl}
                    controls
                    preload="metadata"
                    onTimeUpdate={syncActive}
                    onEnded={() => setActiveIdx(null)}
                    className="mt-3 w-full"
                  />
                </div>
              )}
            </div>

            {/* 字幕区：逐句文本，当前句高亮；点击跳转 */}
            <div
              className={`overflow-y-auto px-3 py-2 ${isFullscreen ? 'flex-1 min-h-0' : 'max-h-[32vh]'}`}
            >
              {loading ? (
                <div className="flex justify-center py-10 text-gray-300">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : transcript.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">暂无字幕文本</p>
              ) : (
                transcript.map((s, i) => {
                  const active = activeIdx === i
                  return (
                    <button
                      key={s.idx}
                      ref={(el) => {
                        rowRefs.current[i] = el
                      }}
                      onClick={() => jumpToSentence(i)}
                      className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        active ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`mt-0.5 w-6 shrink-0 text-right font-mono text-xs leading-5 ${
                          active ? 'text-blue-600 font-semibold' : 'text-gray-300'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span
                          className={`block text-[15px] leading-6 ${
                            active ? 'text-blue-900 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {s.text}
                        </span>
                        {s.translation && (
                          <span className="mt-0.5 block text-xs leading-5 text-gray-400">{s.translation}</span>
                        )}
                      </span>
                      <span className="mt-1 shrink-0 font-mono text-[10px] leading-4 text-gray-300">
                        {formatClock(s.startMs)}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
