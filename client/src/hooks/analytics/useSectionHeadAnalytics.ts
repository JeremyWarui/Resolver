import { useState, useEffect, useCallback } from 'react';
import analyticsService from '@/api/services/analyticsService';
import type { SectionHeadAnalytics, RoleAnalyticsParams } from '@/types';

interface UseSectionHeadAnalyticsResult {
  data: SectionHeadAnalytics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useSectionHeadAnalytics = (params?: RoleAnalyticsParams): UseSectionHeadAnalyticsResult => {
  const [data, setData] = useState<SectionHeadAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getSectionHeadAnalytics(params);
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

export default useSectionHeadAnalytics;
