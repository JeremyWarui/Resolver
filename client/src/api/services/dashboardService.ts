import apiClient from '@/api/client';

/**
 * Consolidated dashboard fetching service for all role types.
 * Previously split across 5 separate files (hodService, managerService, etc.)
 */

export const dashboardService = {
  /**
   * Fetch admin dashboard data
   */
  getAdminDashboard: async (days = 30) =>
    apiClient.get('/admin/me/dashboard/', { params: { days } }),

  /**
   * Fetch manager/director dashboard data
   */
  getManagerDashboard: async (days = 30) =>
    apiClient.get('/manager/me/dashboard/', { params: { days } }),

  /**
   * Fetch HOD (Head of Department) dashboard data
   */
  getHODDashboard: async (days = 30) =>
    apiClient.get('/hod/me/dashboard/', { params: { days } }),

  /**
   * Fetch section head dashboard data
   */
  getSectionHeadDashboard: async (days = 30) =>
    apiClient.get('/section-head/me/dashboard/', { params: { days } }),

  /**
   * Fetch technician dashboard data
   */
  getTechnicianDashboard: async () =>
    apiClient.get('/technicians/me/dashboard/'),

  /**
   * Fetch user dashboard data
   */
  getUserDashboard: async () =>
    apiClient.get('/user/me/dashboard/'),
};

// Export individual functions for backwards compatibility and named imports
export const getAdminDashboard = dashboardService.getAdminDashboard;
export const getManagerDashboard = dashboardService.getManagerDashboard;
export const getHODDashboard = dashboardService.getHODDashboard;
export const getSectionHeadDashboard = dashboardService.getSectionHeadDashboard;
export const getTechnicianDashboard = dashboardService.getTechnicianDashboard;
export const getUserDashboard = dashboardService.getUserDashboard;

export default dashboardService;
