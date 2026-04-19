# Rich Text Editor for Flashcard Back Content - Design Spec

**Date:** 2026-04-19
**Status:** Approved
**Author:** Claude (Superpowers Brainstorming)

## Overview

Add TipTap-based rich text editing to flashcard back content (answer/detailed content), with HTML storage and DOMPurify sanitization for security.

## Problem Statement

Currently, flashcard back content only supports plain text input. Users cannot format answers with bold, italics, lists, code blocks, or other rich text features that would enhance learning effectiveness.

## Goals

1. Enable rich text editing for card back content (answer/detailed content)
2. Keep card front (title/question) as plain text for simplicity
3. Store rich content as HTML in existing database fields (backward compatible)
4. Ensure security through HTML sanitization
5. Provide intuitive UI with both fixed toolbar and bubble menu

## Non-Goals

- Rich text editing for card front side (out of scope)
- Rich text editing for note field (out of scope)
- Database schema migration (not needed, using existing String fields)

## Architecture

### Component Structure

```
app/components/editor/
├── rich-text-editor.tsx      # Main TipTap editor wrapper
├── html-renderer.tsx           # Safe HTML display component
├── fixed-toolbar.tsx           # Fixed toolbar with all formatting options
└── bubble-menu.tsx             # Floating menu for text selection
```

### Data Flow

**Create/Edit Flow:**
```
User Input → TipTap Editor → HTML Output → DOMPurify Sanitize → Store in DB (card.back)
```

**Review Flow:**
```
DB (card.back) → DOMPurify Sanitize → HTMLRenderer Display
```

## Feature Specification

### Rich Text Features

| Category | Features |
|----------|----------|
| Text Formatting | Bold, Italic, Underline |
| Headings | H1, H2, H3 |
| Lists | Bullet list, Numbered list |
| Blocks | Blockquote, Code block |
| Custom | Highlight colors (yellow, pink, blue, green) |
| Alignment | Left, Center, Right, Justify |

### Fixed Toolbar

Always-visible toolbar above the editor:

```
[B] [I] [U] | [H1] [H2] [H3] | [•] [1.] | ["] [</>] | [Highlight] | [←] [Center] [→] [≡]
```

- Group 1: Basic formatting (Bold, Italic, Underline)
- Group 2: Headings (H1, H2, H3)
- Group 3: Lists (Bullet, Numbered)
- Group 4: Blocks (Blockquote, Code)
- Group 5: Highlight color dropdown
- Group 6: Text alignment (Left, Center, Right, Justify)

### Bubble Menu

Appears on text selection for quick formatting:

```
[B] [I] [U] | [🖍️ Highlight]
```

## Security

### HTML Sanitization

**Library:** DOMPurify

**Allowed Tags:**
- Content: `p`, `br`, `div`, `span`
- Formatting: `strong`, `em`, `u`, `b`, `i`
- Headings: `h1`, `h2`, `h3`
- Lists: `ul`, `ol`, `li`
- Blocks: `blockquote`, `pre`, `code`
- Other: `a` (with `href` only)

**Allowed Attributes:**
- `class` (for TipTap-specific classes)
- `style` (only for `text-align` and `background-color`)
- `href` (on `<a>` tags, validated as URL)

**Blocked:**
- All `<script>` tags
- All event handlers (`onclick`, `onload`, etc.)
- `javascript:` URLs
- iframe, embed, object tags

## Backward Compatibility

### Existing Data

- Plain text in `card.back` renders correctly as HTML (HTML ignores newlines, but spaces work)
- No database migration required
- Existing cards continue to work without modification

### Migration Path

When a user edits an existing card:
1. Plain text is loaded into TipTap editor
2. User can add rich text formatting
3. On save, content is stored as HTML
4. Future edits work with rich text

## Components Detailed Specs

### RichTextEditor

**Props:**
```typescript
interface RichTextEditorProps {
  value: string;           // HTML content
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;      // For read-only mode (future use)
}
```

**Behavior:**
- Initializes TipTap editor with HTML content
- Outputs sanitized HTML on change
- Renders fixed toolbar and bubble menu
- Handles keyboard shortcuts (Cmd+B, Cmd+I, etc.)

### HTMLRenderer

**Props:**
```typescript
interface HTMLRendererProps {
  html: string;
  className?: string;
}
```

**Behavior:**
- Sanitizes HTML using DOMPurify
- Renders using `dangerouslySetInnerHTML` (post-sanitization)
- Applies Tailwind typography styles

## Integration Points

### CreateCardModal

**Changes:**
- Replace `<textarea name="back">` with `<RichTextEditor>`
- Remove fake toolbar UI (currently shown but non-functional)
- Keep form validation for non-empty back content

### EditCardModal

**Changes:**
- Replace `<textarea name="back">` with `<RichTextEditor>`
- Remove fake toolbar UI
- Load existing HTML content into editor

### FlashCard (Review)

**Changes:**
- Replace `{card.back}` with `<HTMLRenderer html={card.back} />`
- Apply typography styles for better rendering

## Dependencies

### New Dependencies

```json
{
  "dompurify": "^3.0.0",
  "@types/dompurify": "^3.0.0"
}
```

### Already Available

- `@tiptap/core` ✓
- `@tiptap/react` ✓
- `@tiptap/starter-kit` ✓
- `@tiptap/extension-underline` ✓
- `@tiptap/extension-placeholder` ✓

## Testing Requirements

### E2E Tests (Playwright)

1. **Create card with rich text**
   - Create card with bold, italic, heading formatting
   - Save and verify content persists

2. **Edit card with rich text**
   - Edit existing card
   - Add various formatting options
   - Save and verify changes persist

3. **Review page rendering**
   - Review card with rich text content
   - Verify all formatting displays correctly

4. **Toolbar functionality**
   - Test each toolbar button
   - Verify keyboard shortcuts work

5. **Bubble menu**
   - Select text and verify bubble menu appears
   - Test bubble menu formatting options

6. **Highlight colors**
   - Apply highlight colors to text
   - Verify colors persist after save/load

7. **Text alignment**
   - Test all alignment options
   - Verify alignment persists

8. **HTML sanitization**
   - Attempt to inject malicious content
   - Verify malicious content is removed

9. **Backward compatibility**
   - View existing plain text cards
   - Verify they render correctly

10. **Empty content handling**
    - Create card with whitespace-only back
    - Verify validation catches it

## Performance Considerations

- DOMPurify sanitization is fast (~1-2ms for typical content)
- TipTap editor is lightweight (~50KB gzipped)
- No impact on initial page load (editor loads on modal open)

## Accessibility

- Keyboard shortcuts for common formatting
- Semantic HTML output
- ARIA labels for toolbar buttons
- Focus management in modal

## Future Enhancements (Out of Scope)

- Image upload/embedding
- Table support
- Collaborative editing
- Markdown import/export
- Copy/paste from Word with formatting preservation
