'use client'

import { Sparkles, Timer, Brain } from 'lucide-react'

interface MetricCardProps {
  icon: 'auto_awesome' | 'timer' | 'psychology'
  label: string
  value: string | number
  color: 'blue' | 'yellow' | 'pink'
}

const colorMap = {
  blue: 'bg-note-blue',
  yellow: 'bg-note-yellow',
  pink: 'bg-note-pink',
}

const IconMap = {
  auto_awesome: Sparkles,
  timer: Timer,
  psychology: Brain,
}

export function MetricCard({ icon, label, value, color }: MetricCardProps) {
  const Icon = IconMap[icon]

  return (
    <div className={`sticky-note ${colorMap[color]} p-8 rounded-2xl flex flex-col justify-between h-40 group hover:shadow-xl transition-all border border-black/5`}>
      <Icon className="h-7 w-7 text-black/40 group-hover:scale-110 transition-transform" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
