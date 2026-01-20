'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from './stats-card';

interface DashboardStats {
  totalCards: number;
  dueToday: number;
  retentionRate: number;
}

export function StatsGrid() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

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
