import { createContext, useContext, useMemo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { getTechnicianDashboard } from '@/api/services/technicianService';
import type { TechnicianDashboard, Ticket } from '@/types';

export interface TechnicianDashboardContextValue {
  data: TechnicianDashboard | null;
  sectionTickets: Ticket[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setSectionTickets: (tickets: Ticket[]) => void;
}

const TechnicianDashboardContext = createContext<TechnicianDashboardContextValue | undefined>(undefined);

export function TechnicianDashboardProvider({ children }: { children: ReactNode }) {
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
      setError('Failed to load technician dashboard');
      console.error('Technician dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const value: TechnicianDashboardContextValue = useMemo(
    () => ({ data, sectionTickets, loading, error, refetch: fetchDashboard, setSectionTickets }),
    [data, sectionTickets, loading, error, fetchDashboard]
  );

  return <TechnicianDashboardContext.Provider value={value}>{children}</TechnicianDashboardContext.Provider>;
}

export function useTechDashboard(): TechnicianDashboardContextValue {
  const context = useContext(TechnicianDashboardContext);
  if (!context) {
    throw new Error('useTechDashboard must be used within TechnicianDashboardProvider');
  }
  return context;
}
