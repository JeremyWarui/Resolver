import { useState } from 'react';
import ticketsService from '@/api/services/ticketsService';
import type { UpdateTicketPayload } from '@/types';

interface UseUpdateTicketResult {
  updateTicket: (ticketData: { id: number } & UpdateTicketPayload) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export default function useUpdateTicket(): UseUpdateTicketResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTicket = async (ticketData: { id: number } & UpdateTicketPayload) => {
    setLoading(true);
    setError(null);

    try {
      const { id, ...updateData } = ticketData;
      await ticketsService.updateTicket(id, updateData);
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