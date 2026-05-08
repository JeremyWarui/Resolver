import { useState, useEffect, useCallback } from 'react';
import analyticsService from '@/api/services/analyticsService';
import type { ManagerAnalytics, RoleAnalyticsParams } from '@/types';

interface UseManagerAnalyticsResult {
  data: ManagerAnalytics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useManagerAnalytics = (params?: RoleAnalyticsParams): UseManagerAnalyticsResult => {
  const [data, setData] = useState<ManagerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getManagerAnalytics(params);
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

export default useManagerAnalytics;
