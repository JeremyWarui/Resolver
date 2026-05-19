import analyticsService from '@/api/services/analyticsService';
import { useRoleAnalytics } from './useRoleAnalytics';
import type { TechnicianAnalytics, TechnicianAnalyticsParams } from '@/types';

export const useTechnicianAnalytics = (params?: TechnicianAnalyticsParams, skip = false) =>
  useRoleAnalytics<TechnicianAnalytics>(analyticsService.getTechnicianAnalytics, params, skip);

export default useTechnicianAnalytics;
