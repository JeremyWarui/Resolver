import apiClient from '../client';
import type {
  TicketAnalytics,
  TicketAnalyticsParams,
  TechnicianAnalytics,
  TechnicianAnalyticsParams,
  AdminDashboardAnalytics,
} from '@/types';

const analyticsService = {
  /**
   * Get ticket analytics with optional filters
   * Endpoint: GET /api/analytics/tickets/
   * 
   * @param params - Query parameters for filtering and grouping
   * @returns Ticket analytics data including counts, trends, and distributions
   */
  getTicketAnalytics: async (params?: TicketAnalyticsParams): Promise<TicketAnalytics> => {
    const response = await apiClient.get('/analytics/tickets/', { params });
    return response.data;
  },

  /**
   * Get technician performance analytics
   * Endpoint: GET /api/analytics/technicians/
   * 
   * @param params - Optional technician_id to get specific technician's performance
   * @returns Technician performance metrics and optional section ratings
   */
  getTechnicianAnalytics: async (params?: TechnicianAnalyticsParams): Promise<TechnicianAnalytics> => {
    const response = await apiClient.get('/analytics/technicians/', { params });
    return response.data;
  },

  /**
   * Get admin dashboard analytics (system-wide overview)
   * Endpoint: GET /api/analytics/admin-dashboard/
   * 
   * @returns System overview and overdue tickets
   */
  getAdminDashboardAnalytics: async (): Promise<AdminDashboardAnalytics> => {
    const response = await apiClient.get('/analytics/admin-dashboard/');
    return response.data;
  },
};

export default analyticsService;
