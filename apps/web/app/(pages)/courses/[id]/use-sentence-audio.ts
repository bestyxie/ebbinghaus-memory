'use client'

import { useCallback, useEffect, useRef } from 'react'

/**
 * 按句播放 hook：单个 audio 元素 seek 到 startMs 播到 endMs，连播两遍
 */
export function useSentenceAudio(audioRef: React.RefObject<HTMLAudioElement | null>) {
  const playRunId = useRef(0)
  const activeRunId = useRef(0)

  useEffect(() => {
    // 卸载时停播
    const runIdRef = playRunId
    const audioElementRef = audioRef
    return () => {
      runIdRef.current++
      const audio = audioElementRef.current
      if (audio) audio.pause()
    }
  }, [audioRef])

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

  /** 播一遍句子；runId 不匹配时静默结束 */
  const playOnce = useCallback(
    (startMs: number, endMs: number, runId: number) =>
      new Promise<void>((resolve) => {
        const audio = audioRef.current
        if (!audio || runId !== playRunId.current) {
          resolve()
          return
        }
        const finish = () => {
          audio.removeEventListener('timeupdate', onTimeUpdate)
          audio.removeEventListener('ended', onEnded)
          resolve()
        }
        const onTimeUpdate = () => {
          if (audio.currentTime * 1000 >= endMs) {
            audio.pause()
            finish()
          }
        }
        const onEnded = () => finish()
        audio.addEventListener('timeupdate', onTimeUpdate)
        audio.addEventListener('ended', onEnded)
        audio.currentTime = startMs / 1000
        void audio.play().catch(() => finish())
      }),
    [audioRef],
  )

  /** 连播两遍；再次调用打断上一次 */
  const playTwice = useCallback(
    async (startMs: number, endMs: number) => {
      playRunId.current++
      const runId = playRunId.current
      activeRunId.current = runId
      const audio = audioRef.current
      if (audio) audio.pause()
      await playOnce(startMs, endMs, runId)
      if (playRunId.current !== runId) return
      await sleep(400)
      if (playRunId.current !== runId) return
      await playOnce(startMs, endMs, runId)
    },
    [playOnce, audioRef],
  )

  /** 打断播放 */
  const stop = useCallback(() => {
    playRunId.current++
    audioRef.current?.pause()
  }, [audioRef])

  return { playTwice, stop, currentRun: activeRunId }
}
