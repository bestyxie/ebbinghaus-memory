'use client'

import { Gauge } from 'lucide-react'

/**
 * 播放速度控制按钮（听力/口语练习页共用）
 * 受控组件：open/onToggle 由父级管理（听力页需与播放次数 popup 互斥），
 * rate 变化时通过 onRateChange 通知外部（通常用于同步到 audio.playbackRate）
 */
export function PlaybackRate({
  rate,
  open,
  onToggle,
  onRateChange,
}: {
  rate: number
  open: boolean
  onToggle: () => void
  onRateChange: (rate: number) => void
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
          open ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Gauge className="w-4 h-4" /> {rate}x
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 flex items-center gap-2 p-2 rounded-xl border border-gray-200 bg-white shadow-lg">
          <button
            onClick={() => {
              const next = Math.max(0.5, Math.round((rate - 0.25) * 100) / 100)
              onRateChange(next)
            }}
            disabled={rate <= 0.5}
            className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 text-lg leading-none hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            -
          </button>
          <span className="min-w-12 text-center text-sm font-medium text-gray-800">{rate}x</span>
          <button
            onClick={() => {
              const next = Math.min(2, Math.round((rate + 0.25) * 100) / 100)
              onRateChange(next)
            }}
            disabled={rate >= 2}
            className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 text-lg leading-none hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}
