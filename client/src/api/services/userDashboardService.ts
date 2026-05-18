import apiClient from '../client';
import type { UserDashboard } from '@/types';

/**
 * Fetch the user's dashboard data
 *
 * Returns a consolidated dashboard response with user analytics,
 * recent tickets, feedback opportunities, and status distribution
 * in a single API call.
 */
export async function getUserDashboard(): Promise<UserDashboard> {
  const { data } = await apiClient.get('/user/me/dashboard/');
  return data;
}
