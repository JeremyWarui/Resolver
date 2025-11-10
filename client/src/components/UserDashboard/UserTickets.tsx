import { Button } from '@/components/ui/button';
import { Plus, Filter, AlertTriangle, Wrench, CheckCircle, Clock } from 'lucide-react';
import PostedTicketsTable from './PostedTicketsTable';
import StatCard from '../Common/StatCard';
import useUserData from '@/hooks/users/useUserData';
import useStats from '@/hooks/analytics/useStats';

// Define props to receive the section change function
interface UserTicketsProps {
  onNavigate?: (section: 'dashboard' | 'userTickets' | 'submitTicket' | 'settings') => void;
}

// Create a dedicated component for user ticket stats to optimize loading
const UserStatsCards = ({ userId }: { userId: number }) => {
  // Use dedicated hook that only fetches user-specific ticket stats
  const { ticketStats, loading } = useStats({ 
    user: userId,
    fetchTicketStats: true,
    fetchTechnicianStats: false,
  });

  // Create a skeleton loader for a stat card
  const SkeletonStatCard = () => (
    <div className="bg-white rounded-md shadow overflow-hidden">
      <div className="p-4 flex items-center">
        <div className="mr-6 ml-2">
          <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
        </div>
        <div className="w-full">
          <div className="h-4 w-24 mb-2 bg-gray-200 animate-pulse"></div>
          <div className="h-7 w-16 mb-2 bg-gray-200 animate-pulse"></div>
          <div className="h-3 w-32 bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // Show loading skeleton if data is loading
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
        description='Your open tickets'
        icon={<AlertTriangle className='h-6 w-6 text-[#0078d4]' />}
        iconBgColor="bg-[#e5f2fc]"
        className="bg-white"
      />

      <StatCard
        title="Assigned Tickets"
        value={ticketStats.assigned_tickets}
        description='Your assigned tickets'
        icon={<Wrench className='h-6 w-6 text-[#0078d4]' />}
        iconBgColor="bg-[#e5f2fc]"
        className="bg-white"
      />

      <StatCard
        title="Resolved Tickets"
        value={ticketStats.resolved_tickets}
        description='Your resolved tickets'
        icon={<CheckCircle className='h-6 w-6 text-[#107c10]' />}
        iconBgColor="bg-[#e5f9e5]"
        className="bg-white"
      />

      <StatCard
        title="Pending Tickets"
        value={ticketStats.pending_tickets || 0}
        description='Your pending tickets'
        icon={<Clock className='h-6 w-6 text-[#5c2d91]' />}
        iconBgColor="bg-[#f9f3ff]"
        className="bg-white"
      />
    </div>
  );
};

const UserTickets = ({ onNavigate }: UserTicketsProps) => {
  // Get current user data
  const { userData } = useUserData();
  const currentUserId = userData?.id || 1;

  return (
    <div className='flex-1 overflow-y-auto p-4 bg-gray-50'>
      <div className='flex justify-between mb-2'>
        <div>
          <p className='text-md text-gray-600'>
            All tickets raised by you
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
            size='sm'
            className='flex items-center gap-1 bg-[#0078d4] hover:bg-[#106ebe]'
            onClick={() => onNavigate && onNavigate('submitTicket')}
          >
            <Plus className='h-4 w-4' />
            New Ticket
          </Button>
        </div>
      </div>
      
      {/* Use dedicated user stats component with our new hook */}
      <UserStatsCards userId={currentUserId} />
      
      {/* Tickets table - Filter to show only current user's tickets */}
      <PostedTicketsTable currentUser={currentUserId} />
    </div>
  );
};

export default UserTickets;
