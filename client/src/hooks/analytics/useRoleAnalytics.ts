import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseRoleAnalyticsResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useRoleAnalytics<T>(
  fetcher: (params?: any) => Promise<T>,
  params?: any,
  skip = false
): UseRoleAnalyticsResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize params key to control refetch dependency
  const paramsKey = useMemo(() => JSON.stringify(params || {}), [params]);

  const fetchData = useCallback(async () => {
    if (skip) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setLoading(false);
    }
  }, [paramsKey, skip, fetcher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
