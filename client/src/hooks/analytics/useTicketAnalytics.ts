import { useState, useEffect, useMemo } from 'react';
import analyticsService from '@/api/services/analyticsService';
import type { TicketAnalytics, TicketAnalyticsParams } from '@/types';

interface UseTicketAnalyticsResult {
  data: TicketAnalytics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch ticket analytics data
 * Used for general ticket statistics, trends, and distributions
 * 
 * @param params - Optional query parameters for filtering
 * @returns Ticket analytics data with loading and error states
 */
export const useTicketAnalytics = (params?: TicketAnalyticsParams): UseTicketAnalyticsResult => {
  const [data, setData] = useState<TicketAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Stringify params to use as stable dependency
  const paramsKey = useMemo(() => JSON.stringify(params || {}), [params]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Parse params from key to ensure we're using the memoized value
        const parsedParams = JSON.parse(paramsKey);
        const result = await analyticsService.getTicketAnalytics(
          Object.keys(parsedParams).length > 0 ? parsedParams : undefined
        );
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch ticket analytics'));
          console.error('Error fetching ticket analytics:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [paramsKey]); // Only depend on stringified params

  const refetch = useMemo(() => async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyticsService.getTicketAnalytics(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch ticket analytics'));
      console.error('Error fetching ticket analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

export default useTicketAnalytics;
