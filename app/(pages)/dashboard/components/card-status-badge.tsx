'use client';

import React from 'react';

type CardStatus = 'new' | 'due' | 'overdue' | 'scheduled';

interface CardStatusBadgeProps {
  status: CardStatus;
  daysUntil?: number;
}

export function CardStatusBadge({ status, daysUntil }: CardStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'new':
        return {
          label: 'New',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          dotColor: 'bg-gray-400',
        };
      case 'due':
        return {
          label: 'Due Now',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          dotColor: 'bg-orange-500',
        };
      case 'overdue':
        return {
          label: 'Overdue',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          dotColor: 'bg-red-500',
        };
      case 'scheduled':
        return {
          label: daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          dotColor: 'bg-blue-500',
        };
      default:
        return {
          label: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          dotColor: 'bg-gray-400',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 ${config.textColor}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}
