import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    value: string;
    type: 'up' | 'down' | 'stable';
  };
  variant?: 'default' | 'accent';
  progress?: number; // For retention rate bar (0-100)
}

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  variant = 'default',
  progress,
}: StatsCardProps) {
  const baseClasses = 'rounded-lg border bg-white p-6';
  const variantClasses = variant === 'accent'
    ? 'shadow-sm'
    : '';

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${
              trend.type === 'up' ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            <span>{trend.value}</span>
            {trend.type === 'up' && (
              <svg
                className="h-3 w-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
