import { useState, useEffect, useCallback } from 'react';
import ticketsService from '@/api/services/ticketsService';
import sectionsService from '@/api/services/sectionsService';
import type { Ticket, TicketsParams, Section } from '@/types';

interface UseTicketsResult {
  tickets: Ticket[];
  totalTickets: number;
  sections: Section[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useTickets = (params?: TicketsParams): UseTicketsResult => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch tickets and sections in parallel
      const [ticketsResponse, sectionsResponse] = await Promise.all([
        ticketsService.getTickets(params),
        sectionsService.getSections(),
      ]);

      setTickets(ticketsResponse.results);
      setTotalTickets(ticketsResponse.count);
      setSections(sectionsResponse.results);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tickets'));
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params?.page,
    params?.page_size,
    params?.status,
    params?.section,
    params?.assigned_to,
    params?.raised_by,
    params?.ordering,
    params?.search,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    tickets,
    totalTickets,
    sections,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useTickets;
