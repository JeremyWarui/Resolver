import { useState, useEffect, useCallback } from 'react';
import analyticsService from '@/api/services/analyticsService';
import type { HODAnalytics, RoleAnalyticsParams } from '@/types';

interface UseHODAnalyticsResult {
  data: HODAnalytics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useHODAnalytics = (params?: RoleAnalyticsParams): UseHODAnalyticsResult => {
  const [data, setData] = useState<HODAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getHODAnalytics(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setLoading(false);
    }
  }, [params?.days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useHODAnalytics;
