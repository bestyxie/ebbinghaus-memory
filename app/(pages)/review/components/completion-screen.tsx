'use client';

interface CompletionScreenProps {
  stats: {
    totalReviewed: number;
    averageEaseFactor: number;
  };
  onBackToDashboard: () => void;
  onStartNewSession: () => void;
}

export function CompletionScreen({ stats, onBackToDashboard, onStartNewSession }: CompletionScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-8">
      <div className="max-w-2xl w-full">
        {/* Success Animation/Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Review Complete!
          </h1>
          <p className="text-lg text-gray-600">
            Great job! You&apos;ve completed this review session.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {stats.totalReviewed}
            </div>
            <div className="text-gray-600 font-medium">
              Cards Reviewed
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-5xl font-bold text-green-600 mb-2">
              {stats.averageEaseFactor.toFixed(2)}
            </div>
            <div className="text-gray-600 font-medium">
              Avg. Ease Factor
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBackToDashboard}
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Back to Dashboard
          </button>
          <button
            onClick={onStartNewSession}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Start New Session
          </button>
        </div>

        {/* Motivational Message */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 italic">
            &quot;Repetition is the mother of learning.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
