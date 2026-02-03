import { useState } from 'react';
import { toast } from 'sonner';
import ticketsService from '@/api/services/ticketsService';
import type { CreateTicketPayload, Ticket } from '@/types';

interface UseCreateTicketResult {
  createTicket: (ticketData: CreateTicketPayload) => Promise<Ticket>;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook to create tickets with loading states and error handling
 * 
 * Automatically handles:
 * - Loading states during creation
 * - Error handling with consistent messaging  
 * - Success notifications via toast
 * - Error state reset functionality
 * 
 * @returns Mutation function with loading, error states and reset
 * 
 * @example
 * const { createTicket, loading, error, reset } = useCreateTicket();
 * 
 * const handleSubmit = async (data) => {
 *   try {
 *     const newTicket = await createTicket(data);
 *     // Success automatically handled with toast notification
 *     onSuccess(newTicket);
 *   } catch (err) {
 *     // Error automatically handled with toast notification
 *     console.log('Creation failed:', err);
 *   }
 * };
 */
export const useCreateTicket = (): UseCreateTicketResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTicket = async (ticketData: CreateTicketPayload): Promise<Ticket> => {
    setLoading(true);
    setError(null);

    try {
      const newTicket = await ticketsService.createTicket(ticketData);
      toast.success('Ticket created successfully');
      return newTicket;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to create ticket');
      setError(errorObj);
      toast.error('Failed to create ticket');
      console.error('Error creating ticket:', err);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
  };

  return {
    createTicket,
    loading,
    error,
    reset,
  };
};

export default useCreateTicket;
