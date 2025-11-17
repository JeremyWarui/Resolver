import { AlertTriangle, CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAnalytics } from '@/hooks/analytics';
import StatCard from './StatCard';

const StatsCards = () => {
  // Use admin analytics hook to fetch real data from backend
  const { data: analytics, loading } = useAdminAnalytics();

  // Create a skeleton loader for a stat card
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
  
  // Determine how many cards to show in loading state
  const loadingCardsCount = 5; // 5 ticket stat cards for admin (including overdue)
  
  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-2'>
        {Array.from({ length: loadingCardsCount }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    );
  }

  // Extract system overview data after loading
  const systemOverview = analytics?.system_overview;

  // Create ticket stats component with real data from backend
  const TicketStats = () => {
    // Calculate in-progress tickets (assigned + in_progress status)
    const inProgressTickets = systemOverview 
      ? systemOverview.total_tickets - systemOverview.open_tickets - systemOverview.resolved_tickets
      : 0;

    // Calculate percentage changes (you can enhance this with historical data)
    const resolutionRate = systemOverview?.resolution_rate || 0;
    const newTickets24h = systemOverview?.new_tickets_24h || 0;
    const ticketsThisWeek = systemOverview?.tickets_past_week || 0;
    const ticketsThisMonth = systemOverview?.tickets_past_month || 0;
    const overdueCount = analytics?.overdue_tickets?.length || 0;

    return (
      <>
        <StatCard
          title="Total Tickets"
          value={systemOverview?.total_tickets || 0}
          description="All tickets in system"
          icon={<FileText className='h-6 w-6 text-[#0078d4]' />}
          iconBgColor="bg-[#e5f2fc]"
          badge={{ 
            value: `${ticketsThisMonth} this month`, 
            color: "blue" 
          }}
          className="bg-white"
          isLoading={loading}
        />

        <StatCard
          title="Open Tickets"
          value={systemOverview?.open_tickets || 0}
          description="Awaiting assignment"
          icon={<AlertTriangle className='h-6 w-6 text-[#ca5010]' />}
          iconBgColor="bg-[#fcf0e5]"
          badge={{ 
            value: `${ticketsThisWeek} this week`, 
            color: "amber" 
          }}
          className="bg-white"
          isLoading={loading}
        />

        <StatCard
          title="Resolved Tickets"
          value={systemOverview?.resolved_tickets || 0}
          description={`${resolutionRate.toFixed(0)}% resolution rate`}
          icon={<CheckCircle className='h-6 w-6 text-[#107c10]' />}
          iconBgColor="bg-[#e5f9e5]"
          badge={{ 
            value: `${resolutionRate.toFixed(0)}% rate`, 
            color: resolutionRate > 70 ? "green" : "amber"
          }}
          className="bg-white"
          isLoading={loading}
        />

        <StatCard
          title="In Progress"
          value={inProgressTickets}
          description={systemOverview?.avg_resolution_time_hours 
            ? `Avg: ${systemOverview.avg_resolution_time_hours.toFixed(0)}h resolution` 
            : 'Being worked on'}
          icon={<Clock className='h-6 w-6 text-[#5c2d91]' />}
          iconBgColor="bg-[#f9f3ff]"
          badge={{ 
            value: `${newTickets24h} new today`, 
            color: "purple"
          }}
          className="bg-white"
          isLoading={loading}
        />

        <StatCard
          title="Overdue Tickets"
          value={overdueCount}
          description={overdueCount > 0 ? 'Need immediate attention' : 'All on track'}
          icon={<AlertCircle className='h-6 w-6 text-[#d13438]' />}
          iconBgColor="bg-[#fde7e9]"
          badge={{ 
            value: overdueCount > 0 ? `${overdueCount} overdue` : 'On track', 
            color: overdueCount > 0 ? "red" : "green"
          }}
          className="bg-white"
          isLoading={loading}
        />
      </>
    );
  };

  return (
    <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-2'>
      <TicketStats />
    </div>
  );
};

export default StatsCards;
