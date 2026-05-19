import analyticsService from '@/api/services/analyticsService';
import { useRoleAnalytics } from './useRoleAnalytics';
import type { AdminDashboardAnalytics } from '@/types';

export const useAdminAnalytics = (skip = false) =>
  useRoleAnalytics<AdminDashboardAnalytics>(analyticsService.getAdminDashboardAnalytics, undefined, skip);

export default useAdminAnalytics;
