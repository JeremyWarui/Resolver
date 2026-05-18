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
  const totalCount     = overview?.total ?? 0;
  const openCount      = overview?.open ?? 0;
  const closedCount    = overview?.closed ?? 0;
  const pendingCount   = overview?.pending ?? 0;
  const escalatedCount = overview?.escalated ?? 0;

  const stats: StatConfig[] = [
    {
      title: 'Total Tickets',
      value: totalCount,
      description: 'All campus tickets',
      icon: <FileText className="h-6 w-6 text-[#0078d4]" />,
      iconBgColor: 'bg-[#e5f2fc]',
      badge: { value: 'Campus', color: 'blue' },
    },
    {
      title: 'Open Tickets',
      value: openCount,
      description: 'Awaiting assignment',
      icon: <AlertTriangle className="h-6 w-6 text-[#ca5010]" />,
      iconBgColor: 'bg-[#fcf0e5]',
      badge: openCount > 0
        ? { value: 'Active', color: 'amber' }
        : { value: 'Clear', color: 'green' },
    },
    {
      title: 'Resolved',
      value: closedCount,
      description: 'Completed tickets',
      icon: <CheckCircle className="h-6 w-6 text-[#107c10]" />,
      iconBgColor: 'bg-[#e5f9e5]',
      badge: { value: closedCount > 0 ? 'Done' : 'None yet', color: closedCount > 0 ? 'green' : 'gray' },
    },
    {
      title: 'In Progress',
      value: pendingCount,
      description: 'Being worked on',
      icon: <AlertCircle className="h-6 w-6 text-[#d13438]" />,
      iconBgColor: 'bg-[#fde7e9]',
      badge: {
        value: pendingCount > 0 ? `${pendingCount} pending` : 'None',
        color: pendingCount > 0 ? 'amber' : 'green',
      },
    },
    {
      title: 'Escalated',
      value: escalatedCount,
      description: 'Flagged for review',
      icon: <Users className="h-6 w-6 text-[#5c2d91]" />,
      iconBgColor: 'bg-[#f9f3ff]',
      badge: escalatedCount > 0
        ? { value: 'Flagged', color: 'purple' }
        : { value: 'None', color: 'gray' },
    },
  ];

  return <RoleStatsGrid stats={stats} loading={loading} />;
};

export default HODStatsCards;
