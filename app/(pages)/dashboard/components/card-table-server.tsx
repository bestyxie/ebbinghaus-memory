import { CardRow } from './card-row';
import { PaginationClient } from './pagination-client';
import { getCardsData } from '@/app/lib/dashboard-data';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';

type SortOption = 'nextReviewAt' | 'createdAt' | 'easeFactor';

interface CardTableServerProps {
  currentPage: number;
  sortBy: SortOption;
  deckId: string | null;
}

export async function CardTableServer({
  currentPage,
  sortBy,
  deckId,
}: CardTableServerProps) {
  const header = await headers();
  const session = await auth.api.getSession({ headers: header });
  const cardsData = await getCardsData(session?.user?.id || '', { sortBy, deckId, page: currentPage });
  const { cards, total, totalPages } = cardsData;

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
        <p className="text-gray-500">
          No cards found. Create your first card to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <caption className="sr-only">
            List of all knowledge points with their status and familiarity
          </caption>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">
                Knowledge Point
              </th>
              <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">
                Tags
              </th>
              <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">
                Familiarity
              </th>
              <th className="py-4 px-6 text-center text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <CardRow
                key={card.id}
                card={card}
                sortBy={sortBy}
                sortOrder="asc"
                deckId={deckId}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationClient
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
