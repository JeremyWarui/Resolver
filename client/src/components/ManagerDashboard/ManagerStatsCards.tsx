import { AlertTriangle, CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import RoleStatsGrid from '@/components/Common/RoleStatsGrid';
import type { StatConfig } from '@/components/Common/RoleStatsGrid';
import { useManagerDashboard } from '@/contexts/ManagerDashboardContext';

interface ManagerStatsCardsProps {
  analyticsData?: any;
  loading?: boolean;
}

const ManagerStatsCards = ({ analyticsData, loading: externalLoading }: ManagerStatsCardsProps) => {
  const { data: dashboardData, loading: contextLoading } = useManagerDashboard();
  const analytics = analyticsData || dashboardData;
  const loading = externalLoading !== undefined ? externalLoading : contextLoading;

  const overview = analytics?.overview;
  const totalCount = overview?.total ?? 0;
  const openCount = overview?.open ?? 0;
  const closedCount = overview?.closed ?? 0;
  const pendingCount = overview?.pending ?? 0;
  const escalatedCount = overview?.escalated ?? 0;

  const stats: StatConfig[] = [
    {
      title: 'Total Tickets',
      value: totalCount,
      description: 'All department tickets',
      icon: <FileText className="h-6 w-6 text-[#0078d4]" />,
      iconBgColor: 'bg-[#e5f2fc]',
      badge: { value: 'All', color: 'blue' },
    },
    {
      title: 'Open Tickets',
      value: openCount,
      description: 'Awaiting assignment',
      icon: <AlertTriangle className="h-6 w-6 text-[#ca5010]" />,
      iconBgColor: 'bg-[#fcf0e5]',
      badge: openCount > 0 ? { value: 'Active', color: 'amber' } : { value: 'Clear', color: 'green' },
    },
    {
      title: 'Resolved',
      value: closedCount,
      description: closedCount > 0 ? 'Completed' : 'None yet',
      icon: <CheckCircle className="h-6 w-6 text-[#107c10]" />,
      iconBgColor: 'bg-[#e5f9e5]',
      badge: { value: closedCount > 0 ? 'Done' : 'Pending', color: closedCount > 0 ? 'green' : 'gray' },
    },
    {
      title: 'In Progress',
      value: pendingCount,
      description: 'Being worked on',
      icon: <Clock className="h-6 w-6 text-[#5c2d91]" />,
      iconBgColor: 'bg-[#f9f3ff]',
      badge: { value: pendingCount > 0 ? `${pendingCount} pending` : 'None', color: pendingCount > 0 ? 'purple' : 'gray' },
    },
    {
      title: 'Escalated',
      value: escalatedCount,
      description: escalatedCount > 0 ? 'Flagged issues' : 'All clear',
      icon: <AlertCircle className="h-6 w-6 text-[#d13438]" />,
      iconBgColor: 'bg-[#fde7e9]',
      badge: escalatedCount > 0 ? { value: 'Needs Review', color: 'red' } : { value: 'None', color: 'gray' },
    },
  ];

  return <RoleStatsGrid stats={stats} loading={loading} />;
};

export default ManagerStatsCards;
