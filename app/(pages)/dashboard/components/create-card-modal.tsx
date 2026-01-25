"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createCard } from "@/app/lib/actions";
import {
  CloseIcon,
  PlusIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
  ListIcon,
} from "../../../components/ui/icons";
import { DeckSelector } from "./deck-selector";
import { DifficultySelector } from "./difficulty-selector";

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCardModal({ isOpen, onClose, onSuccess }: CreateCardModalProps) {
  const [state, formAction, isPending] = useActionState(createCard, null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"5" | "4" | "3">("4");
  const hasHandledSuccess = useRef(false);

  // Close modal and trigger refresh on success (after render)
  useEffect(() => {
    if (state?.success && !isPending && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;
      onSuccess?.();
      onClose();
    }
  }, [state?.success, isPending, onSuccess, onClose]);

  // Reset the success handler when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasHandledSuccess.current = false;
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
            <CloseIcon className="w-6 h-6 text-slate-500" />
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
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="flex gap-1 p-2 border-b border-slate-200 bg-slate-50">
                <button type="button" className="p-2 hover:bg-slate-200 rounded">
                  <BoldIcon />
                </button>
                <button type="button" className="p-2 hover:bg-slate-200 rounded">
                  <ItalicIcon />
                </button>
                <button type="button" className="p-2 hover:bg-slate-200 rounded">
                  <UnderlineIcon />
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1" />
                <button type="button" className="p-2 hover:bg-slate-200 rounded">
                  <LinkIcon />
                </button>
                <button type="button" className="p-2 hover:bg-slate-200 rounded">
                  <ListIcon />
                </button>
              </div>
              <textarea
                name="back"
                required
                placeholder="Describe knowledge point in detail..."
                className="w-full h-36 p-4 resize-none focus:outline-none"
              />
            </div>
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
            <PlusIcon />
            {isPending ? "Creating..." : "Save Knowledge Point"}
          </button>
        </div>
      </form>
    </div>
  );
}
