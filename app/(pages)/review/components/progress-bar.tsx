'use client';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="mb-8">
      {/* Progress Text */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold text-gray-900">
          Progress
        </h2>
        <span className="text-lg font-semibold text-blue-600">
          Card {current} of {total}
        </span>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Cards Remaining */}
      <div className="mt-2 text-sm text-gray-600 text-right">
        {total - current} card{total - current !== 1 ? 's' : ''} remaining
      </div>
    </div>
  );
}
