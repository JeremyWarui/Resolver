import { useState, useEffect, useCallback } from 'react';
import analyticsService from '@/api/services/analyticsService';
import type { AdminDashboardAnalytics } from '@/types';

interface UseAdminAnalyticsResult {
  data: AdminDashboardAnalytics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch admin dashboard analytics
 * Provides system-wide overview and overdue tickets
 * Restricted to admin and manager roles
 * 
 * @returns Admin dashboard analytics with loading and error states
 */
export const useAdminAnalytics = (skip = false): UseAdminAnalyticsResult => {
  const [data, setData] = useState<AdminDashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    setError(null);

    try {
      const result = await analyticsService.getAdminDashboardAnalytics();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch admin analytics'));
      console.error('Error fetching admin analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [skip]);

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

export default useAdminAnalytics;
