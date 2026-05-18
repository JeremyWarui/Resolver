import apiClient from '../client';
import type { SectionHeadDashboard } from '@/types';

/**
 * Fetch the section head's dashboard data
 *
 * Returns a consolidated dashboard response with assigned sections,
 * technicians, analytics, and ticket summary in a single API call.
 *
 * @param days - Time range for analytics (default: 30)
 */
export async function getSectionHeadDashboard(
  days: number = 30
): Promise<SectionHeadDashboard> {
  const { data } = await apiClient.get('/section-head/me/dashboard/', {
    params: { days },
  });
  return data;
}
