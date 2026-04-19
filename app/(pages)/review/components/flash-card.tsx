'use client';

import { motion } from 'framer-motion';
import { CardWithDeck } from '@/app/lib/types';

interface FlashCardProps {
  card: CardWithDeck;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({ card, isFlipped, onFlip }: FlashCardProps) {
  return (
    <div className="flex justify-center items-center min-h-[500px]">
      <div className="w-full max-w-3xl perspective-1000">
        <motion.div
          className="relative w-full h-[500px] cursor-pointer"
          onClick={onFlip}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of Card */}
          <motion.div
            className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-12 flex flex-col justify-center items-center"
            animate={{ opacity: isFlipped ? 0 : 1 }}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {card.deck && (
              <div className="absolute top-6 left-6 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {card.deck.title}
              </div>
            )}

            <div className="text-3xl font-bold text-gray-900 text-center leading-relaxed">
              {card.front}
            </div>

            {card.note && (
              <div className="mt-6 pt-6 border-t border-gray-300">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Note
                </h4>
                <p className="text-lg text-gray-700 text-center">
                  {card.note}
                </p>
              </div>
            )}

            <div className="absolute bottom-6 text-gray-400 text-sm">
              Click to reveal answer
            </div>
          </motion.div>

          {/* Back of Card */}
          <motion.div
            className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border-2 border-blue-200 p-8 flex flex-col justify-start overflow-y-auto"
            animate={{
              opacity: isFlipped ? 1 : 0,
              rotateY: 180,
            }}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {card.deck && (
              <div className="self-start px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                {card.deck.title}
              </div>
            )}

            <div className="flex flex-col gap-5 flex-1">
              {/* Front */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Question
                </h3>
                <div className="text-lg text-gray-700 leading-relaxed">
                  {card.front}
                </div>
              </div>

              {/* Back */}
              <div>
                <h3 className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">
                  Answer
                </h3>
                <div className="text-2xl font-semibold text-gray-900 leading-relaxed">
                  {card.back}
                </div>
              </div>

              {/* Note */}
              {card.note && (
                <div className="pt-4 border-t border-blue-200">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Note
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">{card.note}</p>
                </div>
              )}

              {/* Source */}
              {card.source && (
                <div className={card.note ? '' : 'pt-4 border-t border-blue-200'}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Source
                  </h3>
                  {(() => {
                    try {
                      new URL(card.source);
                      return (
                        <a
                          href={card.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-base text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {card.source}
                        </a>
                      );
                    } catch {
                      return <p className="text-base text-gray-600 break-all">{card.source}</p>;
                    }
                  })()}
                </div>
              )}
            </div>

            <div className="mt-4 text-center text-gray-400 text-sm shrink-0">
              Rate your recall below
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
