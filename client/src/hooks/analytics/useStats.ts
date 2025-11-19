import { useState, useEffect, useCallback } from 'react';
import analyticsService from '@/api/services/analyticsService';

// Local types for useStats hook (not the same as API analytics types)
interface TicketStatsLocal {
  open_tickets: number;
  assigned_tickets: number;
  resolved_tickets: number;
  pending_tickets: number;
}

interface TechnicianStatsLocal {
  available: number;
  busy: number;
  off_duty: number;
  total: number;
}

interface UseStatsParams {
  user?: number | null;
  fetchTicketStats?: boolean;
  fetchTechnicianStats?: boolean;
}

interface UseStatsResult {
  ticketStats: TicketStatsLocal;
  technicianStats: TechnicianStatsLocal;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const emptyTicketStats: TicketStatsLocal = {
  open_tickets: 0,
  assigned_tickets: 0,
  resolved_tickets: 0,
  pending_tickets: 0,
};

const emptyTechnicianStats: TechnicianStatsLocal = {
  available: 0,
  busy: 0,
  off_duty: 0,
  total: 0,
};

export const useStats = (params: UseStatsParams = {}): UseStatsResult => {
  const { user = null, fetchTicketStats = true, fetchTechnicianStats = true } = params;

  const [ticketStats, setTicketStats] = useState<TicketStatsLocal>(emptyTicketStats);
  const [technicianStats, setTechnicianStats] = useState<TechnicianStatsLocal>(emptyTechnicianStats);
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
          analyticsService.getTicketAnalytics(user !== null ? { raised_by: user } : undefined)
        );
      }

      if (fetchTechnicianStats) {
        promises.push(analyticsService.getTechnicianAnalytics());
      }

      const results = await Promise.all(promises);

      let ticketIndex = 0;
      if (fetchTicketStats) {
        // Note: This hook uses deprecated API structure - cast through unknown
        setTicketStats(results[ticketIndex] as unknown as TicketStatsLocal);
        ticketIndex++;
      }

      if (fetchTechnicianStats) {
        // Note: This hook uses deprecated API structure - cast through unknown
        setTechnicianStats(results[ticketIndex] as unknown as TechnicianStatsLocal);
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
