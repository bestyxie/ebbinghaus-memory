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
        `/api/dashboard/cards?deckId=${vocabularyDeck.id}&sortBy=nextReviewAt&page=1`,
        { cache: 'no-store' }
      );

      if (!cardsResponse.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await cardsResponse.json();

      // Filter overdue cards and limit to 10
      const overdueCards = data.cards
        .filter((card: { nextReviewAt: string }) => new Date(card.nextReviewAt) <= new Date())
        .slice(0, 10) as AIMemoryCard[];

      if (overdueCards.length === 0) {
        setError('No overdue cards found in the vocabulary deck. Cards that are not yet due will not be included.');
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
        className="flex items-center gap-2 px-5 py-3 text-base font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        <Sparkles className="w-5 h-5" />
        {isLoading ? 'Loading...' : 'AI 辅助记忆'}
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
