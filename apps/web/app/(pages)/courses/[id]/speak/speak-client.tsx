'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Loader2,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Trophy,
} from 'lucide-react'
import type {
  Transcript,
  TranscriptWord,
  ScoreResult,
  SpeakingDifficultyValue,
  SpeakingProgress,
} from '@ebbinghaus/shared'
import { useSentenceAudio } from '../use-sentence-audio'
import { useHoldRecording } from './use-hold-recording'
import { sentencePlayRange } from '@/app/lib/course-words'

interface CourseDetail {
  id: string
  title: string
  mediaType: 'AUDIO' | 'VIDEO'
  durationMs: number
  status: 'PROCESSING' | 'READY' | 'FAILED'
  transcript: Transcript
  progress: {
    sentenceIndex: number
    completedSentenceIds: number[]
    status: 'IN_PROGRESS' | 'COMPLETED'
  } | null
}

const DIFFICULTY_LABEL: Record<SpeakingDifficultyValue, string> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
}

const DIFFICULTIES: SpeakingDifficultyValue[] = ['EASY', 'MEDIUM', 'HARD']

function scoreColor(score: number): string {
  if (score >= 85) return 'bg-green-100 text-green-700 border-green-300'
  if (score >= 70) return 'bg-amber-100 text-amber-700 border-amber-300'
  return 'bg-red-100 text-red-600 border-red-300'
}

/** 无词级时间戳时按归一化字符占比估算词区间 */
function estimateRange(words: { text: string }[], index: number, totalMs: number): { startMs: number; endMs: number } {
  const chars = words.map((w) => w.text.length)
  const sum = chars.reduce((a, b) => a + b, 0)
  const start = Math.round((chars.slice(0, index).reduce((a, b) => a + b, 0) / Math.max(1, sum)) * totalMs)
  const end = Math.round(((chars.slice(0, index + 1).reduce((a, b) => a + b, 0)) / Math.max(1, sum)) * totalMs)
  return { startMs: start, endMs: end }
}

