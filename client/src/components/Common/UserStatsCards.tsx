import { FileText, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import RoleStatsGrid from './RoleStatsGrid';
import type { StatConfig } from './RoleStatsGrid';
import { useTicketAnalytics } from '@/hooks/analytics';

interface UserStatsCardsProps {
  userId?: number;
}

const UserStatsCards = ({ userId }: UserStatsCardsProps) => {
  const { data, loading: analyticsLoading } = useTicketAnalytics(
    userId !== undefined ? { raised_by: userId } : undefined
  );

  // Treat no userId as loading — prevents system-wide data flashing before user is known
  const loading = analyticsLoading || userId === undefined;

  const getCount = (status: string) =>
    data?.status_counts?.find(s => s.status === status)?.count ?? 0;

  const total      = userId !== undefined ? (data?.ticket_counts?.count ?? 0) : 0;
  const open       = getCount('open');
  const inProgress = getCount('in_progress') + getCount('assigned');
  const resolved   = getCount('resolved');

  const stats: StatConfig[] = [
    {
      title: 'My Tickets',
      value: total,
      description: 'All tickets raised by you',
      icon: <FileText className="h-6 w-6 text-[#0078d4]" />,
      iconBgColor: 'bg-[#e5f2fc]',
      badge: { value: 'Total', color: 'blue' },
    },
    {
      title: 'Open',
      value: open,
      description: 'Awaiting assignment',
      icon: <AlertTriangle className="h-6 w-6 text-[#ca5010]" />,
      iconBgColor: 'bg-[#fcf0e5]',
      badge: open > 0 ? { value: 'Active', color: 'amber' } : { value: 'None', color: 'gray' },
    },
    {
      title: 'In Progress',
      value: inProgress,
      description: 'Being worked on',
      icon: <Clock className="h-6 w-6 text-[#5c2d91]" />,
      iconBgColor: 'bg-[#f9f3ff]',
      badge: inProgress > 0 ? { value: 'Active', color: 'purple' } : { value: 'None', color: 'gray' },
    },
    {
      title: 'Resolved',
      value: resolved,
      description: 'Successfully closed',
      icon: <CheckCircle className="h-6 w-6 text-[#107c10]" />,
      iconBgColor: 'bg-[#e5f9e5]',
      badge: { value: resolved > 0 ? 'Done' : 'None yet', color: resolved > 0 ? 'green' : 'gray' },
    },
  ];

  return <RoleStatsGrid stats={stats} loading={loading} />;
};

export default UserStatsCards;
