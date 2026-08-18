import { Suspense } from 'react'
import { speakingDifficultySchema, type SpeakingDifficultyValue } from '@ebbinghaus/shared'
import { SpeakClient } from './speak-client'

export default async function SpeakPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>
}) {
  const params = await searchParams
  const parsed = speakingDifficultySchema.safeParse(params.level?.toUpperCase())
  const level: SpeakingDifficultyValue = parsed.success ? parsed.data : 'EASY'
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-6 py-16 text-gray-400">加载中…</div>}>
      <SpeakClient level={level} />
    </Suspense>
  )
}