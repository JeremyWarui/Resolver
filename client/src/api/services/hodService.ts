import apiClient from '../client';
import type { HODDashboard } from '@/types';

/**
 * Fetch the HOD's dashboard data
 *
 * Returns a consolidated dashboard response with analytics, sections,
 * technicians, and ticket summary in a single API call.
 *
 * @param days Optional lookback window for analytics (default: 30)
 */
export async function getHODDashboard(days = 30): Promise<HODDashboard> {
  const { data } = await apiClient.get(`/hod/me/dashboard/?days=${days}`);
  return data;
}
