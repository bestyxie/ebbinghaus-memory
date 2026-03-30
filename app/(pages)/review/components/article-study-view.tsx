'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle2 } from 'lucide-react'
import { ArticleCard, RecallBlock } from '@/app/lib/types'
import ReactMarkdown from 'react-markdown'

interface ArticleStudyViewProps {
  article: ArticleCard
  currentIndex: number
  totalArticles: number
  onComplete: (quality: number) => void
  isSingleMode?: boolean
}

export function ArticleStudyView({
  article,
  currentIndex,
  totalArticles,
  onComplete,
  isSingleMode,
}: ArticleStudyViewProps) {
  const [revealedBlocks, setRevealedBlocks] = useState<Set<string>>(new Set())
  const [studyTime, setStudyTime] = useState(0)
  const [hasShownAllBlocks, setHasShownAllBlocks] = useState(false)

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setStudyTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Check if all blocks are revealed
  useEffect(() => {
    if (article.recallBlocks && article.recallBlocks.length > 0) {
      const allRevealed = article.recallBlocks.every((block: RecallBlock) =>
        revealedBlocks.has(block.id)
      )
      setHasShownAllBlocks(allRevealed)
    }
  }, [revealedBlocks, article.recallBlocks])

  const toggleBlock = (blockId: string) => {
    setRevealedBlocks((prev) => {
      const next = new Set(prev)
      if (next.has(blockId)) {
        next.delete(blockId)
      } else {
        next.add(blockId)
      }
      return next
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const revealedCount = revealedBlocks.size
  const totalBlocks = article.recallBlocks?.length || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-8">
        {/* Progress Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {isSingleMode ? (
                <span className="font-semibold text-blue-600">Quick Review - Single article</span>
              ) : (
                <>Article {currentIndex + 1} of {totalArticles}</>
              )}
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {formatTime(studyTime)}
            </div>
          </div>
          {hasShownAllBlocks && totalBlocks > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              All blocks revealed
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Recall Blocks Revealed</span>
            <span>
              {revealedCount} / {totalBlocks}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300"
              style={{
                width: `${totalBlocks > 0 ? (revealedCount / totalBlocks) * 100 : 100}%`,
              }}
            />
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            {article.articleTitle}
          </h1>

          <div className="prose prose-lg max-w-none">
            <ArticleContentWithBlocks
              content={article.articleContent}
              recallBlocks={article.recallBlocks || []}
              revealedBlocks={revealedBlocks}
              onToggleBlock={toggleBlock}
            />
          </div>
        </div>

        {/* Rating Buttons */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-center text-lg font-semibold mb-4 text-gray-700">
            How well did you remember this article?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => onComplete(2)}
              className="flex flex-col items-center gap-2 px-6 py-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-all hover:scale-105"
            >
              <span className="text-2xl">😰</span>
              <span className="font-bold">Hard</span>
              <span className="text-xs opacity-75">Need to review again soon</span>
            </button>
            <button
              onClick={() => onComplete(3)}
              className="flex flex-col items-center gap-2 px-6 py-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-xl transition-all hover:scale-105"
            >
              <span className="text-2xl">🤔</span>
              <span className="font-bold">Good</span>
              <span className="text-xs opacity-75">Generally remembered</span>
            </button>
            <button
              onClick={() => onComplete(4)}
              className="flex flex-col items-center gap-2 px-6 py-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-all hover:scale-105"
            >
              <span className="text-2xl">😊</span>
              <span className="font-bold">Easy</span>
              <span className="text-xs opacity-75">Well remembered!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ArticleContentWithBlocksProps {
  content: string
  recallBlocks: RecallBlock[]
  revealedBlocks: Set<string>
  onToggleBlock: (blockId: string) => void
}

function ArticleContentWithBlocks({
  content,
  recallBlocks,
  revealedBlocks,
  onToggleBlock,
}: ArticleContentWithBlocksProps) {
  // Process content to replace recall blocks
  const processContent = () => {
    let processed = content
    const sortedBlocks = [...recallBlocks].sort((a, b) => b.startIndex - a.startIndex)

    sortedBlocks.forEach((block) => {
      const isRevealed = revealedBlocks.has(block.id)
      const before = processed.substring(0, block.startIndex)
      const after = processed.substring(block.endIndex)

      // Create marker for custom renderer
      const marker = `:::RECALL-${isRevealed ? 'SHOWN' : 'HIDDEN'}-${block.id}:::${block.content}:::END-${block.id}:::`

      processed = before + marker + after
    })

    return processed
  }

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => {
          if (typeof children !== 'string') return <p>{children}</p>

          const parts = children.split(/:::RECALL-(SHOWN|HIDDEN)-([^:]+):::(.+?):::END-([^:]+):::/g)

          return (
            <p className="mb-4">
              {parts.map((part, index) => {
                const isHiddenMarker = parts[index - 3]?.startsWith('HIDDEN')
                const isShownMarker = parts[index - 3]?.startsWith('SHOWN')
                const blockId = parts[index - 2]
                const content = part

                if (isHiddenMarker && blockId) {
                  return (
                    <RecallBlockSpan
                      key={blockId}
                      content={content}
                      isRevealed={false}
                      onClick={() => onToggleBlock(blockId)}
                    />
                  )
                }

                if (isShownMarker && blockId) {
                  return (
                    <RecallBlockSpan
                      key={blockId}
                      content={content}
                      isRevealed={true}
                      onClick={() => onToggleBlock(blockId)}
                    />
                  )
                }

                // Skip metadata parts
                if (index % 5 === 0 || index % 5 === 4) {
                  return <span key={index}>{part}</span>
                }

                return null
              })}
            </p>
          )
        },
      }}
    >
      {processContent()}
    </ReactMarkdown>
  )
}

interface RecallBlockSpanProps {
  content: string
  isRevealed: boolean
  onClick: () => void
}

function RecallBlockSpan({ content, isRevealed, onClick }: RecallBlockSpanProps) {
  return (
    <span
      onClick={onClick}
      className={`recall-block-inline ${isRevealed ? 'revealed' : 'hidden'}`}
      title={isRevealed ? 'Click to hide' : 'Click to reveal'}
    >
      {isRevealed ? content : '█'.repeat(Math.min(content.length, 15))}
    </span>
  )
}
