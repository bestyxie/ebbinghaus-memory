'use client';

import React from 'react';

interface FamiliarityProgressProps {
  percentage: number;
}

function getBarColor(percentage: number): string {
  if (percentage >= 80) return 'bg-emerald-500';
  if (percentage >= 40) return 'bg-blue-600';
  return 'bg-rose-500';
}

export function FamiliarityProgress({ percentage }: FamiliarityProgressProps) {
  const barColor = getBarColor(percentage);

  return (
    <div className="flex items-center gap-3">
      <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
        <div className={`${barColor} h-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-400">{percentage}%</span>
    </div>
  );
}
