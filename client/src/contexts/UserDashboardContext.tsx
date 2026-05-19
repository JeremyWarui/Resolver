import { createContext, useContext, useMemo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { getUserDashboard } from '@/api/services/userDashboardService';
import type { UserDashboard, Ticket } from '@/types';

export interface UserDashboardContextValue {
  data: UserDashboard | null;
  userTickets: Ticket[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setUserTickets: (tickets: Ticket[]) => void;
}

const UserDashboardContext = createContext<UserDashboardContextValue | undefined>(undefined);

export function UserDashboardProvider({ children }: { children: ReactNode }) {
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
      setError('Failed to load user dashboard');
      console.error('User dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const value: UserDashboardContextValue = useMemo(
    () => ({ data, userTickets, loading, error, refetch: fetchDashboard, setUserTickets }),
    [data, userTickets, loading, error, fetchDashboard]
  );

  return <UserDashboardContext.Provider value={value}>{children}</UserDashboardContext.Provider>;
}

export function useUserDashboard(): UserDashboardContextValue {
  const context = useContext(UserDashboardContext);
  if (!context) {
    throw new Error('useUserDashboard must be used within UserDashboardProvider');
  }
  return context;
}
