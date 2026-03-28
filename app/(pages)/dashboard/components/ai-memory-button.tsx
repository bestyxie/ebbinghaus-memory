"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AIMemoryModal } from "./ai-memory-modal";
import { AIMemoryCard } from "@/app/lib/ai";
import { Deck } from "@/app/lib/types";

export function AIMemoryButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<AIMemoryCard[]>([]);

  const handleOpen = async () => {
    setIsLoading(true);
    setError(null);
    setCards([]);

    try {
      // Find the "vocabulary" deck
      const decksResponse = await fetch('/api/decks', {
        cache: 'no-store',
      });

      if (!decksResponse.ok) {
        throw new Error('Failed to fetch decks');
      }

      const resData = await decksResponse.json();
      const decks: Deck[] = resData.decks;
      const vocabularyDeck = decks.find(deck => deck.title === 'vocabulary');

      if (!vocabularyDeck) {
        setError('No vocabulary deck found. Please create a deck named "vocabulary" first.');
        setIsLoading(false);
        setIsOpen(true);
        return;
      }

      // Fetch overdue cards for the vocabulary deck
      const cardsResponse = await fetch(
        `/api/dashboard/cards?deckId=${vocabularyDeck.id}&sortBy=nextReviewAt&page=1&limit=10`,
        { cache: 'no-store' }
      );

      if (!cardsResponse.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await cardsResponse.json();

      // Filter overdue cards (same as dashboard table with nextReviewAt sorting)
      // This ensures cards are due for review according to the SM-2 algorithm
      const overdueCards = data.cards
        .filter((card: { nextReviewAt: string }) => new Date(card.nextReviewAt) <= new Date())
        .slice(0, 10) as AIMemoryCard[];

      if (overdueCards.length === 0) {
        setError('No overdue cards found in the vocabulary tag.');
        setIsLoading(false);
        setIsOpen(true);
        return;
      }

      setCards(overdueCards);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/20 hover:brightness-110"
      >
        <Sparkles className="h-4 w-4" />
        {isLoading ? 'Loading...' : 'AI Memory'}
      </button>

      {isOpen && (
        <AIMemoryModal
          isOpen={isOpen}
          onClose={handleClose}
          cards={error ? [] : cards}
        />
      )}
    </>
  );
}
