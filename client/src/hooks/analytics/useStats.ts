import { useState, useEffect, useCallback } from 'react';
import analyticsService, { TicketAnalytics, TechnicianAnalytics } from '@/api/services/analyticsService';

interface UseStatsParams {
  user?: number | null;
  fetchTicketStats?: boolean;
  fetchTechnicianStats?: boolean;
}

interface UseStatsResult {
  ticketStats: TicketAnalytics;
  technicianStats: TechnicianAnalytics;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const emptyTicketStats: TicketAnalytics = {
  open_tickets: 0,
  assigned_tickets: 0,
  resolved_tickets: 0,
  pending_tickets: 0,
};

const emptyTechnicianStats: TechnicianAnalytics = {
  available: 0,
  busy: 0,
  off_duty: 0,
  total: 0,
};

export const useStats = (params: UseStatsParams = {}): UseStatsResult => {
  const { user = null, fetchTicketStats = true, fetchTechnicianStats = true } = params;

  const [ticketStats, setTicketStats] = useState<TicketAnalytics>(emptyTicketStats);
  const [technicianStats, setTechnicianStats] = useState<TechnicianAnalytics>(emptyTechnicianStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    // If nothing requested, return empty data without making a query
    if (!fetchTicketStats && !fetchTechnicianStats) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const promises = [];

      if (fetchTicketStats) {
        promises.push(
          analyticsService.getTicketAnalytics(user !== null ? { user } : undefined)
        );
      }

      if (fetchTechnicianStats) {
        promises.push(analyticsService.getTechnicianAnalytics());
      }

      const results = await Promise.all(promises);

      let ticketIndex = 0;
      if (fetchTicketStats) {
        setTicketStats(results[ticketIndex] as TicketAnalytics);
        ticketIndex++;
      }

      if (fetchTechnicianStats) {
        setTechnicianStats(results[ticketIndex] as TechnicianAnalytics);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user, fetchTicketStats, fetchTechnicianStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ticketStats,
    technicianStats,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useStats;
