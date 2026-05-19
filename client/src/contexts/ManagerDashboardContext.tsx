import { getManagerDashboard } from '@/api/services/managerService';
import { createDashboardContext } from './createDashboardContext';
import type { ManagerDashboard } from '@/types';

const { Context, Provider, useHook } = createDashboardContext<ManagerDashboard>({
  name: 'Manager',
  serviceFetcher: getManagerDashboard,
  defaultDays: 30,
});

export const ManagerDashboardContext = Context;
export const ManagerDashboardProvider = Provider;
export const useManagerDashboard = useHook;
