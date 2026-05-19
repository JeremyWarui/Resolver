import { getAdminDashboard } from '@/api/services/adminService';
import { createDashboardContext } from './createDashboardContext';
import type { AdminDashboard } from '@/types';

const { Context, Provider, useHook } = createDashboardContext<AdminDashboard>({
  name: 'Admin',
  serviceFetcher: getAdminDashboard,
  defaultDays: 30,
});

export const AdminDashboardContext = Context;
export const AdminDashboardProvider = Provider;
export const useAdminDashboard = useHook;
