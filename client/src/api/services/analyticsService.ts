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
    const raw = response.data;

    // Backend returns system_overview with fields: total, open, closed, new_24h, new_7d, new_30d,
    // resolution_rate_pct, avg_resolution_hours, etc.
    // Frontend expects: total_tickets, open_tickets, resolved_tickets, new_tickets_24h, etc.
    const overview = raw.system_overview || {};
    const overdueRaw = raw.overdue_tickets;

    // Handle overdue_tickets: backend returns array directly
    const overdueTickets: AdminDashboardAnalytics['overdue_tickets'] = Array.isArray(overdueRaw)
      ? overdueRaw
      : (overdueRaw?.tickets ?? []);

    return {
      system_overview: {
        total_tickets: overview.total ?? 0,
        open_tickets: overview.open ?? 0,
        resolved_tickets: overview.closed ?? 0,
        resolution_rate: overview.resolution_rate_pct ?? 0,
        new_tickets_24h: overview.new_24h ?? 0,
        tickets_past_week: overview.new_7d ?? 0,
        tickets_past_month: overview.new_30d ?? 0,
        avg_resolution_time_hours: overview.avg_resolution_hours ?? null,
      },
      overdue_tickets: overdueTickets,
    };
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

  getUserAnalytics: async () => {
    const response = await apiClient.get('/analytics/user/');
    return response.data;
  },
};

export default analyticsService;
