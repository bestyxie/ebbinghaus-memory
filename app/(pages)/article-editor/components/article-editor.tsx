'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { JSONContent, Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Type,
} from 'lucide-react'
import { RecallBlock } from '@/app/lib/types'
import { MarkdownPreview } from './markdown-preview'
import {
  TiptapEditor,
  TiptapEditorRef,
  convertLegacyToTiptapJson,
} from './tiptap-editor'
import { cn } from '@/app/lib/utils'

interface ArticleEditorProps {
  title: string
  content: string
  onTitleChange: (title: string) => void
  onContentChange: (json: JSONContent) => void
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
  const editorRef = useRef<TiptapEditorRef>(null)

  // Track active formatting states
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    recallBlock: false,
  })

  // Store TipTap JSON content - initialize with empty doc or from props
  const [tiptapContent, setTiptapContent] = useState<JSONContent>(() => {
    if (content) {
      if (recallBlocks.length > 0) {
        return convertLegacyToTiptapJson(content, recallBlocks)
      }
      return {
        type: 'doc',
        content: content.split('\n\n').map((p) => ({
          type: 'paragraph',
          content: p ? [{ type: 'text', text: p }] : [],
        })),
      }
    }
    // Default empty document
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    }
  })

  // Update active formatting states when selection changes
  useEffect(() => {
    const editor = editorRef.current?.getEditor()
    if (!editor) return

    const updateActiveStates = () => {
      setActiveFormats({
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        recallBlock: editor.isActive('recallBlockMark'),
      })
    }

    editor.on('selectionUpdate', updateActiveStates)
    editor.on('transaction', updateActiveStates)

    return () => {
      editor.off('selectionUpdate', updateActiveStates)
      editor.off('transaction', updateActiveStates)
    }
  }, [tiptapContent]) // Re-run when content is initialized

  // Handle TipTap content changes
  const handleTiptapChange = useCallback(
    (json: JSONContent) => {
      setTiptapContent(json)
      // Pass JSON content to parent
      onContentChange(json)
    },
    [onContentChange]
  )

  // Handle recall blocks changes from TipTap
  const handleRecallBlocksChange = useCallback(
    (blocks: RecallBlock[]) => {
      // For each block, update via onSelectionCreate
      // We need to track which blocks we've already seen
      blocks.forEach((block) => {
        onSelectionCreate(block)
      })
    },
    [onSelectionCreate]
  )

  // Get the editor instance for toolbar actions
  const getEditor = useCallback((): Editor | null => {
    return editorRef.current?.getEditor() || null
  }, [])

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
            onClick={() => getEditor()?.chain().focus().toggleBold().run()}
            title="Bold"
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
              activeFormats.bold
                ? 'bg-note-pink/30 text-note-pink'
                : 'hover:bg-note-pink/20 text-note-pink'
            )}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => getEditor()?.chain().focus().toggleItalic().run()}
            title="Italic"
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
              activeFormats.italic
                ? 'bg-note-purple/30 text-note-purple'
                : 'hover:bg-note-purple/20 text-note-purple'
            )}
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => getEditor()?.chain().focus().toggleUnderline().run()}
            title="Underline"
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
              activeFormats.underline
                ? 'bg-note-blue/30 text-note-blue'
                : 'hover:bg-note-blue/20 text-note-blue'
            )}
          >
            <Underline className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              const editor = getEditor()
              if (!editor) return

              if (editor.isActive('recallBlockMark')) {
                editor.chain().focus().unsetRecallBlockMark().run()
              } else {
                editor.chain().focus().toggleRecallBlockMark().run()
              }
            }}
            title="Toggle Recall Block"
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-lg transition-colors ml-1',
              activeFormats.recallBlock
                ? 'bg-note-green/30 text-note-green'
                : 'hover:bg-note-green/20 text-note-green'
            )}
          >
            {activeFormats.recallBlock ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <button
            title="Align Left"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            title="Align Center"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            title="Align Right"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
          >
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
        <TiptapEditor
          ref={editorRef}
          content={tiptapContent}
          onChange={handleTiptapChange}
          onRecallBlocksChange={handleRecallBlocksChange}
          placeholder="Click here to paste your article content and begin your study session..."
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
