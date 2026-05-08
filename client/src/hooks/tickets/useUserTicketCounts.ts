import { useState, useEffect } from 'react';
import ticketsService from '@/api/services/ticketsService';

interface UserTicketCounts {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  pending: number;
  loading: boolean;
}

export const useUserTicketCounts = (userId?: number): UserTicketCounts => {
  const [counts, setCounts] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId === undefined) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      ticketsService.getTickets({ raised_by: userId, page_size: 1 }),
      ticketsService.getTickets({ raised_by: userId, status: 'open', page_size: 1 }),
      ticketsService.getTickets({ raised_by: userId, status: 'in_progress', page_size: 1 }),
      ticketsService.getTickets({ raised_by: userId, status: 'assigned', page_size: 1 }),
      ticketsService.getTickets({ raised_by: userId, status: 'resolved', page_size: 1 }),
      ticketsService.getTickets({ raised_by: userId, status: 'pending', page_size: 1 }),
    ])
      .then(([total, open, inProgress, assigned, resolved, pending]) => {
        if (!isMounted) return;
        setCounts({
          total: total.count,
          open: open.count,
          inProgress: inProgress.count + assigned.count,
          resolved: resolved.count,
          pending: pending.count,
        });
      })
      .catch(err => {
        console.error('Failed to fetch user ticket counts:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { ...counts, loading };
};

export default useUserTicketCounts;
