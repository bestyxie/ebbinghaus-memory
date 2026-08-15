'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AudioLines, Image as ImageIcon, Loader2, Upload, Video, X } from 'lucide-react'

const MAX_MEDIA_BYTES = 100 * 1024 * 1024

type Phase = 'form' | 'uploading' | 'transcribing' | 'error'

/** 视频截第一帧为 jpeg Blob（无封面时自动生成） */
async function captureFirstFrame(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.src = url
    const cleanup = (result: Blob | null) => {
      URL.revokeObjectURL(url)
      resolve(result)
    }
    video.onloadeddata = () => {
      // 稍微 seek 到 0.1s，避免全黑首帧
      video.currentTime = Math.min(0.1, (video.duration || 1) / 10)
    }
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx || !canvas.width) {
          cleanup(null)
          return
        }
        ctx.drawImage(video, 0, 0)
        canvas.toBlob((blob) => cleanup(blob), 'image/jpeg', 0.8)
      } catch {
        cleanup(null)
      }
    }
    video.onerror = () => cleanup(null)
    // 5s 兜底超时
    setTimeout(() => cleanup(null), 5000)
  })
}

export function NewCourseClient() {
  const router = useRouter()
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [autoCoverNote, setAutoCoverNote] = useState(false)
  const [title, setTitle] = useState('')
  const [phase, setPhase] = useState<Phase>('form')
  const [error, setError] = useState<string | null>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const isVideo = mediaFile?.type.startsWith('video/') ?? false

  function pickMedia(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      setError('只支持音频或视频文件')
      return
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setError('文件超过 100MB 上限')
      return
    }
    setError(null)
    setMediaFile(file)
    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, ''))
    }
  }

  function pickCover(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('封面必须是图片')
      return
    }
    setCoverFile(file)
    setAutoCoverNote(false)
  }

  async function submit() {
    if (!mediaFile) {
      setError('请选择音频或视频文件')
      return
    }
    if (!title.trim()) {
      setError('请填写课程标题')
      return
    }
    setError(null)
    setPhase('uploading')

    try {
      let cover = coverFile
      // 视频无封面 → 截第一帧
      if (!cover && mediaFile.type.startsWith('video/')) {
        const frame = await captureFirstFrame(mediaFile)
        if (frame) {
          cover = new File([frame], 'cover.jpg', { type: 'image/jpeg' })
          setAutoCoverNote(true)
        }
      }

      const form = new FormData()
      form.append('media', mediaFile)
      if (cover) form.append('cover', cover)
      form.append('title', title.trim())

      const uploadRes = await fetch('/api/courses', { method: 'POST', body: form })
      const uploadData: { course?: { id: string }; error?: string } = await uploadRes.json()
      if (!uploadRes.ok || !uploadData.course) {
        throw new Error(uploadData.error ?? '上传失败')
      }

      setPhase('transcribing')
      const transcriptRes = await fetch(`/api/courses/${uploadData.course.id}/transcribe`, { method: 'POST' })
      if (!transcriptRes.ok) {
        const d: { error?: string } = await transcriptRes.json().catch(() => ({}))
        throw new Error(d.error ?? '转写失败')
      }
      router.push('/courses')
    } catch (e) {
      setError(e instanceof Error ? e.message : '上传或转写失败')
      setPhase('error')
    }
  }

  const busy = phase === 'uploading' || phase === 'transcribing'

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">上传听力课程</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {autoCoverNote && !error && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
          未选择封面，已自动截取视频第一帧作为封面
        </div>
      )}

      {/* 媒体选择 */}
      <div
        onClick={() => !busy && mediaInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (!busy) pickMedia(e.dataTransfer.files[0])
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          mediaFile ? 'border-blue-400 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } ${busy ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={mediaInputRef}
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          onChange={(e) => pickMedia(e.target.files?.[0])}
        />
        {mediaFile ? (
          <div className="flex items-center justify-center gap-3">
            {isVideo ? <Video className="w-8 h-8 text-blue-500" /> : <AudioLines className="w-8 h-8 text-blue-500" />}
            <div className="text-left">
              <p className="font-medium text-gray-900">{mediaFile.name}</p>
              <p className="text-xs text-gray-500">
                {(mediaFile.size / 1024 / 1024).toFixed(1)} MB · {isVideo ? '视频' : '音频'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMediaFile(null)
              }}
              className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded"
              title="移除"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">点击或拖拽音频/视频文件到这里</p>
            <p className="mt-1 text-xs text-gray-400">支持 mp3 / wav / m4a / mp4 / webm / mov，最大 100MB</p>
          </>
        )}
      </div>

      {/* 封面选择（可选） */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">
          封面 <span className="text-gray-400">（可选，视频未选封面时自动截取第一帧）</span>
        </p>
        <div className="flex items-center gap-3">
          {coverFile ? (
            <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(coverFile)} alt="封面预览" className="w-full h-full object-cover" />
              <button
                onClick={() => setCoverFile(null)}
                className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full"
                title="移除封面"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" /> 选择封面图片
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => pickCover(e.target.files?.[0])}
          />
        </div>
      </div>

      {/* 标题 */}
      <div className="mt-4">
        <label className="block text-sm text-gray-600 mb-2">课程标题</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={busy}
          maxLength={200}
          placeholder="例如：Daily English Conversation EP.1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
        />
      </div>

      {/* 提交 */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={busy || !mediaFile}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {phase === 'uploading' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> 上传中…
            </>
          )}
          {phase === 'transcribing' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> 转写中（可能需要 1-2 分钟）…
            </>
          )}
          {(phase === 'form' || phase === 'error') && (
            <>
              <Upload className="w-4 h-4" /> 上传并转写
            </>
          )}
        </button>
        <button
          onClick={() => router.push('/courses')}
          disabled={busy}
          className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          取消
        </button>
      </div>
    </div>
  )
}
