'use client';

import { useEffect, useState, useCallback } from 'react';
import { StatsCard } from './stats-card';

interface DashboardStats {
  totalCards: number;
  dueToday: number;
  retentionRate: number;
}

interface StatsGridProps {
  onFetch?: (refetch: () => void) => void;
}

export function StatsGrid({ onFetch }: StatsGridProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Expose refetch function to parent via callback
  useEffect(() => {
    if (onFetch) {
      onFetch(fetchStats);
    }
  }, [onFetch, fetchStats]);

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[113px] animate-pulse bg-gray-200 rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="Total Knowledge"
        value={stats.totalCards.toLocaleString()}
        subtitle="Points tracked this year"
        trend={{ value: '+12%', type: 'up' }}
      />

      <StatsCard
        title="Due for Review"
        value={stats.dueToday}
        subtitle="Requires your attention"
        variant="accent"
      />

      <StatsCard
        title="Retention Rate"
        value={`${stats.retentionRate}%`}
        subtitle="Based on review history"
        trend={{ value: 'Stable', type: 'stable' }}
        progress={stats.retentionRate}
      />
    </div>
  );
}
