'use client';

import React from 'react';

interface FamiliarityProgressProps {
  percentage: number;
}

export function FamiliarityProgress({ percentage }: FamiliarityProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1 w-20 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600">{percentage}%</span>
    </div>
  );
}
