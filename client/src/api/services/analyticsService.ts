import apiClient from '../client';
import type {
  TicketAnalytics,
  TicketAnalyticsParams,
  TechnicianAnalytics,
  TechnicianAnalyticsParams,
  AdminDashboardAnalytics,
  SectionHeadAnalytics,
  HODAnalytics,
  ManagerAnalytics,
  OrganisationAnalytics,
  RoleAnalyticsParams,
} from '@/types';

const analyticsService = {
  getTicketAnalytics: async (params?: TicketAnalyticsParams): Promise<TicketAnalytics> => {
    const response = await apiClient.get('/analytics/tickets/', { params });
    return response.data;
  },

  getTechnicianAnalytics: async (params?: TechnicianAnalyticsParams): Promise<TechnicianAnalytics> => {
    const response = await apiClient.get('/analytics/technicians/', { params });
    return response.data;
  },

  getAdminDashboardAnalytics: async (): Promise<AdminDashboardAnalytics> => {
    const response = await apiClient.get('/analytics/admin-dashboard/');
    return response.data;
  },

  getSectionHeadAnalytics: async (params?: RoleAnalyticsParams): Promise<SectionHeadAnalytics> => {
    const response = await apiClient.get('/analytics/section-head/', { params });
    return response.data;
  },

  getHODAnalytics: async (params?: RoleAnalyticsParams): Promise<HODAnalytics> => {
    const response = await apiClient.get('/analytics/hod/', { params });
    return response.data;
  },

  getManagerAnalytics: async (params?: RoleAnalyticsParams): Promise<ManagerAnalytics> => {
    const response = await apiClient.get('/analytics/manager/', { params });
    return response.data;
  },

  getOrganisationAnalytics: async (params?: { days?: number }): Promise<OrganisationAnalytics> => {
    const response = await apiClient.get('/analytics/organizational/', { params });
    return response.data;
  },
};

export default analyticsService;
