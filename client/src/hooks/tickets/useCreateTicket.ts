import { useState } from 'react';
import ticketsService from '@/api/services/ticketsService';
import type { CreateTicketPayload, Ticket } from '@/types';

interface UseCreateTicketResult {
  createTicket: (ticketData: CreateTicketPayload) => Promise<Ticket>;
  loading: boolean;
  error: Error | null;
}

export const useCreateTicket = (): UseCreateTicketResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTicket = async (ticketData: CreateTicketPayload): Promise<Ticket> => {
    setLoading(true);
    setError(null);

    try {
      const ticket = await ticketsService.createTicket(ticketData);
      return ticket;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to create ticket');
      setError(errorObj);
      console.error('Error creating ticket:', err);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTicket,
    loading,
    error,
  };
};

export default useCreateTicket;
