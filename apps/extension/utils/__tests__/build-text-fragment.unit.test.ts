import { describe, it, expect } from 'vitest'
import { buildTextFragmentUrl } from '../build-text-fragment'

describe('buildTextFragmentUrl', () => {
  it('builds fragment with prefix and suffix', () => {
    const url = buildTextFragmentUrl(
      'https://example.com/article',
      'ephemeral',
      'the ephemeral nature'
    )
    expect(url).toBe('https://example.com/article#:~:text=the-ephemeral,-nature')
  })

  it('builds fragment with selected text only when no context', () => {
    const url = buildTextFragmentUrl(
      'https://example.com/article',
      'ephemeral',
      'ephemeral'
    )
    expect(url).toBe('https://example.com/article#:~:text=ephemeral')
  })

  it('builds fragment with prefix only', () => {
    const url = buildTextFragmentUrl(
      'https://example.com/article',
      'ephemeral',
      'the ephemeral'
    )
    expect(url).toBe('https://example.com/article#:~:text=the-ephemeral')
  })

  it('builds fragment with suffix only', () => {
    const url = buildTextFragmentUrl(
      'https://example.com/article',
      'ephemeral',
      'ephemeral nature'
    )
    expect(url).toBe('https://example.com/article#:~:text=ephemeral,-nature')
  })

  it('strips existing fragment from source URL', () => {
    const url = buildTextFragmentUrl(
      'https://example.com/article#old-fragment',
      'ephemeral',
      'ephemeral'
    )
    expect(url).toBe('https://example.com/article#:~:text=ephemeral')
  })

  it('trims prefix to 20 chars', () => {
    const longPrefix = 'this is a very long prefix text that should be trimmed'
    const url = buildTextFragmentUrl(
      'https://example.com/article',
      'ephemeral',
      `${longPrefix}ephemeral`
    )
    const fragment = url.split('#:~:text=')[1]
    expect(fragment).toContain('ephemeral')
    expect(fragment.startsWith('this is a very long prefix text that should be trimmed-')).toBe(false)
  })

  it('trims suffix to 20 chars', () => {
    const longSuffix = 'and this is a very long suffix text that should be trimmed'
    const url = buildTextFragmentUrl(
      'https://example.com/article',
      'ephemeral',
      `ephemeral ${longSuffix}`
    )
    const fragment = url.split('#:~:text=')[1]
    expect(fragment).toContain('ephemeral')
    expect(fragment.endsWith(longSuffix)).toBe(false)
  })
})
