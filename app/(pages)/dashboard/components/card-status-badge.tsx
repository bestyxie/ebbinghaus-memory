'use client';

import React from 'react';

type CardStatus = 'new' | 'due' | 'overdue' | 'scheduled';

interface CardStatusBadgeProps {
  status: CardStatus;
  daysUntil?: number;
}

export function CardStatusBadge({ status, daysUntil }: CardStatusBadgeProps) {
  if (status === 'due') {
    return (
      <span className="flex items-center gap-1.5 text-blue-600 text-[11px] font-black uppercase tracking-wider">
        <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
        Due Now
      </span>
    );
  }

  if (status === 'overdue') {
    return (
      <span className="flex items-center gap-1.5 text-rose-500 text-[11px] font-black uppercase tracking-wider">
        <span className="size-1.5 rounded-full bg-rose-500" />
        Overdue
      </span>
    );
  }

  if (status === 'new') {
    return (
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        New
      </span>
    );
  }

  const label = daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;
  return (
    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      {label}
    </span>
  );
}
