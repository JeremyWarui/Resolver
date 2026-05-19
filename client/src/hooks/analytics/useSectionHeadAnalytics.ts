import analyticsService from '@/api/services/analyticsService';
import { useRoleAnalytics } from './useRoleAnalytics';
import type { SectionHeadAnalytics, RoleAnalyticsParams } from '@/types';

export const useSectionHeadAnalytics = (params?: RoleAnalyticsParams, skip = false) =>
  useRoleAnalytics<SectionHeadAnalytics>(analyticsService.getSectionHeadAnalytics, params, skip);

export default useSectionHeadAnalytics;
