import { createContext, useContext, useMemo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { getTechnicianDashboard } from '@/api/services/technicianService';
import type { TechnicianDashboard, Ticket } from '@/types';

interface TechnicianDashboardContextValue {
  // Data
  data: TechnicianDashboard | null;
  sectionTickets: Ticket[] | null;

  // Loading & Error States
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => void;
  setSectionTickets: (tickets: Ticket[]) => void;
}

const TechnicianDashboardContext = createContext<TechnicianDashboardContextValue | undefined>(
  undefined
);

interface TechnicianDashboardProviderProps {
  children: ReactNode;
}

/**
 * TechnicianDashboardProvider
 *
 * Provides centralized access to the technician dashboard data.
 * Fetches on mount and caches sections/assigned tickets for instant tab switching.
 *
 * Features:
 * - Single API call on mount (GET /technicians/me/dashboard/)
 * - Caches section tickets locally for lazy-fetch on first visit
 * - No re-fetches on tab switch
 * - Refetch available for explicit cache invalidation
 */
export function TechnicianDashboardProvider({ children }: TechnicianDashboardProviderProps) {
  const [data, setData] = useState<TechnicianDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionTickets, setSectionTickets] = useState<Ticket[] | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardData = await getTechnicianDashboard();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dashboard on mount
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Memoize context value
  const value: TechnicianDashboardContextValue = useMemo(
    () => ({
      data,
      sectionTickets,
      loading,
      error,
      refetch: fetchDashboard,
      setSectionTickets,
    }),
    [data, sectionTickets, loading, error, fetchDashboard]
  );

  return (
    <TechnicianDashboardContext.Provider value={value}>
      {children}
    </TechnicianDashboardContext.Provider>
  );
}

/**
 * useTechDashboard Hook
 *
 * Access technician dashboard data and actions.
 *
 * @throws {Error} If used outside TechnicianDashboardProvider
 *
 * @example
 * const { data, loading, refetch } = useTechDashboard();
 * const { assigned_tickets, kpis, sections } = data || {};
 */
export function useTechDashboard(): TechnicianDashboardContextValue {
  const context = useContext(TechnicianDashboardContext);

  if (context === undefined) {
    throw new Error('useTechDashboard must be used within TechnicianDashboardProvider');
  }

  return context;
}
