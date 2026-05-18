import apiClient from '../client';
import type { TechnicianDashboard } from '@/types';

/**
 * Fetch the technician's dashboard data
 *
 * Returns a consolidated dashboard response with assigned tickets, sections,
 * KPIs, and section queue statistics in a single API call.
 */
export async function getTechnicianDashboard(): Promise<TechnicianDashboard> {
  const { data } = await apiClient.get('/technicians/me/dashboard/');
  return data;
}
