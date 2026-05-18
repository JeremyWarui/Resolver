import apiClient from '../client';
import type { ManagerDashboard } from '@/types';

/**
 * Fetch the manager's dashboard data
 *
 * Returns a consolidated dashboard response with analytics, department info,
 * and cross-campus ticket summary in a single API call.
 *
 * @param days Lookback window for analytics (7, 30, or 90 days; default: 30)
 */
export async function getManagerDashboard(days = 30): Promise<ManagerDashboard> {
  const { data } = await apiClient.get(`/manager/me/dashboard/?days=${days}`);
  return data;
}
