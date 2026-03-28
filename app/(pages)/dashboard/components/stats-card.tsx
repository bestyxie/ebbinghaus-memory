import React from 'react';
import { TrendingUp, CheckCircle } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    value: string;
    type: 'up' | 'down' | 'stable';
  };
  variant?: 'default' | 'accent';
  progress?: number;
}

export function StatsCard({ title, value, subtitle, trend, variant = 'default', progress }: StatsCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg ${variant === 'accent' ? 'border-l-4 border-l-blue-600 shadow-sm' : ''}`}>
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        {trend && (
          <span className={`flex items-center text-[10px] font-bold gap-0.5 ${trend.type === 'up' ? 'text-emerald-500' : 'text-slate-500'}`}>
            {trend.value}
            {trend.type === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend.type === 'stable' && <CheckCircle className="h-3 w-3" />}
          </span>
        )}
        {variant === 'accent' && !trend && (
          <span className="text-blue-600 text-[10px] font-bold">Today</span>
        )}
      </div>

      <p className="text-xl font-bold mt-1">{value}</p>

      {progress !== undefined && (
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
          <div className="bg-emerald-500 h-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
    </div>
  );
}
