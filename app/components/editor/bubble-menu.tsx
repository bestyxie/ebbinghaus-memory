'use client';

import { Editor } from '@tiptap/react';
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react';
import { Bold, Italic, Underline } from 'lucide-react';
import { Highlight } from '@/app/lib/editor/extensions';

interface BubbleMenuProps {
  editor: Editor | null;
}

const HIGHLIGHT_COLORS = [
  { name: 'yellow', value: '#fef08a', class: 'bg-yellow-200' },
  { name: 'pink', value: '#f9a8d4', class: 'bg-pink-200' },
  { name: 'blue', value: '#93c5fd', class: 'bg-blue-200' },
  { name: 'green', value: '#86efac', class: 'bg-green-200' },
];

export function BubbleMenu({ editor }: BubbleMenuProps) {
  if (!editor) {
    return null;
  }

  const setHighlight = (color: string) => {
    editor.chain().focus().setMark('highlight', { style: `background-color: ${color}` }).run();
  };

  return (
    <TiptapBubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className="bubble-menu flex gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-lg"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 hover:bg-slate-100 rounded ${editor.isActive('bold') ? 'bg-slate-200' : ''}`}
        aria-label="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 hover:bg-slate-100 rounded ${editor.isActive('italic') ? 'bg-slate-200' : ''}`}
        aria-label="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 hover:bg-slate-100 rounded ${editor.isActive('underline') ? 'bg-slate-200' : ''}`}
        aria-label="Underline"
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Highlight Colors */}
      <div className="relative group">
        <button
          type="button"
          className="p-2 hover:bg-slate-100 rounded flex items-center gap-1"
          aria-label="Highlight"
        >
          <span className="w-4 h-4 rounded-full bg-yellow-200" />
        </button>
        <div className="absolute top-full right-0 mt-1 hidden group-hover:flex flex-col bg-white border border-slate-200 rounded shadow-lg z-10">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setHighlight(color.value)}
              className={`w-8 h-8 ${color.class} hover:opacity-80`}
              aria-label={`Highlight ${color.name}`}
              data-color={color.name}
            />
          ))}
        </div>
      </div>
    </TiptapBubbleMenu>
  );
}
