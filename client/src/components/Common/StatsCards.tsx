import { AlertTriangle, Wrench, CheckCircle, Clock, Users, UserCheck, UserX } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
// Import GraphQL hook instead of service
import useGraphQLStats from '@/hooks/useGraphQLStats';
import StatCard from './StatCard';

// Define props interface for the component
interface StatsCardsProps {
  showTechnicianStatsOnly?: boolean;
  showTicketsStatsOnly?: boolean;
  currentUser?: string;
}

const StatsCards = ({ 
  showTechnicianStatsOnly = false, 
  showTicketsStatsOnly = false,
  currentUser = null
}: StatsCardsProps) => {
  // Use GraphQL hook to fetch stats data, passing the currentUser for filtering if provided
  const { ticketStats, technicianStats, loading } = useGraphQLStats({ 
    user: currentUser 
  });

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
  
  // Determine how many cards to show in loading state based on which stats to display
  const loadingCardsCount = showTechnicianStatsOnly ? 4 : (showTicketsStatsOnly ? 4 : 8);
  
  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-2'>
        {Array.from({ length: loadingCardsCount }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    );
  }

  // Create separate technician stats component
  const TechnicianStats = () => (
    <>
      <StatCard
        title="Total Technicians"
        value={technicianStats.total}
        description="Registered technicians"
        icon={<Users className='h-6 w-6 text-[#0078d4]' />}
        iconBgColor="bg-[#e5f2fc]"
        className="bg-white"
        isLoading={loading}
      />

      <StatCard
        title="Available"
        value={technicianStats.available}
        description="Ready for assignment"
        icon={<UserCheck className='h-6 w-6 text-[#107c10]' />}
        iconBgColor="bg-[#e5f9e5]"
        badge={{ 
          value: "+8%", 
          color: "blue" 
        }}
        className="bg-white"
        isLoading={loading}
      />

      <StatCard
        title="Busy"
        value={technicianStats.busy}
        description="Currently working"
        icon={<Clock className='h-6 w-6 text-[#ca5010]' />}
        iconBgColor="bg-[#fcf0e5]"
        badge={{ 
          value: "+12%", 
          color: "amber" 
        }}
        className="bg-white"
        isLoading={loading}
      />

      <StatCard
        title="Off Duty"
        value={technicianStats.offDuty}
        description="Not available"
        icon={<UserX className='h-6 w-6 text-[#797775]' />}
        iconBgColor="bg-[#f5f5f5]"
        badge={{ 
          value: "-5%", 
          color: "red" 
        }}
        className="bg-white"
        isLoading={loading}
      />
    </>
  );

  // Create separate ticket stats component
  const TicketStats = () => (
    <>
      <StatCard
        title="Open Tickets"
        value={ticketStats.openTickets}
        description={currentUser ? 'Your open tickets' : 'Requires attention'}
        icon={<AlertTriangle className='h-6 w-6 text-[#0078d4]' />}
        iconBgColor="bg-[#e5f2fc]"
        badge={{ 
          value: "+12%", 
          color: "amber" 
        }}
        className="bg-white"
        isLoading={loading}
      />

      <StatCard
        title="Assigned Tickets"
        value={ticketStats.assignedTickets}
        description={currentUser ? 'Your assigned tickets' : 'In progress'}
        icon={<Wrench className='h-6 w-6 text-[#0078d4]' />}
        iconBgColor="bg-[#e5f2fc]"
        badge={{ 
          value: "+8%", 
          color: "blue" 
        }}
        className="bg-white"
        isLoading={loading}
      />

      <StatCard
        title="Resolved Tickets"
        value={ticketStats.resolvedTickets}
        description={currentUser ? 'Your resolved tickets' : 'This month'}
        icon={<CheckCircle className='h-6 w-6 text-[#107c10]' />}
        iconBgColor="bg-[#e5f9e5]"
        badge={{ 
          value: "+24%", 
          color: "green" 
        }}
        className="bg-white"
        isLoading={loading}
      />

      <StatCard
        title="Pending Tickets"
        value={ticketStats.pendingTickets || 0}
        description={currentUser ? 'Your pending tickets' : 'Awaiting parts/approval'}
        icon={<Clock className='h-6 w-6 text-[#5c2d91]' />}
        iconBgColor="bg-[#f9f3ff]"
        badge={{ 
          value: "-5%", 
          color: "red" 
        }}
        className="bg-white"
        isLoading={loading}
      />
    </>
  );

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-2'>
      {/* Conditional rendering based on props */}
      {!showTicketsStatsOnly && <TechnicianStats />}
      {!showTechnicianStatsOnly && <TicketStats />}
    </div>
  );
};

export default StatsCards;
