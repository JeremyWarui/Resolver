import { useState, useEffect } from 'react';
import analyticsService from '@/api/services/analyticsService';

interface UserTicketCounts {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  pending: number;
  loading: boolean;
}

interface UserAnalyticsResponse {
  summary: {
    total: number;
    open: number;
    closed: number;
    pending: number;
    pending_approval: number;
    escalated: number;
    rejected: number;
    avg_resolution_hours: number;
  };
  status_distribution: Array<{ status: string; count: number }>;
}

export const useUserTicketCounts = (userId?: number): UserTicketCounts => {
  const [counts, setCounts] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId === undefined) return;

    let isMounted = true;
    setLoading(true);

    analyticsService
      .getUserAnalytics()
      .then((data: UserAnalyticsResponse) => {
        if (!isMounted) return;

        // Extract counts from status distribution
        const statusMap = new Map(data.status_distribution.map(s => [s.status, s.count]));

        setCounts({
          total: data.summary.total,
          open: statusMap.get('open') || 0,
          inProgress: (statusMap.get('assigned') || 0) + (statusMap.get('in_progress') || 0),
          resolved: data.summary.closed,
          pending: data.summary.pending,
        });
      })
      .catch(err => {
        console.error('Failed to fetch user ticket counts:', err);
        if (isMounted) {
          setCounts({ total: 0, open: 0, inProgress: 0, resolved: 0, pending: 0 });
        }
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
