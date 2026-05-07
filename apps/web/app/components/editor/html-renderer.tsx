'use client';

import { sanitizeHTML } from '@/app/lib/editor/sanitizer';

interface HTMLRendererProps {
  html: string;
  className?: string;
}

export function HTMLRenderer({ html, className = '' }: HTMLRendererProps) {
  const sanitized = sanitizeHTML(html);

  return (
    <div
      className={`prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
