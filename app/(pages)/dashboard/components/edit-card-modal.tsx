"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { updateCard } from "@/app/lib/actions";
import {
  X,
  Check,
} from "lucide-react";
import { CardWithDeck, Deck } from "@/app/lib/types";
import { RichTextEditor } from "@/app/components/editor/rich-text-editor";

interface EditCardModalProps {
  card: CardWithDeck;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCardModal({ card, isOpen, onClose }: EditCardModalProps) {
  const [state, formAction, isPending] = useActionState(updateCard, null);
  const previousIsPending = useRef(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [backContent, setBackContent] = useState(card.back || "");

  // Reset back content when card changes
  useEffect(() => {
    setBackContent(card.back || "");
  }, [card.id]);

  // Fetch all decks for the dropdown
  useEffect(() => {
    if (isOpen) {
      const fetchDecks = async () => {
        try {
          const response = await fetch('/api/decks');
          if (response.ok) {
            const data = await response.json();
            setDecks(data);
          }
        } catch (error) {
          console.error('Error fetching decks:', error);
        }
      };

      fetchDecks();
    }
  }, [isOpen]);

  // Close modal on success when pending transitions from true to false
  useEffect(() => {
    if (previousIsPending.current && !isPending && state?.success) {
      onClose();
    }
    previousIsPending.current = isPending;
  }, [isPending, state?.success, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form
        action={formAction}
        className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-[720px] max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Edit Knowledge Point</h2>
            <p className="text-sm text-slate-500 mt-1">
              Update your knowledge point content.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
          {/* Card ID (hidden) */}
          <input type="hidden" name="cardId" value={card.id} />

          {/* Title & Hint */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                name="front"
                required
                defaultValue={card.front}
                placeholder="e.g., Photosynthesis Basics"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hint</label>
              <input
                name="note"
                defaultValue={card.note || ""}
                placeholder="A brief reminder for front"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Detailed Content</label>
            <RichTextEditor
              value={backContent}
              onChange={setBackContent}
              placeholder="Describe knowledge point in detail..."
              name="back"
            />
          </div>

          {/* Deck Selector with default value */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (Deck)</label>
            <div className="flex gap-2">
              <select
                name="deckId"
                defaultValue={card.deck?.id || ""}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No deck</option>
                {decks.map(deck => (
                  <option key={deck.id} value={deck.id}>
                    {deck.title}
                  </option>
                ))}
              </select>
              {/* Note: We'll use inline deck options here instead of component to avoid double mounting */}
            </div>
          </div>

          {/* Error Display */}
          {state?.error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg">
              {state.error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Check />
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
