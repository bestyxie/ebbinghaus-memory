// Retry configuration for transient network failures

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000 // 1 second
const MAX_DELAY_MS = 10000 // 10 seconds
const RETRYABLE_STATUS_CODES = [408, 502, 503, 504]

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attempt: number = 0
): Promise<Response> {
  try {
    const response = await fetch(url, options)

    // Check if status is retryable
    if (!response.ok && RETRYABLE_STATUS_CODES.includes(response.status) && attempt < MAX_RETRIES) {
      const delayMs = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS)
      console.log(`API: Retrying after ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`)
      await delay(delayMs)
      return fetchWithRetry(url, options, attempt + 1)
    }

    return response
  } catch (error) {
    // Network errors are retryable
    if (attempt < MAX_RETRIES) {
      const delayMs = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS)
      console.log(`API: Network error, retrying after ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`)
      await delay(delayMs)
      return fetchWithRetry(url, options, attempt + 1)
    }

    throw error
  }
}
