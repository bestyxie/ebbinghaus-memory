import { describe, it, expect } from 'vitest'
import { computeCssPath, extractContext, countOccurrenceInParent, computeSourceAnchor } from '../compute-source-anchor'

function setupDom(html: string): { range: Range; selectedText: string } {
  document.body.innerHTML = html
  const selection = window.getSelection()
  selection?.removeAllRanges()
  const target = document.querySelector('#target') as HTMLElement
  const range = document.createRange()
  range.selectNodeContents(target)
  selection?.addRange(range)
  return { range, selectedText: target.textContent || '' }
}

describe('computeCssPath', () => {
  it('returns body for null element', () => {
    expect(computeCssPath(null)).toBe('body')
  })

  it('returns body for body element', () => {
    expect(computeCssPath(document.body)).toBe('body')
  })

  it('computes path with id', () => {
    document.body.innerHTML = '<article><p id="target">text</p></article>'
    const el = document.querySelector('#target')
    expect(computeCssPath(el)).toBe('body > #target')
  })

  it('computes path with nth-of-type for siblings', () => {
    document.body.innerHTML = '<div><p>first</p><p>second</p><p>third</p></div>'
    const el = document.querySelectorAll('p')[1]
    expect(computeCssPath(el)).toBe('body > div > p:nth-of-type(2)')
  })

  it('uses tag name when only one sibling of that type', () => {
    document.body.innerHTML = '<div><h1>title</h1><p>text</p></div>'
    const el = document.querySelector('p')
    expect(computeCssPath(el)).toBe('body > div > p')
  })
})

describe('extractContext', () => {
  it('extracts context around selection within maxLength', () => {
    document.body.innerHTML = '<p id="target">the ephemeral nature of beauty is fleeting</p>'
    const target = document.querySelector('#target') as HTMLElement
    const range = document.createRange()
    range.selectNodeContents(target)
    const ctx = extractContext(range, 40)
    expect(ctx).toContain('ephemeral')
    expect(ctx.length).toBeLessThanOrEqual(60)
  })

  it('returns selected text when parent has no content', () => {
    const range = {
      toString: () => 'test',
      startContainer: { parentElement: null },
    } as unknown as Range
    expect(extractContext(range, 40)).toBe('test')
  })
})

describe('countOccurrenceInParent', () => {
  it('counts single occurrence', () => {
    document.body.innerHTML = '<div><p id="target">ephemeral is short</p></div>'
    const el = document.querySelector('#target')
    expect(countOccurrenceInParent(el, 'ephemeral')).toBe(1)
  })

  it('counts multiple occurrences in parent', () => {
    document.body.innerHTML = '<div><p id="target">the the the</p></div>'
    const el = document.querySelector('#target')
    expect(countOccurrenceInParent(el, 'the')).toBe(3)
  })

  it('returns 1 for null element', () => {
    expect(countOccurrenceInParent(null, 'test')).toBe(1)
  })

  it('returns 1 when word not found', () => {
    document.body.innerHTML = '<div><p id="target">hello world</p></div>'
    const el = document.querySelector('#target')
    expect(countOccurrenceInParent(el, 'missing')).toBe(1)
  })
})

describe('computeSourceAnchor', () => {
  it('returns complete anchor with sel, ctx, occ', () => {
    document.body.innerHTML = '<article><p id="target">the ephemeral nature of beauty</p></article>'
    const target = document.querySelector('#target') as HTMLElement
    const range = document.createRange()
    range.selectNodeContents(target)
    const anchor = computeSourceAnchor(range, 'the ephemeral nature of beauty')
    expect(anchor.sel).toContain('body')
    expect(anchor.ctx).toContain('ephemeral')
    expect(anchor.occ).toBeGreaterThanOrEqual(1)
  })

  it('returns occ as positive integer', () => {
    document.body.innerHTML = '<p id="target">word</p>'
    const target = document.querySelector('#target') as HTMLElement
    const range = document.createRange()
    range.selectNodeContents(target)
    const anchor = computeSourceAnchor(range, 'word')
    expect(anchor.occ).toBeGreaterThan(0)
    expect(Number.isInteger(anchor.occ)).toBe(true)
  })
})
