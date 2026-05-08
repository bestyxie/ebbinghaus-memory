// Message handler for chrome.runtime.onMessage

import { HunterStorage, type QueuedWord } from '@/lib/storage'
import { EbbinghausAPI, toFlashcardDTO } from '@/lib/ebbinghaus-api'
import { getSyncState } from './sync-state'
import { syncQueue } from './sync-queue'

const hunterStorage = new HunterStorage()

export function setupMessageHandler(): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'getSyncState':
        getSyncState().then(sendResponse)
        return true

      case 'syncNow':
        syncQueue().then(() => sendResponse({ success: true }))
        return true

      case 'getQueueSize':
        hunterStorage.getQueue().then(queue => sendResponse({ size: queue.length }))
        return true

      case 'addToQueue':
        handleAddToQueue(message.word).then(sendResponse)
        return true

      case 'openOptions':
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') })
        sendResponse({ success: true })
        return true

      case 'openReview':
        chrome.tabs.create({ url: 'https://ebbinghaus.example.com/review' })
        sendResponse({ success: true })
        return true

      default:
        return false
    }
  })
}

async function handleAddToQueue(wordData: Omit<QueuedWord, 'timestamp'>): Promise<{ success: boolean; queued: boolean; error?: string }> {
  const settings = await hunterStorage.getSettings()

  if (!settings.apiKey) {
    return { success: false, queued: false, error: 'No API key configured' }
  }

  // Try direct save to API first
  try {
    const api = new EbbinghausAPI(settings.apiKey)
    const flashcard = toFlashcardDTO({
      ...wordData,
      timestamp: Date.now(),
    })
    await api.saveWord(flashcard)

    // Update save count
    await hunterStorage.setSettings({
      totalSaves: (settings.totalSaves || 0) + 1,
    })

    console.log('Queue: Direct save succeeded for', wordData.word)
    return { success: true, queued: false }
  } catch (error) {
    console.error('Queue: Direct save failed, adding to queue:', error)
  }

  // Fallback to queue for later retry
  await hunterStorage.addToQueue({
    ...wordData,
    timestamp: Date.now(),
    retryCount: 0,
  })

  return { success: true, queued: true }
}
