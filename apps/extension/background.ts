// Background service worker
// Handles queue management, sync scheduling, and extension lifecycle

import { Storage } from '@plasmohq/storage'
import { HunterStorage } from '@/lib/storage'
import { SYNC_QUEUE_ALARM, SYNC_INTERVAL_MINUTES, type SyncMetrics } from '@/background/types'
import { syncQueue } from '@/background/sync-queue'
import { setupMessageHandler } from '@/background/message-handler'

const storage = new Storage()
const hunterStorage = new HunterStorage()

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('Hunter Plugin installed - initializing...')

    const settings = await hunterStorage.getSettings()
    if (!settings.apiKey) {
      console.log('First run detected - opening onboarding')
      chrome.tabs.create({ url: chrome.runtime.getURL('tabs/onboarding.html') })
    }

    await storage.set('syncMetrics', {
      lastSyncTime: Date.now(),
      lastSyncStatus: 'success',
      consecutiveErrors: 0,
    } as SyncMetrics)

    chrome.alarms.create(SYNC_QUEUE_ALARM, {
      delayInMinutes: SYNC_INTERVAL_MINUTES,
      periodInMinutes: SYNC_INTERVAL_MINUTES,
    })

    console.log('Sync alarm scheduled')
  }
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === SYNC_QUEUE_ALARM) {
    await syncQueue()
  }
})

setupMessageHandler()

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId !== 0) return
  const url = details.url
  if (!url.includes(':~:text=')) return

  chrome.tabs.sendMessage(details.tabId, {
    action: 'ebbinghaus-source-locate',
    url,
  }).catch(() => {
    setTimeout(() => {
      chrome.tabs.sendMessage(details.tabId, {
        action: 'ebbinghaus-source-locate',
        url,
      }).catch(() => {})
    }, 500)
  })
})

console.log('Hunter Plugin service worker loaded')
