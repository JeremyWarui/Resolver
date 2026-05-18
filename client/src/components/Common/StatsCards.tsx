import { AlertTriangle, CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboard } from '@/contexts/AdminDashboardContext';
import StatCard from './StatCard';

interface StatsCardsProps {
  analyticsData?: any;
  loading?: boolean;
}

const StatsCards = ({ analyticsData, loading: externalLoading }: StatsCardsProps) => {
  // Get admin analytics from context
  const { data: dashboardData, loading: contextLoading } = useAdminDashboard();

  // Use provided analytics or fallback to context data
  const analytics = analyticsData || dashboardData?.analytics;
  const loading = externalLoading !== undefined ? externalLoading : contextLoading;

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

  const systemOverview = analytics?.system_overview;

  const totalCount      = systemOverview?.total ?? 0;
  const openCount       = systemOverview?.open ?? 0;
  const closedCount     = systemOverview?.closed ?? 0;
  const escalatedCount  = systemOverview?.escalated ?? 0;
  const overdueCount    = analytics?.overdue_tickets?.length ?? 0;
  const resolutionRate  = systemOverview?.resolution_rate_pct ?? 0;
  const newToday        = systemOverview?.new_24h ?? 0;
  const newThisMonth    = systemOverview?.new_30d ?? 0;
  const avgHours        = systemOverview?.avg_resolution_hours ?? null;

  return (
    <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-2'>
      <>
        <StatCard
          title="Total Tickets"
          value={totalCount}
          description="All tickets in system"
          icon={<FileText className='h-6 w-6 text-[#0078d4]' />}
          iconBgColor="bg-[#e5f2fc]"
          badge={{ value: `${newThisMonth} this month`, color: "blue" }}
          className="bg-white"
          isLoading={loading}
        />

        <StatCard
          title="Open Tickets"
          value={openCount}
          description="Awaiting assignment"
          icon={<AlertTriangle className='h-6 w-6 text-[#ca5010]' />}
          iconBgColor="bg-[#fcf0e5]"
          badge={{ value: openCount > 0 ? 'Active' : 'Clear', color: openCount > 0 ? "amber" : "green" }}
          className="bg-white"
          isLoading={loading}
        />

        <StatCard
          title="Resolved Tickets"
          value={closedCount}
          description={`${resolutionRate.toFixed(0)}% resolution rate`}
          icon={<CheckCircle className='h-6 w-6 text-[#107c10]' />}
          iconBgColor="bg-[#e5f9e5]"
          badge={{ value: `${resolutionRate.toFixed(0)}% rate`, color: resolutionRate > 70 ? "green" : "amber" }}
          className="bg-white"
          isLoading={loading}
        />

        <StatCard
          title="In Progress"
          value={escalatedCount}
          description={avgHours ? `Avg: ${avgHours.toFixed(0)}h resolution` : 'Being worked on'}
          icon={<Clock className='h-6 w-6 text-[#5c2d91]' />}
          iconBgColor="bg-[#f9f3ff]"
          badge={{ value: `${newToday} new today`, color: "purple" }}
          className="bg-white"
          isLoading={loading}
        />

        <StatCard
          title="Overdue Tickets"
          value={overdueCount}
          description={overdueCount > 0 ? 'Need immediate attention' : 'All on track'}
          icon={<AlertCircle className='h-6 w-6 text-[#d13438]' />}
          iconBgColor="bg-[#fde7e9]"
          badge={{ value: overdueCount > 0 ? `${overdueCount} overdue` : 'On track', color: overdueCount > 0 ? "red" : "green" }}
          className="bg-white"
          isLoading={loading}
        />
      </>
    </div>
  );
};

export default StatsCards;
