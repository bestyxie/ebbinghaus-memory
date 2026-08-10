export function buildTextFragmentUrl(
  sourceUrl: string,
  selectedText: string,
  ctx: string
): string {
  const prefix = extractPrefix(ctx, selectedText)
  const suffix = extractSuffix(ctx, selectedText)

  const parts: string[] = []
  if (prefix) parts.push(`${prefix}-`)
  parts.push(selectedText)
  if (suffix) parts.push(`,-${suffix}`)

  const fragment = `:~:text=${parts.join('')}`
  const baseUrl = sourceUrl.split('#')[0]
  return `${baseUrl}#${fragment}`
}

function extractPrefix(ctx: string, selectedText: string): string {
  const index = ctx.indexOf(selectedText)
  if (index <= 0) return ''
  return ctx.substring(0, index).trim().slice(-20)
}

function extractSuffix(ctx: string, selectedText: string): string {
  const index = ctx.indexOf(selectedText)
  if (index === -1) return ''
  const after = ctx.substring(index + selectedText.length).trim()
  return after.slice(0, 20)
}
