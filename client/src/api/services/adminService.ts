import apiClient from '../client';
import type { AdminDashboard } from '@/types';

/**
 * Fetch the admin's consolidated dashboard data
 *
 * Returns a single API response containing:
 * - Admin user information
 * - System-wide analytics (overview, overdue tickets)
 * - Organisation structure summary (counts)
 *
 * This is a BFF endpoint that consolidates all admin dashboard data
 * in a single call, eliminating the need for multiple API requests.
 *
 * @param days Optional lookback window for analytics (default: 30)
 */
export async function getAdminDashboard(days = 30): Promise<AdminDashboard> {
  const { data } = await apiClient.get(`/admin/me/dashboard/?days=${days}`);
  return data;
}
