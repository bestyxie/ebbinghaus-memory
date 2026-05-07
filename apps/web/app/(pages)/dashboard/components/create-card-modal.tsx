"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createCard } from "@/app/lib/actions";
import {
  X,
  Plus,
} from "lucide-react";
import { DeckSelector } from "./deck-selector";
import { DifficultySelector } from "./difficulty-selector";
import { RichTextEditor } from "@/app/components/editor/rich-text-editor";

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCardModal({ isOpen, onClose }: CreateCardModalProps) {
  const [state, formAction, isPending] = useActionState(createCard, null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"5" | "4" | "3">("4");
  const [backContent, setBackContent] = useState("");
  const hasHandledSuccess = useRef(false);

  // Close modal on success (revalidatePath handles data refresh automatically)
  useEffect(() => {
    if (state?.success && !isPending && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      onClose();
      // Reset form after successful creation
      setBackContent("");
    }
  }, [state?.success, isPending, onClose]);

  // Reset the success handler when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasHandledSuccess.current = false;
      setBackContent("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form action={formAction} className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-[720px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Add New Knowledge Point</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter details to start your Ebbinghaus memory cycle.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
          {/* Title & Hint */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                name="front"
                required
                placeholder="e.g., Photosynthesis Basics"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hint</label>
              <input
                name="note"
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

          {/* Deck Selector */}
          <DeckSelector />

          {/* Difficulty Selector */}
          <DifficultySelector
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
          />

          {/* Error Display */}
          {state?.error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg">
              {state.error}
            </div>
          )}

          {/* Sync hidden input */}
          <input type="hidden" name="quality" value={selectedDifficulty} />
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
            <Plus />
            {isPending ? "Creating..." : "Save Knowledge Point"}
          </button>
        </div>
      </form>
    </div>
  );
}
