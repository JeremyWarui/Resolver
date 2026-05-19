import { createContext, useContext, useMemo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { getHODDashboard } from '@/api/services/hodService';
import type { HODDashboard, Ticket } from '@/types';

export interface HODDashboardContextValue {
  data: HODDashboard | null;
  hodTickets: Ticket[] | null;
  loading: boolean;
  error: string | null;
  days: number;
  setDays: (days: number) => void;
  refetch: () => void;
  setHodTickets: (tickets: Ticket[]) => void;
}

const HODDashboardContext = createContext<HODDashboardContextValue | undefined>(undefined);

export function HODDashboardProvider({ children }: { children: ReactNode }) {
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
      setError('Failed to load HOD dashboard');
      console.error('HOD dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const value: HODDashboardContextValue = useMemo(
    () => ({ data, hodTickets, loading, error, days, setDays, refetch: fetchDashboard, setHodTickets }),
    [data, hodTickets, loading, error, days, fetchDashboard]
  );

  return <HODDashboardContext.Provider value={value}>{children}</HODDashboardContext.Provider>;
}

export function useHODDashboard(): HODDashboardContextValue {
  const context = useContext(HODDashboardContext);
  if (!context) {
    throw new Error('useHODDashboard must be used within HODDashboardProvider');
  }
  return context;
}
