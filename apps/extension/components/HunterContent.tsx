import { useState, useEffect } from 'react'
import { hunterStorage } from '@/lib/storage'
import WordCapture from '@/components/WordCapture'
import WordDrawer from '@/components/WordDrawer'

function HunterContent() {
  const [isBlacklisted, setIsBlacklisted] = useState(false)
  const domain = window.location.hostname

  useEffect(() => {
    hunterStorage.isBlacklisted(domain).then(setIsBlacklisted)

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      if (area === 'local' && changes['hunter-settings']) {
        hunterStorage.isBlacklisted(domain).then(setIsBlacklisted)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [domain])

  if (isBlacklisted) return null

  return (
    <>
      <WordCapture />
      <WordDrawer />
    </>
  )
}

export default HunterContent
