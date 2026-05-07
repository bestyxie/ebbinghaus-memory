import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

interface ReviewEmptyViewProps {
  type: 'flashcard' | 'article' | null;
}

export function ReviewEmptyView({ type }: ReviewEmptyViewProps) {
  const router = useRouter();

  const getMessage = () => {
    switch (type) {
      case 'flashcard':
        return 'No flashcards due for review right now';
      case 'article':
        return 'No articles due for review right now';
      default:
        return 'No content due for review right now';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3 text-gray-800">
          All caught up! 🎉
        </h2>

        <p className="text-gray-600 mb-6">{getMessage()}</p>

        <p className="text-sm text-gray-500 mb-6">
          Keep up the great work!
        </p>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
