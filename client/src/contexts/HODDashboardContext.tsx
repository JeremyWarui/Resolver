import { createContext, useContext, useMemo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { getHODDashboard } from '@/api/services/hodService';
import type { HODDashboard, Ticket } from '@/types';

interface HODDashboardContextValue {
  // Data
  data: HODDashboard | null;
  hodTickets: Ticket[] | null;

  // Loading & Error States
  loading: boolean;
  error: string | null;

  // Parameters
  days: number;

  // Actions
  setDays: (days: number) => void;
  refetch: () => void;
  setHodTickets: (tickets: Ticket[]) => void;
}

const HODDashboardContext = createContext<HODDashboardContextValue | undefined>(
  undefined
);

interface HODDashboardProviderProps {
  children: ReactNode;
}

/**
 * HODDashboardProvider
 *
 * Provides centralized access to the HOD dashboard data.
 * Fetches on mount and when days parameter changes.
 * Caches technician list and ticket data for instant tab switching.
 *
 * Features:
 * - Single API call on mount (GET /hod/me/dashboard/?days=...)
 * - Supports configurable days parameter for analytics time range
 * - Caches HOD tickets locally for lazy-fetch on first visit
 * - No re-fetches on tab switch
 * - Refetch available for explicit cache invalidation
 */
export function HODDashboardProvider({ children }: HODDashboardProviderProps) {
  const [data, setData] = useState<HODDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [hodTickets, setHodTickets] = useState<Ticket[] | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardData = await getHODDashboard(days);
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
  const value: HODDashboardContextValue = useMemo(
    () => ({
      data,
      hodTickets,
      loading,
      error,
      days,
      setDays,
      refetch: fetchDashboard,
      setHodTickets,
    }),
    [data, hodTickets, loading, error, days, fetchDashboard]
  );

  return (
    <HODDashboardContext.Provider value={value}>
      {children}
    </HODDashboardContext.Provider>
  );
}

/**
 * useHODDashboard Hook
 *
 * Access HOD dashboard data and actions.
 *
 * @throws {Error} If used outside HODDashboardProvider
 *
 * @example
 * const { data, loading, days, setDays, refetch } = useHODDashboard();
 * const { analytics, sections, technicians } = data || {};
 */
export function useHODDashboard(): HODDashboardContextValue {
  const context = useContext(HODDashboardContext);

  if (context === undefined) {
    throw new Error('useHODDashboard must be used within HODDashboardProvider');
  }

  return context;
}
