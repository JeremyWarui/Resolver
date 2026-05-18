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

  const totalCount     = overview?.total ?? 0;
  const openCount      = overview?.open ?? 0;
  const closedCount    = overview?.closed ?? 0;
  const inProgressCount = overview?.in_progress ?? 0;
  const escalatedCount = overview?.escalated ?? 0;

  const stats: StatConfig[] = [
    {
      title: 'Total Tickets',
      value: totalCount,
      description: 'All section tickets',
      icon: <FileText className="h-6 w-6 text-[#0078d4]" />,
      iconBgColor: 'bg-[#e5f2fc]',
      badge: { value: 'Section', color: 'blue' },
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
      description: overview?.avg_resolution_hours
        ? `Avg: ${overview.avg_resolution_hours.toFixed(0)}h resolution`
        : 'Successfully closed',
      icon: <CheckCircle className="h-6 w-6 text-[#107c10]" />,
      iconBgColor: 'bg-[#e5f9e5]',
      badge: { value: closedCount > 0 ? 'Done' : 'None yet', color: closedCount > 0 ? 'green' : 'gray' },
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
      title: 'Escalated',
      value: escalatedCount,
      description: escalatedCount > 0 ? 'Flagged for review' : 'All on track',
      icon: <AlertCircle className="h-6 w-6 text-[#d13438]" />,
      iconBgColor: 'bg-[#fde7e9]',
      badge: {
        value: escalatedCount > 0 ? `${escalatedCount} escalated` : 'On track',
        color: escalatedCount > 0 ? 'red' : 'green',
      },
    },
  ];

  return <RoleStatsGrid stats={stats} loading={loading} />;
};

export default SectionHeadStatsCards;
