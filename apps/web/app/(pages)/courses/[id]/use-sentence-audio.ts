'use client'

import { useCallback, useEffect, useRef } from 'react'

/**
 * 按句播放 hook：单个 audio 元素 seek 到 startMs 播到 endMs，连播两遍
 */
export function useSentenceAudio(audioRef: React.RefObject<HTMLAudioElement | null>) {
  const playRunId = useRef(0)
  const activeRunId = useRef(0)
  const rateRef = useRef(1)
  const countRef = useRef(2)

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
        audio.playbackRate = rateRef.current
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

  /** 连播 N 遍（次数由 setPlayCount 设置，默认 2）；再次调用打断上一次 */
  const playSentence = useCallback(
    async (startMs: number, endMs: number) => {
      playRunId.current++
      const runId = playRunId.current
      activeRunId.current = runId
      const audio = audioRef.current
      if (audio) audio.pause()
      const times = Math.max(1, countRef.current)
      for (let i = 0; i < times; i++) {
        await playOnce(startMs, endMs, runId)
        if (playRunId.current !== runId) return
        if (i < times - 1) {
          await sleep(400)
          if (playRunId.current !== runId) return
        }
      }
    },
    [playOnce, audioRef],
  )

  /** 打断播放 */
  const stop = useCallback(() => {
    playRunId.current++
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      // 归零 currentTime，防止解锁后浏览器从暂停点自动续播
      try {
        audio.currentTime = 0
      } catch {
        // 未加载 metadata 时会抛错，忽略
      }
    }
  }, [audioRef])

  /** 设置播放速度（0.5 ~ 2）；立即生效 */
  const setRate = useCallback(
    (rate: number) => {
      rateRef.current = rate
      const audio = audioRef.current
      if (audio) audio.playbackRate = rate
    },
    [audioRef],
  )

  /** 设置每次播放次数（最少 1） */
  const setPlayCount = useCallback((count: number) => {
    countRef.current = Math.max(1, count)
  }, [])

  // 页面隐藏（锁屏/切后台/切标签页）时打断播放链：
  // 否则挂起的 play() promise 与 sleep 定时器在恢复可见后一起苏醒，叠加出"解锁自动播两遍"
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stop()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [stop])

  return { playTwice: playSentence, stop, setRate, setPlayCount, currentRun: activeRunId }
}
