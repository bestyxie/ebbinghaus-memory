import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  locateByCss,
  locateByContext,
  parseTextFragment,
  locateByFragment,
  locate,
  computeRetryDelay,
  locateWithRetry,
  locateConfig,
} from '../source-locate'
import type { SourceAnchor } from '@/lib/storage'

const sampleAnchor: SourceAnchor = {
  sel: 'body > article > p#target',
  ctx: 'the ephemeral nature',
  occ: 1,
}

describe('locateByCss', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('finds element by valid CSS selector', () => {
    document.body.innerHTML = '<article><p id="target">text</p></article>'
    const result = locateByCss({ ...sampleAnchor, sel: '#target' })
    expect(result.found).toBe(true)
    if (result.found) {
      expect(result.element.id).toBe('target')
      expect(result.method).toBe('css')
    }
  })

  it('returns not found for invalid selector', () => {
    const result = locateByCss({ ...sampleAnchor, sel: '[[[invalid' })
    expect(result.found).toBe(false)
  })

  it('returns not found when selector matches nothing', () => {
    document.body.innerHTML = '<div>nothing</div>'
    const result = locateByCss({ ...sampleAnchor, sel: '#nonexistent' })
    expect(result.found).toBe(false)
  })
})

describe('locateByContext', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('finds element containing context text', () => {
    document.body.innerHTML = '<p>the ephemeral nature of beauty</p>'
    const result = locateByContext(sampleAnchor)
    expect(result.found).toBe(true)
    if (result.found) expect(result.method).toBe('context')
  })

  it('returns not found when context text absent', () => {
    document.body.innerHTML = '<p>completely different text</p>'
    const result = locateByContext(sampleAnchor)
    expect(result.found).toBe(false)
  })
})

describe('parseTextFragment', () => {
  it('extracts text from simple fragment', () => {
    expect(parseTextFragment('https://example.com/art#:~:text=ephemeral')).toBe('ephemeral')
  })

  it('extracts text from fragment with prefix and suffix', () => {
    const url = 'https://example.com/art#:~:text=the-ephemeral,-nature'
    expect(parseTextFragment(url)).toBe('ephemeral')
  })

  it('extracts text from multi-part fragment', () => {
    const url = 'https://example.com/art#:~:text=the-ephemeral,-nature'
    expect(parseTextFragment(url)).toBe('ephemeral')
  })

  it('returns null when no fragment', () => {
    expect(parseTextFragment('https://example.com/art')).toBe(null)
  })
})

describe('locateByFragment', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('finds element containing fragment text', () => {
    document.body.innerHTML = '<p>the ephemeral nature</p>'
    const result = locateByFragment('ephemeral')
    expect(result.found).toBe(true)
    if (result.found) expect(result.method).toBe('fragment')
  })

  it('returns not found for null fragment', () => {
    expect(locateByFragment(null).found).toBe(false)
  })
})

describe('locate', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('tries CSS first and returns on success', () => {
    document.body.innerHTML = '<p id="target">the ephemeral nature</p>'
    const result = locate({ ...sampleAnchor, sel: '#target' }, 'https://example.com/art#:~:text=ephemeral')
    expect(result.found).toBe(true)
    if (result.found) expect(result.method).toBe('css')
  })

  it('falls back to context when CSS fails', () => {
    document.body.innerHTML = '<p>the ephemeral nature</p>'
    const result = locate({ ...sampleAnchor, sel: '#nonexistent' }, 'https://example.com/art')
    expect(result.found).toBe(true)
    if (result.found) expect(result.method).toBe('context')
  })

  it('falls back to fragment when CSS and context fail', () => {
    document.body.innerHTML = '<p>ephemeral text here</p>'
    const result = locate(
      { ...sampleAnchor, sel: '#nonexistent', ctx: 'missing context' },
      'https://example.com/art#:~:text=ephemeral'
    )
    expect(result.found).toBe(true)
    if (result.found) expect(result.method).toBe('fragment')
  })

  it('returns not found when all three methods fail', () => {
    document.body.innerHTML = '<p>unrelated content</p>'
    const result = locate(
      { ...sampleAnchor, sel: '#nonexistent', ctx: 'missing' },
      'https://example.com/art'
    )
    expect(result.found).toBe(false)
  })
})

describe('computeRetryDelay', () => {
  it('returns initial delay for attempt 0', () => {
    expect(computeRetryDelay(0)).toBe(locateConfig.INITIAL_DELAY)
  })

  it('grows exponentially', () => {
    const d0 = computeRetryDelay(0)
    const d1 = computeRetryDelay(1)
    const d2 = computeRetryDelay(2)
    expect(d1).toBeGreaterThan(d0)
    expect(d2).toBeGreaterThan(d1)
  })

  it('caps at max delay', () => {
    expect(computeRetryDelay(20)).toBeLessThanOrEqual(locateConfig.MAX_DELAY)
  })
})

describe('locateWithRetry', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls onComplete with found result on first success', () => {
    document.body.innerHTML = '<p id="target">the ephemeral nature</p>'
    const onComplete = vi.fn()
    locateWithRetry({ ...sampleAnchor, sel: '#target' }, 'https://example.com/art', { onComplete })
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ found: true }))
  })

  it('retries on failure and succeeds when element appears', () => {
    document.body.innerHTML = ''
    const onComplete = vi.fn()
    const onAttempt = vi.fn()

    locateWithRetry(
      { ...sampleAnchor, sel: '#target' },
      'https://example.com/art',
      { maxRetries: 5, onAttempt, onComplete }
    )

    expect(onComplete).not.toHaveBeenCalled()

    // Element appears after first retry
    setTimeout(() => {
      document.body.innerHTML = '<p id="target">the ephemeral nature</p>'
    }, 150)

    vi.advanceTimersByTime(200)
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ found: true }))
  })

  it('calls onComplete with not found after max retries', () => {
    document.body.innerHTML = '<p>nothing relevant</p>'
    const onComplete = vi.fn()

    locateWithRetry(
      { ...sampleAnchor, sel: '#nonexistent', ctx: 'missing' },
      'https://example.com/art',
      { maxRetries: 3, onComplete }
    )

    vi.advanceTimersByTime(10000)
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ found: false }))
  })
})
