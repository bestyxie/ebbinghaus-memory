'use client';

import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';

interface FixedToolbarProps {
  editor: Editor | null;
}

const HIGHLIGHT_COLORS = [
  { name: 'yellow', value: '#fef08a', class: 'bg-yellow-200' },
  { name: 'pink', value: '#f9a8d4', class: 'bg-pink-200' },
  { name: 'blue', value: '#93c5fd', class: 'bg-blue-200' },
  { name: 'green', value: '#86efac', class: 'bg-green-200' },
];

export function FixedToolbar({ editor }: FixedToolbarProps) {
  if (!editor) {
    return null;
  }

  const setHighlight = (color: string) => {
    editor.chain().focus().setMark('highlight', { style: `background-color: ${color}` }).run();
  };

  const setAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    // @ts-expect-error - setTextAlign is a custom extension command
    editor.chain().focus().setTextAlign(alignment).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50">
      {/* Basic Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('bold') ? 'bg-slate-300' : ''}`}
        aria-label="Bold"
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('italic') ? 'bg-slate-300' : ''}`}
        aria-label="Italic"
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('underline') ? 'bg-slate-300' : ''}`}
        aria-label="Underline"
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-300' : ''}`}
        aria-label="Heading 1"
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-300' : ''}`}
        aria-label="Heading 2"
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-300' : ''}`}
        aria-label="Heading 3"
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('bulletList') ? 'bg-slate-300' : ''}`}
        aria-label="Bullet list"
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('orderedList') ? 'bg-slate-300' : ''}`}
        aria-label="Numbered list"
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Blocks */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('blockquote') ? 'bg-slate-300' : ''}`}
        aria-label="Blockquote"
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive('codeBlock') ? 'bg-slate-300' : ''}`}
        aria-label="Code block"
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Highlight Color Dropdown */}
      <div className="relative group">
        <button
          type="button"
          className="p-2 hover:bg-slate-200 rounded flex items-center gap-1"
          aria-label="Highlight"
          title="Highlight Color"
        >
          <Palette className="w-4 h-4" />
        </button>
        <div className="absolute top-full left-0 mt-1 hidden group-hover:flex bg-white border border-slate-200 rounded shadow-lg z-10">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setHighlight(color.value)}
              className={`w-8 h-8 ${color.class} hover:opacity-80 first:rounded-tl last:rounded-bl`}
              aria-label={`Highlight ${color.name}`}
              data-color={color.name}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div className="w-px h-6 bg-slate-300 mx-1" />

      {/* Text Alignment */}
      <button
        type="button"
        onClick={() => setAlignment('left')}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-300' : ''}`}
        aria-label="Align left"
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setAlignment('center')}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-300' : ''}`}
        aria-label="Align center"
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setAlignment('right')}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-300' : ''}`}
        aria-label="Align right"
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setAlignment('justify')}
        className={`p-2 hover:bg-slate-200 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-300' : ''}`}
        aria-label="Align justify"
        title="Align Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </button>
    </div>
  );
}
