// Sync state management

import { Storage } from '@plasmohq/storage'
import { HunterStorage, type SyncState } from '@/lib/storage'
import type { SyncMetrics } from './types'

const storage = new Storage()
const hunterStorage = new HunterStorage()

export async function getSyncState(): Promise<SyncState> {
  const queue = await hunterStorage.getQueue()
  const syncMetrics = await storage.get('syncMetrics') as SyncMetrics || {
    lastSyncTime: Date.now(),
    lastSyncStatus: 'success',
    consecutiveErrors: 0,
  }
  const settings = await hunterStorage.getSettings()

  const hasApiKey = !!settings.apiKey
  const isRateLimited = syncMetrics.lastSyncStatus === 'rate_limited' &&
    syncMetrics.retryAfter &&
    Date.now() < syncMetrics.retryAfter

  return {
    queueSize: queue.length,
    savedCount: settings.totalSaves || 0,
    lastSyncTime: syncMetrics.lastSyncTime,
    syncStatus: isRateLimited ? 'rate_limited' :
              syncMetrics.lastSyncStatus === 'error' ? 'error' : 'synced',
    hasApiKey,
  }
}

export function notifyStateChange(): void {
  chrome.runtime.sendMessage({
    action: 'syncStateChanged',
  }).catch(() => {
    // Ignore errors - no listeners active
  })
}
