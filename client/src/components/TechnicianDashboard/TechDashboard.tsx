import { Button } from '@/components/ui/button';
import { Filter, Download } from 'lucide-react';

// Import components
import TechTickets from './TechTickets';
import StatCard from '@/components/Common/StatCard';
import { Skeleton } from "@/components/ui/skeleton";

// Import icons
import { AlertCircle, Wrench, CheckCircle, Clock } from 'lucide-react';

// Import REST API hooks
import useStats from '@/hooks/analytics/useStats';
import useUserData from '@/hooks/users/useUserData';

const TechnicianDashboard = () => {
  // Get current user data
  const { userData, loading: userLoading } = useUserData();
  
  // Use REST API hook to fetch ticket stats for current technician
  const { ticketStats, loading: statsLoading } = useStats({ 
    user: userData?.id,
    fetchTicketStats: true,
    fetchTechnicianStats: false,
  });

  const loading = userLoading || statsLoading;

  // Skeleton loader for stat card
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

  // Stats cards component with real API data
  const TicketStatsCards = () => {
    if (loading) {
      return (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      );
    }

    return (
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-2'>
        <StatCard
          title="Open Tickets"
          value={ticketStats.open_tickets}
          description="Requires attention"
          icon={<AlertCircle className='h-6 w-6 text-[#0078d4]' />}
          iconBgColor="bg-[#e5f2fc]"
          className="bg-white"
          isLoading={loading}
        />

        <StatCard
          title="Assigned Tickets"
          value={ticketStats.assigned_tickets}
          description="Currently working"
          icon={<Wrench className='h-6 w-6 text-[#0078d4]' />}
          iconBgColor="bg-[#e5f2fc]"
          className="bg-white"
          isLoading={loading}
        />

        <StatCard
          title="Resolved"
          value={ticketStats.resolved_tickets}
          description="Completed work"
          icon={<CheckCircle className='h-6 w-6 text-[#107c10]' />}
          iconBgColor="bg-[#e5f9e5]"
          className="bg-white"
          isLoading={loading}
        />

        <StatCard
          title="Pending"
          value={ticketStats.pending_tickets}
          description="Awaiting resources"
          icon={<Clock className='h-6 w-6 text-[#5c2d91]' />}
          iconBgColor="bg-[#f9f3ff]"
          className="bg-white"
          isLoading={loading}
        />
      </div>
    );
  };

  return (
    <main className='flex-1 overflow-y-auto p-4 bg-gray-50 space-y-6'>
      <div className='flex justify-between mb-2'>
        <div>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Technician Dashboard
          </h2>
          <p className='text-sm text-gray-600'>
            Welcome back, {userLoading ? '...' : userData ? `${userData.first_name} ${userData.last_name}` : 'Technician'} 👋
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center gap-1'
          >
            <Filter className='h-4 w-4' />
            Filter
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center gap-1'
          >
            <Download className='h-4 w-4' />
            Export
          </Button>
        </div>
      </div>

      {/* Use real API stats component */}
      <TicketStatsCards />

      {/* Tickets Section - Only show open tickets on dashboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Open Tickets</h3>
        </div>
        
        {/* Tickets Table - Only show open tickets on dashboard */}
        <TechTickets defaultFilter="open" />
      </div>
    </main>
  );
};

export default TechnicianDashboard;
