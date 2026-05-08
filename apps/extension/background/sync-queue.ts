// Queue sync logic

import { Storage } from '@plasmohq/storage'
import { HunterStorage } from '@/lib/storage'
import { EbbinghausAPI, toFlashcardDTO } from '@/lib/ebbinghaus-api'
import type { SyncMetrics } from './types'
import { notifyStateChange } from './sync-state'

const storage = new Storage()
const hunterStorage = new HunterStorage()

export async function syncQueue(): Promise<void> {
  console.log('Sync: Starting queue processing...')

  const settings = await hunterStorage.getSettings()
  if (!settings.apiKey) {
    console.log('Sync: No API key, skipping')
    return
  }

  const syncMetrics = await storage.get('syncMetrics') as SyncMetrics || {
    lastSyncTime: Date.now(),
    lastSyncStatus: 'success',
    consecutiveErrors: 0,
  }

  if (syncMetrics.retryAfter && Date.now() < syncMetrics.retryAfter) {
    const waitMinutes = Math.ceil((syncMetrics.retryAfter - Date.now()) / 60000)
    console.log(`Sync: Rate limited, retry in ${waitMinutes} minutes`)
    return
  }

  const queue = await hunterStorage.getQueue()

  if (queue.length === 0) {
    console.log('Sync: Queue empty')
    return
  }

  console.log(`Sync: Processing ${queue.length} queued words`)

  const api = new EbbinghausAPI(settings.apiKey)

  const batchSize = 10
  let processedCount = 0
  let errorCount = 0

  for (let i = 0; i < queue.length; i += batchSize) {
    const batch = queue.slice(i, i + batchSize)

    try {
      console.log(`Sync: Processing batch ${Math.floor(i / batchSize) + 1}, ${batch.length} words`)

      const flashcards = batch.map(toFlashcardDTO)
      await api.saveWords(flashcards)

      for (const word of batch) {
        await hunterStorage.removeFromQueue(word.word)
      }

      const currentSettings = await hunterStorage.getSettings()
      await hunterStorage.setSettings({
        totalSaves: (currentSettings.totalSaves || 0) + batch.length,
      })

      processedCount += batch.length

      syncMetrics.consecutiveErrors = 0
      syncMetrics.lastSyncStatus = 'success'

    } catch (error) {
      console.error('Sync: Batch processing error:', error)
      errorCount++

      if (error instanceof Error && error.message.includes('rate limited')) {
        const match = error.message.match(/retry after (\d+) seconds/)
        if (match) {
          const retrySeconds = parseInt(match[1], 10)
          syncMetrics.retryAfter = Date.now() + (retrySeconds * 1000)
          syncMetrics.lastSyncStatus = 'rate_limited'
          syncMetrics.consecutiveErrors++

          await storage.set('syncMetrics', syncMetrics)
          console.log(`Sync: Rate limited, retry after ${retrySeconds} seconds`)
          return
        }
      }

      if (error instanceof Error && error.message.includes('Unauthorized')) {
        syncMetrics.lastSyncStatus = 'error'
        syncMetrics.consecutiveErrors++
        await storage.set('syncMetrics', syncMetrics)
        console.log('Sync: Auth error - stopping sync')
        return
      }

      syncMetrics.consecutiveErrors++
      syncMetrics.lastSyncStatus = 'error'
    }
  }

  syncMetrics.lastSyncTime = Date.now()
  await storage.set('syncMetrics', syncMetrics)

  console.log(`Sync: Complete - ${processedCount} saved, ${errorCount} errors`)

  notifyStateChange()
}
