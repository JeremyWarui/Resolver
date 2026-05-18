import { createContext, useContext, useMemo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { getUserDashboard } from '@/api/services/userDashboardService';
import type { UserDashboard, Ticket } from '@/types';

interface UserDashboardContextValue {
  // Data
  data: UserDashboard | null;
  userTickets: Ticket[] | null;

  // Loading & Error States
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => void;
  setUserTickets: (tickets: Ticket[]) => void;
}

const UserDashboardContext = createContext<UserDashboardContextValue | undefined>(
  undefined
);

interface UserDashboardProviderProps {
  children: ReactNode;
}

/**
 * UserDashboardProvider
 *
 * Provides centralized access to the user dashboard data.
 * Fetches on mount and caches user tickets for instant tab switching.
 *
 * Features:
 * - Single API call on mount (GET /user/me/dashboard/)
 * - Caches user tickets locally for lazy-fetch on first visit
 * - No re-fetches on tab switch
 * - Refetch available for explicit cache invalidation
 * - No org data fetched (user role doesn't need sections, facilities, etc)
 */
export function UserDashboardProvider({ children }: UserDashboardProviderProps) {
  const [data, setData] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTickets, setUserTickets] = useState<Ticket[] | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardData = await getUserDashboard();
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
  const value: UserDashboardContextValue = useMemo(
    () => ({
      data,
      userTickets,
      loading,
      error,
      refetch: fetchDashboard,
      setUserTickets,
    }),
    [data, userTickets, loading, error, fetchDashboard]
  );

  return (
    <UserDashboardContext.Provider value={value}>
      {children}
    </UserDashboardContext.Provider>
  );
}

/**
 * useUserDashboard Hook
 *
 * Access user dashboard data and actions.
 *
 * @throws {Error} If used outside UserDashboardProvider
 *
 * @example
 * const { data, loading, refetch } = useUserDashboard();
 * const { user, summary, recent_tickets } = data || {};
 */
export function useUserDashboard(): UserDashboardContextValue {
  const context = useContext(UserDashboardContext);

  if (context === undefined) {
    throw new Error('useUserDashboard must be used within UserDashboardProvider');
  }

  return context;
}
