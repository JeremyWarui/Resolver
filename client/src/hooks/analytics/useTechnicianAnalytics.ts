import { useState, useEffect, useCallback } from 'react';
import analyticsService from '@/api/services/analyticsService';
import type { TechnicianAnalytics, TechnicianAnalyticsParams } from '@/types';

interface UseTechnicianAnalyticsResult {
  data: TechnicianAnalytics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch technician performance analytics
 * Used for technician dashboard and admin monitoring
 * 
 * @param params - Optional technician_id to get specific technician's data
 * @returns Technician analytics data with loading and error states
 */
export const useTechnicianAnalytics = (params?: TechnicianAnalyticsParams): UseTechnicianAnalyticsResult => {
  const [data, setData] = useState<TechnicianAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyticsService.getTechnicianAnalytics(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch technician analytics'));
      console.error('Error fetching technician analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useTechnicianAnalytics;
