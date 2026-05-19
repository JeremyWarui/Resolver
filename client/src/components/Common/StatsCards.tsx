import { AlertTriangle, CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import RoleStatsGrid from './RoleStatsGrid';
import type { StatConfig } from './RoleStatsGrid';
import { useAdminDashboard } from '@/contexts/AdminDashboardContext';

interface StatsCardsProps {
  analyticsData?: any;
  loading?: boolean;
}

const StatsCards = ({ analyticsData, loading: externalLoading }: StatsCardsProps) => {
  const { data: dashboardData, loading: contextLoading } = useAdminDashboard();
  const analytics = analyticsData || dashboardData?.analytics;
  const loading = externalLoading !== undefined ? externalLoading : contextLoading;

  const systemOverview = analytics?.system_overview;
  const totalCount = systemOverview?.total ?? 0;
  const openCount = systemOverview?.open ?? 0;
  const closedCount = systemOverview?.closed ?? 0;
  const escalatedCount = systemOverview?.escalated ?? 0;
  const overdueCount = analytics?.overdue_tickets?.length ?? 0;
  const resolutionRate = systemOverview?.resolution_rate_pct ?? 0;
  const newToday = systemOverview?.new_24h ?? 0;
  const newThisMonth = systemOverview?.new_30d ?? 0;
  const avgHours = systemOverview?.avg_resolution_hours ?? null;

  const stats: StatConfig[] = [
    {
      title: 'Total Tickets',
      value: totalCount,
      description: 'All tickets in system',
      icon: <FileText className="h-6 w-6 text-[#0078d4]" />,
      iconBgColor: 'bg-[#e5f2fc]',
      badge: { value: `${newThisMonth} this month`, color: 'blue' },
    },
    {
      title: 'Open Tickets',
      value: openCount,
      description: 'Awaiting assignment',
      icon: <AlertTriangle className="h-6 w-6 text-[#ca5010]" />,
      iconBgColor: 'bg-[#fcf0e5]',
      badge: { value: openCount > 0 ? 'Active' : 'Clear', color: openCount > 0 ? 'amber' : 'green' },
    },
    {
      title: 'Resolved Tickets',
      value: closedCount,
      description: `${resolutionRate.toFixed(0)}% resolution rate`,
      icon: <CheckCircle className="h-6 w-6 text-[#107c10]" />,
      iconBgColor: 'bg-[#e5f9e5]',
      badge: { value: `${resolutionRate.toFixed(0)}% rate`, color: resolutionRate > 70 ? 'green' : 'amber' },
    },
    {
      title: 'In Progress',
      value: escalatedCount,
      description: avgHours ? `Avg: ${avgHours.toFixed(0)}h resolution` : 'Being worked on',
      icon: <Clock className="h-6 w-6 text-[#5c2d91]" />,
      iconBgColor: 'bg-[#f9f3ff]',
      badge: { value: `${newToday} new today`, color: 'purple' },
    },
    {
      title: 'Overdue Tickets',
      value: overdueCount,
      description: overdueCount > 0 ? 'Need immediate attention' : 'All on track',
      icon: <AlertCircle className="h-6 w-6 text-[#d13438]" />,
      iconBgColor: 'bg-[#fde7e9]',
      badge: { value: overdueCount > 0 ? `${overdueCount} overdue` : 'On track', color: overdueCount > 0 ? 'red' : 'green' },
    },
  ];

  return <RoleStatsGrid stats={stats} loading={loading} />;
};

export default StatsCards;
