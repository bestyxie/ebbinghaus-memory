'use client'

import { useCallback, useRef } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Type,
} from 'lucide-react'
import { RecallBlock } from '@/app/lib/types'
import { MarkdownPreview } from './markdown-preview'

interface ArticleEditorProps {
  title: string
  content: string
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  onSelectionCreate: (block: RecallBlock) => void
  isPreview: boolean
  recallBlocks: RecallBlock[]
  onToggleBlock: (blockId: string) => void
}

export function ArticleEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSelectionCreate,
  isPreview,
  recallBlocks,
  onToggleBlock,
}: ArticleEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleCreateRecallBlock = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    if (selectedText.trim()) {
      onSelectionCreate({
        id: `block-${Date.now()}`,
        startIndex: start,
        endIndex: end,
        content: selectedText,
      })
    }
  }, [content, onSelectionCreate])

  const insertMarkdown = (before: string, after = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const newText = content.substring(0, start) + before + selected + after + content.substring(end)

    onContentChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  return (
    <div className="bg-white rounded-3xl p-12 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-200/40 min-h-[600px]">
      {/* Formatting toolbar - sticky on scroll */}
      <div className="sticky top-0 z-10 -mx-12 px-12 -mt-12 pt-12 pb-6 mb-6 bg-white border-b border-gray-200/40 flex items-center gap-4">
        {/* Font size */}
        <div className="flex items-center gap-2 border-r border-gray-200/40 pr-4">
          <button className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold text-gray-500">
            16px
            <ChevronDown className="h-3 w-3" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-note-yellow/30 transition-colors text-note-orange">
            <Type className="h-4 w-4" />
          </button>
        </div>

        {/* Text formatting */}
        <div className="flex items-center gap-1 border-r border-gray-200/40 pr-4">
          <button
            onClick={() => insertMarkdown('**', '**')}
            title="Bold"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-note-pink/20 text-note-pink transition-colors"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            title="Italic"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-note-purple/20 text-note-purple transition-colors"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertMarkdown('`', '`')}
            title="Code / Underline"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-note-blue/20 text-note-blue transition-colors"
          >
            <Underline className="h-4 w-4" />
          </button>
          <button
            onClick={handleCreateRecallBlock}
            title="Create Recall Block (hide selection)"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-note-green/20 text-note-green transition-colors ml-1"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <button title="Align Left" className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors">
            <AlignLeft className="h-4 w-4" />
          </button>
          <button title="Align Center" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
            <AlignCenter className="h-4 w-4" />
          </button>
          <button title="Align Right" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
            <AlignRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Title input */}
      <div className="mb-8 border-b border-gray-200/40 focus-within:border-blue-200 transition-colors pb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Study Session"
          className="w-full bg-transparent border-none p-0 text-4xl font-extrabold text-gray-900 placeholder:text-gray-200 focus:ring-0 focus:outline-none"
        />
      </div>

      {/* Editor / Preview */}
      {!isPreview ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Click here to paste your article content and begin your study session..."
          className="w-full min-h-[400px] border-none focus:outline-none text-lg leading-[2] text-gray-700 resize-none placeholder:text-gray-200 placeholder:italic"
        />
      ) : (
        <MarkdownPreview
          content={content}
          recallBlocks={recallBlocks}
          onToggleBlock={onToggleBlock}
        />
      )}
    </div>
  )
}
