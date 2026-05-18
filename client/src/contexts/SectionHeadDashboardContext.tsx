import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getSectionHeadDashboard } from '@/api/services/sectionHeadService';
import type { SectionHeadDashboard, Ticket } from '@/types';

interface SectionHeadDashboardContextValue {
  // Data
  data: SectionHeadDashboard | null;
  sectionTickets: Ticket[] | null;

  // Time range
  days: number;

  // Loading & Error States
  loading: boolean;
  error: string | null;

  // Actions
  setDays: (days: number) => void;
  refetch: () => void;
  setSectionTickets: (tickets: Ticket[]) => void;
}

const SectionHeadDashboardContext = createContext<
  SectionHeadDashboardContextValue | undefined
>(undefined);

interface SectionHeadDashboardProviderProps {
  children: ReactNode;
}

/**
 * SectionHeadDashboardProvider
 *
 * Provides centralized access to the section head dashboard data.
 * Fetches on mount and caches sections/technicians for instant tab switching.
 *
 * Features:
 * - Single API call on mount (GET /section-head/me/dashboard/)
 * - Supports days parameter for time-range filtering
 * - Caches section tickets locally for lazy-fetch on first visit
 * - No re-fetches on tab switch
 * - Refetch available for explicit cache invalidation
 */
export function SectionHeadDashboardProvider({
  children,
}: SectionHeadDashboardProviderProps) {
  const [data, setData] = useState<SectionHeadDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionTickets, setSectionTickets] = useState<Ticket[] | null>(null);
  const [days, setDaysState] = useState(30);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardData = await getSectionHeadDashboard(days);
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

  const setDays = useCallback((newDays: number) => {
    setDaysState(newDays);
  }, []);

  // Memoize context value
  const value: SectionHeadDashboardContextValue = useMemo(
    () => ({
      data,
      sectionTickets,
      days,
      loading,
      error,
      setDays,
      refetch: fetchDashboard,
      setSectionTickets,
    }),
    [data, sectionTickets, days, loading, error, fetchDashboard, setDays]
  );

  return (
    <SectionHeadDashboardContext.Provider value={value}>
      {children}
    </SectionHeadDashboardContext.Provider>
  );
}

/**
 * useSectionHeadDashboard Hook
 *
 * Access section head dashboard data and actions.
 *
 * @throws {Error} If used outside SectionHeadDashboardProvider
 *
 * @example
 * const { data, loading, days, setDays, refetch } = useSectionHeadDashboard();
 * const { sections, technicians, overview } = data || {};
 */
export function useSectionHeadDashboard(): SectionHeadDashboardContextValue {
  const context = useContext(SectionHeadDashboardContext);

  if (context === undefined) {
    throw new Error(
      'useSectionHeadDashboard must be used within SectionHeadDashboardProvider'
    );
  }

  return context;
}
