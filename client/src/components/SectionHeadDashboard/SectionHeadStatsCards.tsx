import { AlertTriangle, AlertCircle, Clock, FileText, CheckCircle } from 'lucide-react';
import RoleStatsGrid from '@/components/Common/RoleStatsGrid';
import type { StatConfig } from '@/components/Common/RoleStatsGrid';
import type { SectionHeadAnalytics } from '@/types';

interface SectionHeadStatsCardsProps {
  data: SectionHeadAnalytics | null;
  loading: boolean;
}

const SectionHeadStatsCards = ({ data, loading }: SectionHeadStatsCardsProps) => {
  const overview = data?.overview;

  const getStatusCount = (status: string) =>
    data?.status_distribution?.find(s => s.status === status)?.count ?? 0;

  const resolvedCount   = getStatusCount('resolved');
  const inProgressCount = getStatusCount('in_progress') + getStatusCount('assigned');
  const overdueCount    = overview?.overdue_tickets ?? 0;

  const stats: StatConfig[] = [
    {
      title: 'Total Tickets',
      value: overview?.total_tickets ?? 0,
      description: 'All section tickets',
      icon: <FileText className="h-6 w-6 text-[#0078d4]" />,
      iconBgColor: 'bg-[#e5f2fc]',
      badge: { value: 'Section', color: 'blue' },
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
      description: overview?.avg_resolution_hours
        ? `Avg: ${overview.avg_resolution_hours.toFixed(0)}h resolution`
        : 'Successfully closed',
      icon: <CheckCircle className="h-6 w-6 text-[#107c10]" />,
      iconBgColor: 'bg-[#e5f9e5]',
      badge: { value: resolvedCount > 0 ? 'Done' : 'None yet', color: resolvedCount > 0 ? 'green' : 'gray' },
    },
    {
      title: 'In Progress',
      value: inProgressCount,
      description: 'Currently being worked on',
      icon: <Clock className="h-6 w-6 text-[#5c2d91]" />,
      iconBgColor: 'bg-[#f9f3ff]',
      badge: inProgressCount > 0
        ? { value: 'Active', color: 'purple' }
        : { value: 'None', color: 'gray' },
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
  ];

  return <RoleStatsGrid stats={stats} loading={loading} />;
};

export default SectionHeadStatsCards;
