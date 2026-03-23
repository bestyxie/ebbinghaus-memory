'use client'

import { useEditor, EditorContent, JSONContent, Editor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { RecallBlockMark } from './recall-block-mark'
import { RecallBlock } from '@/app/lib/types'

export interface TiptapEditorRef {
  getEditor: () => Editor | null
}

// Make the getEditor method available on the ref

interface TiptapEditorProps {
  content: JSONContent | string
  onChange: (content: JSONContent) => void
  onRecallBlocksChange: (blocks: RecallBlock[]) => void
  placeholder?: string
  editable?: boolean
}

// Extract recall blocks from TipTap JSON content
function extractRecallBlocks(doc: JSONContent): RecallBlock[] {
  const blocks: RecallBlock[] = []
  let currentIndex = 0

  function traverse(node: JSONContent) {
    if (node.type === 'text' && node.text) {
      const text = node.text
      if (node.marks?.some((mark) => mark.type === 'recallBlockMark')) {
        const recallMark = node.marks.find((mark) => mark.type === 'recallBlockMark')
        if (recallMark?.attrs?.id) {
          blocks.push({
            id: recallMark.attrs.id as string,
            startIndex: currentIndex,
            endIndex: currentIndex + text.length,
            content: text,
          })
        }
      }
      currentIndex += text.length
    } else if (node.content) {
      node.content.forEach((child: JSONContent) => {
        traverse(child)
        // Add newline after paragraph
        if (child.type === 'paragraph') {
          currentIndex += 1
        }
      })
    }
  }

  traverse(doc)
  return blocks
}

// Convert plain text + recall blocks to TipTap JSON
function convertToTiptapJson(text: string, recallBlocks: RecallBlock[]): JSONContent {
  if (recallBlocks.length === 0) {
    return {
      type: 'doc',
      content: text.split('\n\n').map((paragraph) => ({
        type: 'paragraph',
        content: paragraph ? [{ type: 'text', text: paragraph }] : [],
      })),
    }
  }

  // Sort blocks by startIndex
  const sortedBlocks = [...recallBlocks].sort((a, b) => a.startIndex - b.startIndex)

  // Build content with marks
  let lastIndex = 0
  const paragraphs: JSONContent[] = []
  let currentParagraphContent: JSONContent[] = []

  function addText(text: string, marks?: JSONContent['marks']) {
    if (!text) return
    currentParagraphContent.push({
      type: 'text',
      text,
      marks,
    })
  }

  function flushParagraph() {
    if (currentParagraphContent.length > 0) {
      paragraphs.push({
        type: 'paragraph',
        content: currentParagraphContent,
      })
      currentParagraphContent = []
    }
  }

  sortedBlocks.forEach((block) => {
    // Add text before this block
    if (block.startIndex > lastIndex) {
      const beforeText = text.substring(lastIndex, block.startIndex)
      // Split by double newlines for paragraphs
      const parts = beforeText.split('\n\n')
      parts.forEach((part, idx) => {
        if (idx > 0) {
          flushParagraph()
        }
        addText(part)
      })
    }

    // Add the recall block text with mark
    addText(block.content, [
      {
        type: 'recallBlockMark',
        attrs: {
          id: block.id,
          revealed: false,
        },
      },
    ])

    lastIndex = block.endIndex
  })

  // Add remaining text after the last block
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex)
    const parts = remainingText.split('\n\n')
    parts.forEach((part, idx) => {
      if (idx > 0) {
        flushParagraph()
      }
      addText(part)
    })
  }

  flushParagraph()

  return {
    type: 'doc',
    content: paragraphs.length > 0 ? paragraphs : [{ type: 'paragraph', content: [] }],
  }
}

