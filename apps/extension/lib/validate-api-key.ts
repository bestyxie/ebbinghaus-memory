// Validate API key format

export function isValidApiKeyFormat(key: string): boolean {
  if (!key || key.trim().length === 0) {
    return false
  }

  const trimmedKey = key.trim()

  if (trimmedKey === 'your-api-key-here' ||
      trimmedKey === 'YOUR_API_KEY' ||
      trimmedKey.length < 16) {
    return false
  }

  const tokenPattern = /^[A-Za-z0-9_\-\.]{16,}$/
  return tokenPattern.test(trimmedKey)
}
