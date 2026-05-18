import { createContext, useContext, useMemo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { getManagerDashboard } from '@/api/services/managerService';
import type { ManagerDashboard, Ticket } from '@/types';

interface ManagerDashboardContextValue {
  // Data
  data: ManagerDashboard | null;
  managerTickets: Ticket[] | null;

  // Loading & Error States
  loading: boolean;
  error: string | null;

  // Days filter (7, 30, or 90; default 30)
  days: number;

  // Actions
  setDays: (days: number) => void;
  refetch: () => void;
  setManagerTickets: (tickets: Ticket[]) => void;
}

const ManagerDashboardContext = createContext<ManagerDashboardContextValue | undefined>(
  undefined
);

interface ManagerDashboardProviderProps {
  children: ReactNode;
  initialDays?: number;
}

/**
 * ManagerDashboardProvider
 *
 * Provides centralized access to the manager dashboard data.
 * Fetches on mount and whenever the days parameter changes.
 *
 * Features:
 * - Single API call on mount (GET /manager/me/dashboard/?days=30)
 * - Days parameter is mandatory and controls analytics lookback window
 * - When days changes, refetches dashboard and updates ALL tabs simultaneously
 * - Caches manager tickets locally for instant tab switching
 * - No re-fetches on tab switch (only when days changes)
 * - Refetch available for explicit cache invalidation
 */
export function ManagerDashboardProvider({ children, initialDays = 30 }: ManagerDashboardProviderProps) {
  const [data, setData] = useState<ManagerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(initialDays);
  const [managerTickets, setManagerTickets] = useState<Ticket[] | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardData = await getManagerDashboard(days);
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  // Fetch dashboard on mount and when days changes
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Memoize context value
  const value: ManagerDashboardContextValue = useMemo(
    () => ({
      data,
      managerTickets,
      loading,
      error,
      days,
      setDays,
      refetch: fetchDashboard,
      setManagerTickets,
    }),
    [data, managerTickets, loading, error, days, fetchDashboard]
  );

  return (
    <ManagerDashboardContext.Provider value={value}>
      {children}
    </ManagerDashboardContext.Provider>
  );
}

/**
 * useManagerDashboard Hook
 *
 * Access manager dashboard data and actions.
 *
 * @throws {Error} If used outside ManagerDashboardProvider
 *
 * @example
 * const { data, loading, days, setDays, refetch } = useManagerDashboard();
 * const { overview, campuses, sections } = data || {};
 */
export function useManagerDashboard(): ManagerDashboardContextValue {
  const context = useContext(ManagerDashboardContext);

  if (context === undefined) {
    throw new Error('useManagerDashboard must be used within ManagerDashboardProvider');
  }

  return context;
}
