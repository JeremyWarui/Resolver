import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
  type Context,
  type FC,
} from 'react';

/**
 * Base interface for all dashboard data
 */
export interface BaseDashboard {
  [key: string]: unknown;
}

/**
 * Configuration for creating a dashboard context
 */
export interface DashboardContextConfig<T extends BaseDashboard> {
  name: string;
  serviceFetcher: (days: number) => Promise<T>;
  defaultDays?: number;
  hasTicketsCache?: boolean;
}

/**
 * Base context value structure (extendable)
 */
export interface BaseDashboardContextValue<T extends BaseDashboard> {
  data: T | null;
  loading: boolean;
  error: string | null;
  days: number;
  setDays: (days: number) => void;
  refetch: () => void;
}

/**
 * Factory function to create dashboard context, provider, and hook
 * Reduces duplication across Admin, HOD, Manager, SectionHead, Technician, User dashboards
 *
 * @example
 * const { Provider, useHook } = createDashboardContext({
 *   name: 'Admin',
 *   serviceFetcher: getAdminDashboard,
 *   defaultDays: 30,
 * });
 *
 * // In App.tsx: <Provider><App /></Provider>
 * // In component: const { data, loading } = useHook();
 */
export function createDashboardContext<T extends BaseDashboard>(
  config: DashboardContextConfig<T>
): {
  Context: Context<BaseDashboardContextValue<T> | undefined>;
  Provider: FC<{ children: ReactNode; initialDays?: number }>;
  useHook: () => BaseDashboardContextValue<T>;
} {
  const DashboardContext = createContext<BaseDashboardContextValue<T> | undefined>(undefined);

  const DashboardProvider: FC<{ children: ReactNode; initialDays?: number }> = ({
    children,
    initialDays = config.defaultDays ?? 30,
  }) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState(initialDays);

    const fetchDashboard = useCallback(async () => {
      try {
        setLoading(true);
        const dashboardData = await config.serviceFetcher(days);
        setData(dashboardData);
        setError(null);
      } catch (err) {
        setError(`Failed to load ${config.name} dashboard`);
        console.error(`${config.name} dashboard fetch error:`, err);
      } finally {
        setLoading(false);
      }
    }, [days]);

    // Fetch dashboard on mount and when days changes
    useEffect(() => {
      fetchDashboard();
    }, [fetchDashboard]);

    // Memoize context value
    const value: BaseDashboardContextValue<T> = useMemo(
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

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
  };

  const useHook = (): BaseDashboardContextValue<T> => {
    const context = useContext(DashboardContext);
    if (!context) {
      throw new Error(`use${config.name}Dashboard must be used within ${config.name}DashboardProvider`);
    }
    return context;
  };

  return {
    Context: DashboardContext,
    Provider: DashboardProvider,
    useHook,
  };
}
