import { useState } from 'react';
import ticketsService from '@/api/services/ticketsService';
import type { UpdateTicketPayload, Ticket } from '@/types';

interface UseUpdateTicketResult {
  updateTicket: (ticketData: { id: number } & UpdateTicketPayload) => Promise<Ticket>;
  loading: boolean;
  error: Error | null;
}

export default function useUpdateTicket(): UseUpdateTicketResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTicket = async (ticketData: { id: number } & UpdateTicketPayload): Promise<Ticket> => {
    setLoading(true);
    setError(null);

    try {
      const { id, ...updateData } = ticketData;
      const updatedTicket = await ticketsService.updateTicket(id, updateData);
      return updatedTicket;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to update ticket');
      setError(errorObj);
      console.error('Error updating ticket:', err);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateTicket,
    loading,
    error,
  };
}