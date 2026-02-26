"use client";

import { useState, useEffect } from "react";
import { getUserDecks } from "@/app/lib/actions";
import { Plus } from "lucide-react";
import { Deck } from "@/app/lib/types";

export function DeckSelector() {
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    getUserDecks().then(setDecks);
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Tags (Deck)</label>
      <div className="flex gap-2">
        <select
          name="deckId"
          className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No deck</option>
          {decks.map(deck => (
            <option key={deck.id} value={deck.id}>{deck.title}</option>
          ))}
        </select>
        <button type="button" className="px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50">
          <Plus />
        </button>
      </div>
    </div>
  );
}
