import { createContext, useContext, useMemo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { getAdminDashboard } from '@/api/services/adminService';
import type { AdminDashboard } from '@/types';

interface AdminDashboardContextValue {
  // Data
  data: AdminDashboard | null;

  // Loading & Error States
  loading: boolean;
  error: string | null;

  // Days filter (default 30)
  days: number;

  // Actions
  setDays: (days: number) => void;
  refetch: () => void;
}

const AdminDashboardContext = createContext<AdminDashboardContextValue | undefined>(
  undefined
);

interface AdminDashboardProviderProps {
  children: ReactNode;
  initialDays?: number;
}

/**
 * AdminDashboardProvider
 *
 * Provides centralized access to the admin dashboard data.
 * Fetches on mount and whenever the days parameter changes.
 *
 * Features:
 * - Single BFF API call on mount (GET /admin/me/dashboard/?days=30)
 * - Days parameter controls analytics lookback window
 * - When days changes, refetches dashboard data
 * - Caches all dashboard data (admin info, analytics, org summary)
 * - Refetch available for explicit cache invalidation
 */
export function AdminDashboardProvider({ children, initialDays = 30 }: AdminDashboardProviderProps) {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(initialDays);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardData = await getAdminDashboard(days);
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError('Failed to load admin dashboard');
      console.error('Admin dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  // Fetch dashboard on mount and when days changes
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Memoize context value
  const value: AdminDashboardContextValue = useMemo(
    () => ({
      data,
      loading,
      error,
      days,
      setDays,
      refetch: fetchDashboard,
    }),
    [data, loading, error, days, fetchDashboard]
  );

  return (
    <AdminDashboardContext.Provider value={value}>
      {children}
    </AdminDashboardContext.Provider>
  );
}

/**
 * useAdminDashboard Hook
 *
 * Access admin dashboard data and actions.
 *
 * @throws {Error} If used outside AdminDashboardProvider
 *
 * @example
 * const { data, loading, days, setDays, refetch } = useAdminDashboard();
 * const { admin, analytics, org_summary } = data || {};
 */
export function useAdminDashboard(): AdminDashboardContextValue {
  const context = useContext(AdminDashboardContext);

  if (context === undefined) {
    throw new Error('useAdminDashboard must be used within AdminDashboardProvider');
  }

  return context;
}
