// Background types and constants

export interface SyncMetrics {
  lastSyncTime: number
  lastSyncStatus: 'success' | 'error' | 'rate_limited'
  consecutiveErrors: number
  retryAfter?: number
}

export const SYNC_QUEUE_ALARM = 'syncQueue'
export const SYNC_INTERVAL_MINUTES = 1
export const MAX_RETRY_ATTEMPTS = 3