// Extract plain text from TipTap JSON
function extractPlainText(doc: JSONContent): string {
  let text = ''

  function traverse(node: JSONContent) {
    if (node.type === 'text' && node.text) {
      text += node.text
    } else if (node.content) {
      node.content.forEach((child: JSONContent, idx: number) => {
        traverse(child)
        if (child.type === 'paragraph' && idx < (node.content?.length || 0) - 1) {
          text += '\n\n'
        }
      })
    }
  }

  traverse(doc)
  return text
}

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  function TiptapEditor(
    {
      content,
      onChange,
      onRecallBlocksChange,
      placeholder = 'Click here to paste your article content and begin your study session...',
      editable = true,
    },
    ref
  ) {
    const [revealedBlocks, setRevealedBlocks] = useState<Set<string>>(new Set())

    // Parse initial content
    const initialContent = typeof content === 'string' ? undefined : content

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
          blockquote: false,
          bulletList: false,
          orderedList: false,
          listItem: false,
          code: false,
          horizontalRule: false,
          dropcursor: false,
          gapcursor: false,
        }),
        Underline,
        Placeholder.configure({
          placeholder,
        }),
        RecallBlockMark,
      ],
      content: initialContent,
      editable,
      immediatelyRender: false, // Avoid SSR hydration mismatch
      onUpdate: ({ editor }) => {
        const json = editor.getJSON()
        onChange(json)

        // Extract recall blocks and notify parent
        const blocks = extractRecallBlocks(json)
        onRecallBlocksChange(blocks)
      },
      editorProps: {
        attributes: {
          class:
            'tiptap-editor prose prose-lg max-w-none min-h-[400px] focus:outline-none text-lg leading-loose text-gray-700',
        },
      },
    })

    // Expose editor instance via ref
    useImperativeHandle(
      ref,
      () => ({
        getEditor: () => editor,
      }),
      [editor]
    )

    // Handle initial content conversion if it's a string (legacy format)
    useEffect(() => {
      if (editor && typeof content === 'string' && content) {
        // For now, just set as plain text - conversion from legacy format would need recallBlocks
        editor.commands.setContent(content)
      }
    }, [editor, content])

    // Toggle reveal state for a recall block
    const toggleReveal = useCallback((blockId: string) => {
      setRevealedBlocks((prev) => {
        const next = new Set(prev)
        if (next.has(blockId)) {
          next.delete(blockId)
        } else {
          next.add(blockId)
        }
        return next
      })
    }, [])

    // Apply revealed state to editor content
    useEffect(() => {
      if (!editor) return

      const { state, view } = editor
      const { tr } = state
      let modified = false

      state.doc.descendants((node, pos) => {
        if (node.isText && node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type.name === 'recallBlockMark') {
              const blockId = mark.attrs.id as string
              const shouldBeRevealed = revealedBlocks.has(blockId)
              if (mark.attrs.revealed !== shouldBeRevealed) {
                const newMark = mark.type.create({
                  ...mark.attrs,
                  revealed: shouldBeRevealed,
                })
                tr.addMark(pos, pos + node.nodeSize, newMark)
                modified = true
              }
            }
          })
        }
      })

      if (modified) {
        view.dispatch(tr)
      }
    }, [editor, revealedBlocks])

    // Handle click on recall blocks to toggle reveal (only in preview/recall mode)
    const handleEditorClick = useCallback(
      (event: React.MouseEvent) => {
        if (editable) return
        const target = event.target as HTMLElement
        const recallElement = target.closest('[data-recall-id]')
        if (recallElement) {
          const blockId = recallElement.getAttribute('data-recall-id')
          if (blockId) {
            toggleReveal(blockId)
          }
        }
      },
      [editable, toggleReveal]
    )

    return (
      <div
        onClick={handleEditorClick}
        className={`tiptap-container${editable ? ' tiptap-container-editable' : ''}`}
      >
        <EditorContent editor={editor} />
      </div>
    )
  }
)

// Utility functions for external use
export function getPlainTextFromJson(doc: JSONContent): string {
  return extractPlainText(doc)
}

export function convertLegacyToTiptapJson(
  text: string,
  recallBlocks: RecallBlock[]
): JSONContent {
  return convertToTiptapJson(text, recallBlocks)
}
