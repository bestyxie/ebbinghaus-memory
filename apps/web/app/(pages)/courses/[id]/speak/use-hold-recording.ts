'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export const MIN_RECORDING_MS = 500
export const MAX_RECORDING_MS = 120_000

/**
 * 按住录音 hook：pointer/space 按住开始、松开结束
 * 最短 0.5s（过短报错不产出 blob），最长 120s 自动截断，基本静音启发式拦截
 * onComplete(blob, durationMs) 在录音有效结束时回调（blob 归属调用方，负责创建/释放 URL）
 */
export function useHoldRecording(onComplete?: (blob: Blob, durationMs: number) => void) {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const startTimeRef = useRef(0)
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    recorderRef.current = null
    chunksRef.current = []
  }, [])

  const stop = useCallback(() => {
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') {
      rec.stop()
    }
  }, [])

  const start = useCallback(async () => {
    if (recorderRef.current) return // 已在录音
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = pickMimeType()
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []
      startTimeRef.current = Date.now()
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const elapsed = Date.now() - startTimeRef.current
        const chunks = chunksRef.current
        const mimeType = recorder.mimeType || 'audio/webm'
        cleanupStream()
        setIsRecording(false)
        if (maxTimerRef.current) {
          clearTimeout(maxTimerRef.current)
          maxTimerRef.current = null
        }
        if (elapsed < MIN_RECORDING_MS) {
          setError(`录音太短（至少 ${MIN_RECORDING_MS / 1000}s）`)
          return
        }
        const blob = new Blob(chunks, { type: mimeType })
        if (blob.size < 2000) {
          // 基本静音启发式：webm 极小体积 ≈ 无有效语音
          setError('未检测到语音，请重录')
          return
        }
        const duration = Math.min(elapsed, MAX_RECORDING_MS)
        onCompleteRef.current?.(blob, duration)
      }
      recorder.start()
      setIsRecording(true)
      // 最长 120s 自动截断
      maxTimerRef.current = setTimeout(() => {
        const rec = recorderRef.current
        if (rec && rec.state !== 'inactive') rec.stop()
      }, MAX_RECORDING_MS)
    } catch {
      setError('无法访问麦克风，请检查权限')
    }
  }, [cleanupStream])

  // 卸载清理：停止录音 + 释放麦克风
  useEffect(() => {
    return () => {
      const rec = recorderRef.current
      if (rec && rec.state !== 'inactive') rec.stop()
      cleanupStream()
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current)
    }
  }, [cleanupStream])

  return {
    isRecording,
    error,
    setError,
    start,
    stop,
  }
}

/** 浏览器 MediaRecorder 支持的优先格式（Safari 不支持 webm 时回落 mp4） */
function pickMimeType(): string | null {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  for (const mime of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      return mime
    }
  }
  return null
}