import { AlertTriangle, CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useManagerDashboard } from '@/contexts/ManagerDashboardContext';
import StatCard from '@/components/Common/StatCard';

interface ManagerStatsCardsProps {
  analyticsData?: any;
  loading?: boolean;
}

const ManagerStatsCards = ({ analyticsData, loading: externalLoading }: ManagerStatsCardsProps) => {
  // Get manager analytics from context
  const { data: dashboardData, loading: contextLoading } = useManagerDashboard();

  // Use provided analytics or fallback to context data
  const analytics = analyticsData || dashboardData;
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

  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    );
  }

  // Extract overview data after loading
  const overview = analytics?.overview;

  const totalCount = overview?.total ?? 0;
  const openCount = overview?.open ?? 0;
  const closedCount = overview?.closed ?? 0;
  const pendingCount = overview?.pending ?? 0;
  const escalatedCount = overview?.escalated ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
      <StatCard
        title="Total Tickets"
        value={totalCount}
        description="All department tickets"
        icon={<FileText className="h-6 w-6 text-[#0078d4]" />}
        iconBgColor="bg-[#e5f2fc]"
        badge={{
          value: 'All',
          color: 'blue',
        }}
        className="bg-white"
        isLoading={loading}
      />

      <StatCard
        title="Open Tickets"
        value={openCount}
        description="Awaiting assignment"
        icon={<AlertTriangle className="h-6 w-6 text-[#ca5010]" />}
        iconBgColor="bg-[#fcf0e5]"
        badge={
          openCount > 0
            ? { value: 'Active', color: 'amber' }
            : { value: 'Clear', color: 'green' }
        }
        className="bg-white"
        isLoading={loading}
      />

      <StatCard
        title="Resolved Tickets"
        value={closedCount}
        description={closedCount > 0 ? 'Completed' : 'None yet'}
        icon={<CheckCircle className="h-6 w-6 text-[#107c10]" />}
        iconBgColor="bg-[#e5f9e5]"
        badge={{
          value: closedCount > 0 ? 'Complete' : 'Pending',
          color: closedCount > 0 ? 'green' : 'gray',
        }}
        className="bg-white"
        isLoading={loading}
      />

      <StatCard
        title="In Progress"
        value={pendingCount}
        description="Being worked on"
        icon={<Clock className="h-6 w-6 text-[#5c2d91]" />}
        iconBgColor="bg-[#f9f3ff]"
        badge={{
          value: pendingCount > 0 ? `${pendingCount} pending` : 'None',
          color: pendingCount > 0 ? 'purple' : 'gray',
        }}
        className="bg-white"
        isLoading={loading}
      />

      <StatCard
        title="Escalated"
        value={escalatedCount}
        description={escalatedCount > 0 ? 'Flagged issues' : 'All clear'}
        icon={<AlertCircle className="h-6 w-6 text-[#d13438]" />}
        iconBgColor="bg-[#fde7e9]"
        badge={
          escalatedCount > 0
            ? { value: 'Needs Review', color: 'red' }
            : { value: 'None', color: 'gray' }
        }
        className="bg-white"
        isLoading={loading}
      />
    </div>
  );
};

export default ManagerStatsCards;
