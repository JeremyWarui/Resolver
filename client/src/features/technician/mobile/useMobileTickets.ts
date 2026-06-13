import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { updateTicketStatus, addComment } from '@/lib/api/tickets';
import type { Ticket } from '@/types';

export type MobileTicketStatus = 'assigned' | 'in_progress' | 'pending' | 'resolved';

export function useMobileTickets() {
  return useQuery<Ticket[]>({
    queryKey: ['mobile-tickets'],
    queryFn: async () => {
      const { data } = await apiClient.get('/tickets/', {
        params: { assigned_to_me: true, page_size: 50 },
      });
      return Array.isArray(data) ? data : (data.results ?? []);
    },
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useMobileTicketDetail(ticketId: number | null) {
  return useQuery<Ticket>({
    queryKey: ['mobile-ticket', ticketId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tickets/${ticketId}/`);
      return data;
    },
    enabled: ticketId != null,
    staleTime: 30 * 1000,
  });
}

export function useUpdateTicketStatus(ticketId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ status, reason }: { status: string; reason: string }) =>
      updateTicketStatus(ticketId, status, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-tickets'] });
      qc.invalidateQueries({ queryKey: ['mobile-ticket', ticketId] });
    },
  });
}

export function useAddComment(ticketId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => addComment(ticketId, body, 'public'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mobile-ticket', ticketId] });
    },
  });
}
