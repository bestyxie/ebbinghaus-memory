'use client';

import { createContext, useContext } from 'react';

interface CardRefreshContextType {
  refresh: () => void;
}

export const CardRefreshContext = createContext<CardRefreshContextType | null>(null);

export function CardRefreshProvider({ children }: { children: React.ReactNode }) {
  // This is a placeholder - the actual provider is in DashboardContent
  // We'll keep this for future use if needed
  return <>{children}</>;
}

export function useCardRefresh() {
  const context = useContext(CardRefreshContext);
  if (!context) {
    // Return a no-op function if not in context (for floating button outside provider)
    return { refresh: () => {} };
  }
  return context;
}