export function SpeakClient({ level }: { level: SpeakingDifficultyValue }) {
  const { id } = useParams<{ id: string }>()

  const mediaRef = useRef<HTMLAudioElement | null>(null)
  const { playTwice, setRate, setPlayCount } = useSentenceAudio(mediaRef)
  const recAudioRef = useRef<HTMLAudioElement | null>(null)

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [progress, setProgress] = useState<SpeakingProgress[]>([])
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [scoring, setScoring] = useState(false)
  const [finished, setFinished] = useState(false)
  const [popupWordIdx, setPopupWordIdx] = useState<number | null>(null)
  const [sessionScores, setSessionScores] = useState<{ idx: number; score: number }[]>([])
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showRatePopup, setShowRatePopup] = useState(false)

  const [recUrl, setRecUrl] = useState<string | null>(null)
  const [recDuration, setRecDuration] = useState(0)
  const recUrlRef = useRef<string | null>(null)

  const { isRecording, error: recError, setError: setRecError, start: startRecording, stop: stopRecording } = useHoldRecording(
    handleRecordingComplete,
  )

  // 卸载时释放录音 URL
  useEffect(() => {
    return () => {
      if (recUrlRef.current) URL.revokeObjectURL(recUrlRef.current)
    }
  }, [])

  // 加载课程详情 + 三难度进度
  useEffect(() => {
    let alive = true
    Promise.all([fetch(`/api/courses/${id}`), fetch(`/api/courses/${id}/speak`)])
      .then(async ([courseRes, progressRes]) => {
        if (!courseRes.ok || !progressRes.ok) throw new Error('加载失败')
        const courseData: { course: CourseDetail } = await courseRes.json()
        const progressData: { progress: SpeakingProgress[] } = await progressRes.json()
        if (!alive) return
        setCourse(courseData.course)
        setProgress(progressData.progress)
        const row = progressData.progress.find((p) => p.difficulty === level)
        const start = row?.status === 'COMPLETED' ? Math.max(0, courseData.course.transcript.length - 1) : (row?.sentenceIndex ?? 0)
        const safeStart = Math.min(start, Math.max(0, courseData.course.transcript.length - 1))
        setSentenceIndex(safeStart)
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
  }, [id, level])

  const sentences = useMemo(() => course?.transcript ?? [], [course])
  const sentence = sentences[sentenceIndex]
  const progressRow = useMemo(() => progress.find((p) => p.difficulty === level), [progress, level])
  const recordedCount = progressRow?.completedSentenceIds.length ?? 0

  // 进入新句：清空评分态 + 简单/中等自动播放一遍
  useEffect(() => {
    if (!sentence) return
    setResult(null)
    setPopupWordIdx(null)
    if (recUrlRef.current) {
      URL.revokeObjectURL(recUrlRef.current)
      recUrlRef.current = null
      setRecUrl(null)
    }
    if (level !== 'HARD') {
      setPlayCount(1)
      const range = sentencePlayRange(sentence)
      playTwice(range.startMs, range.endMs)
    }
  }, [sentenceIndex, sentence, level, playTwice, setPlayCount])

  // 空格键按住录音
  useEffect(() => {
    if (!sentence || scoring || finished || popupWordIdx !== null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isRecording) {
        e.preventDefault()
        void startRecording()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        stopRecording()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [sentence, scoring, finished, popupWordIdx, isRecording, startRecording, stopRecording])

  const updateProgressRow = useCallback(
    (row: SpeakingProgress) => {
      setProgress((prev) => prev.map((p) => (p.difficulty === row.difficulty ? row : p)))
    },
    [],
  )

  async function handleRecordingComplete(blob: Blob, durationMs: number) {
    if (!sentence) return
    const url = URL.createObjectURL(blob)
    if (recUrlRef.current) URL.revokeObjectURL(recUrlRef.current)
    recUrlRef.current = url
    setRecUrl(url)
    setRecDuration(durationMs)

    setScoring(true)
    try {
      const form = new FormData()
      form.append('audio', blob, 'recording.webm')
      form.append('sentenceIdx', String(sentenceIndex))
      form.append('difficulty', level)
      form.append('durationMs', String(durationMs))
      const res = await fetch(`/api/courses/${id}/speak`, { method: 'POST', body: form })
      if (!res.ok) {
        const data: { error?: string } | null = await res.json().catch(() => null)
        setRecError(data?.error ?? '评分失败，请重录')
        return
      }
      const data: { result: ScoreResult; progress: SpeakingProgress } = await res.json()
      setResult(data.result)
      updateProgressRow(data.progress)
      setSessionScores((prev) => [...prev.filter((s) => s.idx !== sentenceIndex), { idx: sentenceIndex, score: data.result.overall }])
      if (data.progress.status === 'COMPLETED' && sentenceIndex === sentences.length - 1) {
        setFinished(true)
      }
    } catch {
      setRecError('网络错误，请重录')
    } finally {
      setScoring(false)
    }
  }

  // 播放原音频的词区间（词级时间戳缺失时按字符占比估算）
  const playOriginalWord = useCallback(
    (word: TranscriptWord, index: number) => {
      if (!sentence) return
      const range = word.startMs != null && word.endMs != null
        ? { startMs: word.startMs, endMs: word.endMs }
        : estimateRange(sentence.words, index, sentence.endMs - sentence.startMs)
      setPlayCount(1)
      playTwice(sentence.startMs + range.startMs, sentence.startMs + range.endMs)
    },
    [sentence, playTwice, setPlayCount],
  )

  // 播放录音的词区间（引擎未给偏移时按字符占比估算）
  const playRecordingWord = useCallback(
    (wordText: string, index: number) => {
      const audio = recAudioRef.current
      if (!audio || !recUrl) return
      const resultWord = result?.words.find((w) => w.text === wordText)
      const range = resultWord?.startMs != null && resultWord.endMs != null
        ? { startMs: resultWord.startMs, endMs: resultWord.endMs }
        : estimateRange(result?.words ?? [], index, recDuration)
      audio.pause()
      audio.currentTime = range.startMs / 1000
      void audio.play().catch(() => {})
      const onEnd = () => {
        if (audio.currentTime * 1000 >= range.endMs) {
          audio.pause()
          audio.removeEventListener('timeupdate', onEnd)
        }
      }
      audio.addEventListener('timeupdate', onEnd)
    },
    [recUrl, recDuration, result],
  )

  const goNext = useCallback(() => {
    const next = progressRow?.sentenceIndex ?? sentenceIndex + 1
    const target = next > sentenceIndex ? next : sentenceIndex + 1
    if (target >= sentences.length) {
      setFinished(true)
      return
    }
    setSentenceIndex(target)
  }, [progressRow, sentenceIndex, sentences.length])

  const goPrev = useCallback(() => {
    if (sentenceIndex > 0) setSentenceIndex(sentenceIndex - 1)
  }, [sentenceIndex])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center gap-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">加载课程…</p>
      </div>
    )
  }

  if (loadError || !course) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center text-red-600">{loadError ?? '课程不存在'}</div>
    )
  }

  const finishedSessionAvg = sessionScores.length > 0 ? Math.round(sessionScores.reduce((a, s) => a + s.score, 0) / sessionScores.length) : 0
  const bestScores = progressRow?.bestScores ?? []
  const bestAvg =
    bestScores.length > 0 && bestScores.some((s) => s != null)
      ? Math.round(bestScores.filter((s) => s != null).reduce((a, s) => a + (s ?? 0), 0) / bestScores.filter((s) => s != null).length)
      : 0

  // 完成页
  if (finished) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <Trophy className="w-12 h-12 mx-auto text-amber-500 mb-3" />
          <h1 className="text-2xl font-semibold text-gray-900">口语练习完成！</h1>
          <p className="mt-1 text-sm text-gray-500">
            {course.title} · {DIFFICULTY_LABEL[level]} · 共 {sentences.length} 句
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
            <p className="text-xs text-gray-400">本次综合分</p>
            <p className="mt-1 text-3xl font-bold text-blue-600">{finishedSessionAvg}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
            <p className="text-xs text-gray-400">历史最佳</p>
            <p className="mt-1 text-3xl font-bold text-amber-600">{bestAvg || '—'}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-3">各句成绩</h2>
          <div className="flex flex-wrap gap-2">
            {sentences.map((s, i) => {
              const score = bestScores[i]
              return (
                <span key={i} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${score != null ? scoreColor(score) : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                  {i + 1}句 {score != null ? `${Math.round(score)}分` : '未录'}
                </span>
              )
            })}
          </div>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href={`/courses/${id}?level=${level}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
          >
            继续练习
          </Link>
          <Link href="/courses" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            返回课程列表
          </Link>
        </div>
      </div>
    )
  }

  const promptText = level === 'MEDIUM' ? '请根据记忆说出英文' : ''
  const displayText = level === 'EASY' ? sentence?.text : level === 'HARD' ? (sentence?.translation ?? '（本句暂无译文）') : ''

  const progressPct = sentences.length > 0 ? Math.round((Math.min(recordedCount, sentences.length) / sentences.length) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col min-h-[80vh]">
      {/* 顶部：返回链接 + 标题/难度/进度 */}
      <div className="flex items-center justify-between mb-2">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> {course.title}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            第 {sentenceIndex + 1} / {sentences.length} 句 · 已完成 {recordedCount}/{sentences.length}
          </span>
          <div className="flex items-center gap-1">
            {DIFFICULTIES.map((d) => (
              <Link
                key={d}
                href={`/courses/${id}/speak?level=${d}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  d === level ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                }`}
              >
                {DIFFICULTY_LABEL[d]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      {/* 播放控制：右对齐（播放原音/录音 + 变速 popup），与听力页一致 */}
      <div className="flex justify-end mt-3 mb-2">
        <div className="flex items-center gap-2">
          {recUrl && (
            <button
              onClick={() => void recAudioRef.current?.play()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            >
              <Play className="w-4 h-4" /> 播放我的录音
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowRatePopup((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                showRatePopup
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Gauge className="w-4 h-4" /> {playbackRate}x
            </button>
            {showRatePopup && (
              <div className="absolute right-0 top-full mt-1 z-10 flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-white shadow-lg">
                <button
                  onClick={() => {
                    const next = Math.max(0.5, Math.round((playbackRate - 0.25) * 100) / 100)
                    setPlaybackRate(next)
                    setRate(next)
                  }}
                  disabled={playbackRate <= 0.5}
                  className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 text-lg leading-none hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  -
                </button>
                <span className="min-w-12 text-center text-sm font-medium text-gray-800">{playbackRate}x</span>
                <button
                  onClick={() => {
                    const next = Math.min(2, Math.round((playbackRate + 0.25) * 100) / 100)
                    setPlaybackRate(next)
                    setRate(next)
                  }}
                  disabled={playbackRate >= 2}
                  className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 text-lg leading-none hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 音频元素 */}
      <audio ref={mediaRef} src={`/api/courses/${id}/media`} className="hidden" />
      <audio ref={recAudioRef} src={recUrl ?? undefined} className="hidden" />

      {/* 内容区：垂直居中（与听力页句子区一致），无白底卡片 */}
      {!sentence ? (
        <div className="flex-1 flex items-center justify-center text-center text-gray-400">暂无句子</div>
      ) : (
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="w-full max-w-3xl">
            {/* 难度提示区 */}
            <div className="min-h-20 flex items-center justify-center text-center">
              {level === 'EASY' && (
                <p className="text-2xl leading-relaxed text-gray-800">{displayText}</p>
              )}
              {level === 'MEDIUM' && (
                <p className="text-lg text-gray-500">{promptText}</p>
              )}
              {level === 'HARD' && (
                <div>
                  <p className="text-xl text-gray-800">{displayText}</p>
                  <p className="mt-1 text-xs text-gray-400">看中文，说出英文</p>
                </div>
              )}
            </div>

            {/* 录音按钮 */}
            <div className="mt-8 flex flex-col items-center">
              <button
                onPointerDown={(e) => {
                  e.preventDefault()
                  void startRecording()
                }}
                onPointerUp={(e) => {
                  e.preventDefault()
                  stopRecording()
                }}
                onPointerLeave={() => {
                  if (isRecording) stopRecording()
                }}
                disabled={scoring}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                } disabled:opacity-50`}
                title="按住录音，松开结束（或按住空格键）"
              >
                {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
              </button>
              <p className="mt-3 text-xs text-gray-400">
                {isRecording ? '正在录音… 松开结束' : '按住录音，松开结束（或按住空格键）'}
                {scoring && ' · 评分中…'}
              </p>
              {recError && <p className="mt-2 text-xs text-red-500">{recError}</p>}
            </div>

            {/* 评分结果 */}
            {result && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-gray-700">评分结果</h2>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-2xl font-bold text-blue-600">{result.overall}</span>
                    <span className="text-xs text-gray-400">/100</span>
                  </div>
                </div>

                {/* 原文 + 逐词评分 */}
                <div className="flex flex-wrap gap-x-2 gap-y-2 leading-relaxed text-xl text-gray-800">
                  {sentence.words.map((word, i) => {
                    const wordScore = result.words.find((w) => w.text === word.text)?.score
                    return (
                      <button
                        key={i}
                        onClick={() => setPopupWordIdx(i)}
                        className="relative inline-flex items-start px-1 py-0.5 rounded hover:bg-blue-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                        title="查看音标与发音"
                      >
                        <span>{word.text}</span>
                        {wordScore != null && (
                          <span className={`absolute -top-2 -right-2 text-[10px] leading-none px-1 py-0.5 rounded-full border font-medium ${scoreColor(wordScore)}`}>
                            {Math.round(wordScore)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 底部按钮：上一句/下一句（icon 按钮）+ 重录/下一句，与听力页一致 */}
      <div className="flex items-center justify-between gap-3 pt-6 border-t border-gray-100">
        <button
          onClick={goPrev}
          disabled={sentenceIndex === 0}
          title="上一句"
          className="p-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          {result && (
            <button
              onClick={() => setResult(null)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4" /> 重录本句
            </button>
          )}
          <button
            onClick={() => {
              if (!sentence) return
              setPlayCount(1)
              const range = sentencePlayRange(sentence)
              playTwice(range.startMs, range.endMs)
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
          >
            <Play className="w-4 h-4" /> 播放原音
          </button>
        </div>
        <button
          onClick={goNext}
          disabled={sentenceIndex >= sentences.length - 1}
          title="下一句"
          className="p-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 逐词详情弹窗 */}
      {popupWordIdx != null && sentence && result && (
        <WordDetailModal
          word={sentence.words[popupWordIdx]}
          wordScore={result.words.find((w) => w.text === sentence.words[popupWordIdx].text)}
          hasRecording={recUrl != null}
          onClose={() => setPopupWordIdx(null)}
          onPlayOriginal={() => playOriginalWord(sentence.words[popupWordIdx], popupWordIdx)}
          onPlayRecording={() => playRecordingWord(sentence.words[popupWordIdx].text, popupWordIdx)}
        />
      )}
    </div>
  )
}

function WordDetailModal({
  word,
  wordScore,
  hasRecording,
  onClose,
  onPlayOriginal,
  onPlayRecording,
}: {
  word: TranscriptWord
  wordScore: { text: string; score: number; startMs?: number | null; endMs?: number | null } | undefined
  hasRecording: boolean
  onClose: () => void
  onPlayOriginal: () => void
  onPlayRecording: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-semibold text-gray-900">{word.text}</p>
            <p className="mt-1 text-sm text-gray-500">{word.phonetic ?? '（暂无音标）'}</p>
          </div>
          {wordScore && (
            <span className={`text-sm font-semibold px-2 py-1 rounded-full border ${scoreColor(wordScore.score)}`}>
              {Math.round(wordScore.score)}分
            </span>
          )}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={onPlayOriginal}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            <Play className="w-4 h-4" /> 原音频
          </button>
          <button
            onClick={onPlayRecording}
            disabled={!hasRecording}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            <Play className="w-4 h-4" /> 我的录音
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600 rounded-lg"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}