import analyticsService from '@/api/services/analyticsService';
import { useRoleAnalytics } from './useRoleAnalytics';
import type { HODAnalytics, RoleAnalyticsParams } from '@/types';

export const useHODAnalytics = (params?: RoleAnalyticsParams, skip = false) =>
  useRoleAnalytics<HODAnalytics>(analyticsService.getHODAnalytics, params, skip);

export default useHODAnalytics;
