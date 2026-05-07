import { Mark, mergeAttributes } from '@tiptap/core'

export interface RecallBlockMarkOptions {
  HTMLAttributes: Record<string, string>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    recallBlockMark: {
      /**
       * Toggle a recall block mark
       */
      toggleRecallBlockMark: () => ReturnType
      /**
       * Set a recall block mark
       */
      setRecallBlockMark: () => ReturnType
      /**
       * Unset a recall block mark
       */
      unsetRecallBlockMark: () => ReturnType
    }
  }
}

export const RecallBlockMark = Mark.create<RecallBlockMarkOptions>({
  name: 'recallBlockMark',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-recall-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-recall-id': attributes.id,
          }
        },
      },
      revealed: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-revealed') === 'true',
        renderHTML: (attributes) => {
          return {
            'data-revealed': String(attributes.revealed),
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-recall-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'recall-block-mark',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      toggleRecallBlockMark:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name, { id: `block-${Date.now()}`, revealed: false })
        },
      setRecallBlockMark:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name, { id: `block-${Date.now()}`, revealed: false })
        },
      unsetRecallBlockMark:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})
