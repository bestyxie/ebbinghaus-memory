'use client'

import { useState, useCallback, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { RecallBlock } from '@/app/lib/types'

interface MarkdownPreviewProps {
  content: string
  recallBlocks: RecallBlock[]
  onToggleBlock: (blockId: string) => void
}

export function MarkdownPreview({
  content,
  recallBlocks,
  onToggleBlock,
}: MarkdownPreviewProps) {
  const [revealedBlocks, setRevealedBlocks] = useState<Set<string>>(new Set())

  const toggleBlock = useCallback((blockId: string) => {
    setRevealedBlocks((prev) => {
      const next = new Set(prev)
      if (next.has(blockId)) {
        next.delete(blockId)
      } else {
        next.add(blockId)
      }
      return next
    })
    onToggleBlock(blockId)
  }, [onToggleBlock])

  // Process content to insert recall block markers
  const processedContent = useMemo(() => {
    if (recallBlocks.length === 0) return content

    let result = content
    // Sort blocks by startIndex in reverse to avoid index shifting
    const sortedBlocks = [...recallBlocks].sort((a, b) => b.startIndex - a.startIndex)

    sortedBlocks.forEach((block) => {
      const before = result.substring(0, block.startIndex)
      const after = result.substring(block.endIndex)
      // Use special markers that will be parsed in the component
      result = before + `:::BLOCK:${block.id}:::${block.content}:::END:${block.id}:::` + after
    })

    return result
  }, [content, recallBlocks])

  return (
    <div className="prose prose-lg max-w-none p-4 text-lg leading-loose">
      <ReactMarkdown
        components={{
          p: ({ children }) => {
            if (typeof children !== 'string') return <p>{children}</p>

            // Parse recall block markers
            const parts = children.split(/:::BLOCK:([^:]+):::(.+?):::END:\1:::/g)

            return (
              <p>
                {parts.map((part, idx) => {
                  // Odd indices are block IDs, even indices are content
                  if (idx % 2 === 1) {
                    const blockId = part
                    const blockContent = parts[idx + 1]
                    if (!blockContent) return null

                    const isRevealed = revealedBlocks.has(blockId)
                    return (
                      <span
                        key={blockId}
                        onClick={() => toggleBlock(blockId)}
                        className={`recall-block ${isRevealed ? 'revealed' : 'hidden'}`}
                        title={isRevealed ? 'Click to hide' : 'Click to reveal'}
                      >
                        {isRevealed ? blockContent : '█'.repeat(Math.min(blockContent.length, 30))}
                      </span>
                    )
                  }
                  // Skip the content if it's part of a block (handled above)
                  if (idx > 0 && parts[idx - 1] && idx % 2 === 0) return null
                  return <span key={idx}>{part}</span>
                })}
              </p>
            )
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
