'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import { getExtensions } from '@/app/lib/editor/extensions';
import { FixedToolbar } from './fixed-toolbar';
import { BubbleMenu } from './bubble-menu';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type detailed content here...',
  className = '',
  name = 'back',
}: RichTextEditorProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: getExtensions(placeholder),
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Update hidden input for form submission
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = html;
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[150px] px-4 py-3 focus:outline-none',
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className={className}>
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        value={value}
        readOnly
      />
      <div className="border border-slate-300 rounded-lg overflow-hidden">
        <FixedToolbar editor={editor} />
        <EditorContent editor={editor} />
        {editor && <BubbleMenu editor={editor} />}
      </div>
    </div>
  );
}
