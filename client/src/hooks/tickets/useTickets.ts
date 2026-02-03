import { useState, useEffect, useCallback } from 'react';
import ticketsService from '@/api/services/ticketsService';
import type { Ticket, TicketsParams } from '@/types';

interface UseTicketsResult {
  tickets: Ticket[];
  totalTickets: number;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch tickets with direct API calls and state management
 * 
 * Pure ticket fetching hook - does not depend on SharedDataContext to avoid conflicts.
 * Components should get reference data (sections, facilities) from SharedDataContext directly.
 * 
 * @param params - Optional filtering and pagination parameters
 * @returns Tickets data with loading states
 */
export const useTickets = (params?: TicketsParams): UseTicketsResult => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch only tickets data
      const ticketsResponse = await ticketsService.getTickets(params);
      setTickets(ticketsResponse.results);
      setTotalTickets(ticketsResponse.count);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tickets'));
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [
    params?.page,
    params?.page_size,
    params?.search,
    params?.status,
    params?.section,
    params?.assigned_to,
    params?.assigned_to__isnull,
    params?.raised_by,
    params?.ordering,
    params?.is_overdue,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    tickets,
    totalTickets,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useTickets;
