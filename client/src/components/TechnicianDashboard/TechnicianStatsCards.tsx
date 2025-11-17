import StatCard from '@/components/Common/StatCard';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Inbox, 
  Wrench, 
  PauseCircle, 
  CheckCircle 
} from 'lucide-react';

interface TechnicianStatsCardsProps {
  counts: {
    all?: number;
    assigned?: number;
    in_progress?: number;
    pending?: number;
    resolved?: number;
  };
  loading?: boolean;
  onCardClick?: (filter: 'assigned' | 'in_progress' | 'pending' | 'resolved') => void;
}

const SkeletonStatCard = () => (
  <div className="bg-white rounded-md shadow overflow-hidden">
    <div className="p-4 flex items-center">
      <div className="mr-6 ml-2">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <div className="w-full">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-7 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  </div>
);

export default function TechnicianStatsCards({ 
  counts, 
  loading = false,
  onCardClick 
}: TechnicianStatsCardsProps) {
  
  if (loading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'assigned' as const,
      title: "New Work",
      value: counts.assigned || 0,
      description: "Ready to start",
      icon: <Inbox className='h-6 w-6 text-[#0078d4]' />,
      iconBgColor: "bg-[#e5f2fc]",
    },
    {
      id: 'in_progress' as const,
      title: "Active Jobs",
      value: counts.in_progress || 0,
      description: "Working on it",
      icon: <Wrench className='h-6 w-6 text-[#5c2d91]' />,
      iconBgColor: "bg-[#f9f3ff]",
    },
    {
      id: 'pending' as const,
      title: "On Hold",
      value: counts.pending || 0,
      description: "Need parts/help",
      icon: <PauseCircle className='h-6 w-6 text-[#d83b01]' />,
      iconBgColor: "bg-[#fef6f2]",
    },
    {
      id: 'resolved' as const,
      title: "Finished",
      value: counts.resolved || 0,
      description: "Work done",
      icon: <CheckCircle className='h-6 w-6 text-[#107c10]' />,
      iconBgColor: "bg-[#e5f9e5]",
    },
  ];

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-4'>
      {cards.map((card) => (
        <div 
          key={card.id}
          onClick={() => onCardClick?.(card.id)}
          className={onCardClick ? 'cursor-pointer' : ''}
        >
          <StatCard
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            iconBgColor={card.iconBgColor}
            className="bg-white hover:shadow-md transition-shadow"
            isLoading={loading}
          />
        </div>
      ))}
    </div>
  );
}
