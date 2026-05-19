import { createContext, useContext, useMemo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { getSectionHeadDashboard } from '@/api/services/sectionHeadService';
import type { SectionHeadDashboard, Ticket } from '@/types';

export interface SectionHeadDashboardContextValue {
  data: SectionHeadDashboard | null;
  sectionTickets: Ticket[] | null;
  days: number;
  loading: boolean;
  error: string | null;
  setDays: (days: number) => void;
  refetch: () => void;
  setSectionTickets: (tickets: Ticket[]) => void;
}

const SectionHeadDashboardContext = createContext<SectionHeadDashboardContextValue | undefined>(undefined);

export function SectionHeadDashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SectionHeadDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionTickets, setSectionTickets] = useState<Ticket[] | null>(null);
  const [days, setDays] = useState(30);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardData = await getSectionHeadDashboard(days);
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError('Failed to load section head dashboard');
      console.error('Section head dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const value: SectionHeadDashboardContextValue = useMemo(
    () => ({ data, sectionTickets, days, loading, error, setDays, refetch: fetchDashboard, setSectionTickets }),
    [data, sectionTickets, days, loading, error, fetchDashboard]
  );

  return <SectionHeadDashboardContext.Provider value={value}>{children}</SectionHeadDashboardContext.Provider>;
}

export function useSectionHeadDashboard(): SectionHeadDashboardContextValue {
  const context = useContext(SectionHeadDashboardContext);
  if (!context) {
    throw new Error('useSectionHeadDashboard must be used within SectionHeadDashboardProvider');
  }
  return context;
}
