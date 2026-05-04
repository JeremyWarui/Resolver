import { AlertTriangle, AlertCircle, FileText, CheckCircle, Users } from 'lucide-react';
import RoleStatsGrid from '@/components/Common/RoleStatsGrid';
import type { StatConfig } from '@/components/Common/RoleStatsGrid';
import type { HODAnalytics } from '@/types';

interface HODStatsCardsProps {
  data: HODAnalytics | null;
  loading: boolean;
}

const HODStatsCards = ({ data, loading }: HODStatsCardsProps) => {
  const overview = data?.overview;
  const resolvedCount = (data?.tech_performance ?? []).reduce((sum, t) => sum + t.resolved, 0);
  const overdueCount  = overview?.overdue_tickets ?? 0;

  const stats: StatConfig[] = [
    {
      title: 'Total Tickets',
      value: overview?.total_tickets ?? 0,
      description: 'All campus tickets',
      icon: <FileText className="h-6 w-6 text-[#0078d4]" />,
      iconBgColor: 'bg-[#e5f2fc]',
      badge: { value: 'Campus', color: 'blue' },
    },
    {
      title: 'Open Tickets',
      value: overview?.open_tickets ?? 0,
      description: 'Awaiting assignment',
      icon: <AlertTriangle className="h-6 w-6 text-[#ca5010]" />,
      iconBgColor: 'bg-[#fcf0e5]',
      badge: overview && overview.open_tickets > 0
        ? { value: 'Active', color: 'amber' }
        : { value: 'Clear', color: 'green' },
    },
    {
      title: 'Resolved',
      value: resolvedCount,
      description: 'Closed by technicians',
      icon: <CheckCircle className="h-6 w-6 text-[#107c10]" />,
      iconBgColor: 'bg-[#e5f9e5]',
      badge: { value: resolvedCount > 0 ? 'Done' : 'None yet', color: resolvedCount > 0 ? 'green' : 'gray' },
    },
    {
      title: 'Overdue',
      value: overdueCount,
      description: overdueCount > 0 ? 'Need immediate attention' : 'All on track',
      icon: <AlertCircle className="h-6 w-6 text-[#d13438]" />,
      iconBgColor: 'bg-[#fde7e9]',
      badge: {
        value: overdueCount > 0 ? `${overdueCount} overdue` : 'On track',
        color: overdueCount > 0 ? 'red' : 'green',
      },
    },
    {
      title: 'Escalated',
      value: overview?.escalated_tickets ?? 0,
      description: 'Flagged for review',
      icon: <Users className="h-6 w-6 text-[#5c2d91]" />,
      iconBgColor: 'bg-[#f9f3ff]',
      badge: overview && overview.escalated_tickets > 0
        ? { value: 'Flagged', color: 'purple' }
        : { value: 'None', color: 'gray' },
    },
  ];

  return <RoleStatsGrid stats={stats} loading={loading} />;
};

export default HODStatsCards;
