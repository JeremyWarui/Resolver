import RoleStatsGrid from '@/components/Common/RoleStatsGrid';
import type { StatConfig } from '@/components/Common/RoleStatsGrid';
import { Inbox, Wrench, PauseCircle, CheckCircle } from 'lucide-react';

interface TechnicianStatsCardsProps {
  counts: {
    all?: number;
    assigned?: number;
    in_progress?: number;
    pending?: number;
    resolved?: number;
  };
  loading?: boolean;
  onCardClick?: (id: string) => void;
}

export default function TechnicianStatsCards({
  counts,
  loading = false,
  onCardClick
}: TechnicianStatsCardsProps) {
  const stats: StatConfig[] = [
    {
      id: 'assigned',
      title: 'New Work',
      value: counts.assigned || 0,
      description: 'Ready to start',
      icon: <Inbox className="h-6 w-6 text-[#0078d4]" />,
      iconBgColor: 'bg-[#e5f2fc]',
    },
    {
      id: 'in_progress',
      title: 'Active Jobs',
      value: counts.in_progress || 0,
      description: 'Working on it',
      icon: <Wrench className="h-6 w-6 text-[#5c2d91]" />,
      iconBgColor: 'bg-[#f9f3ff]',
    },
    {
      id: 'pending',
      title: 'On Hold',
      value: counts.pending || 0,
      description: 'Need parts/help',
      icon: <PauseCircle className="h-6 w-6 text-[#d83b01]" />,
      iconBgColor: 'bg-[#fef6f2]',
    },
    {
      id: 'resolved',
      title: 'Finished',
      value: counts.resolved || 0,
      description: 'Work done',
      icon: <CheckCircle className="h-6 w-6 text-[#107c10]" />,
      iconBgColor: 'bg-[#e5f9e5]',
    },
  ];

  return (
    <RoleStatsGrid
      stats={stats}
      loading={loading}
      onCardClick={onCardClick}
      gridClassName="grid-cols-2 md:grid-cols-4 gap-3 mb-4"
    />
  );
}
