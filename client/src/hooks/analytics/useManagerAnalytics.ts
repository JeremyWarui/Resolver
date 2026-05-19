import analyticsService from '@/api/services/analyticsService';
import { useRoleAnalytics } from './useRoleAnalytics';
import type { ManagerAnalytics, RoleAnalyticsParams } from '@/types';

export const useManagerAnalytics = (params?: RoleAnalyticsParams, skip = false) =>
  useRoleAnalytics<ManagerAnalytics>(analyticsService.getManagerAnalytics, params, skip);

export default useManagerAnalytics;
