import { Button } from '@/components/ui/button';
import { Plus, Filter, AlertTriangle, Wrench, CheckCircle, Clock } from 'lucide-react';
import { useMemo } from 'react';
import PostedTicketsTable from './PostedTicketsTable';
import StatCard from '../Common/StatCard';
import useUserData from '@/hooks/users/useUserData';
import { useTickets } from '@/hooks/tickets';

// Define props to receive the section change function
interface UserTicketsProps {
  onNavigate?: (section: 'dashboard' | 'postedTickets' | 'userTickets' | 'submitTicket' | 'settings') => void;
}

// Create a dedicated component for user ticket stats
const UserStatsCards = ({ userId }: { userId: number }) => {
  // Fetch tickets directly for the specific user
  const { tickets, loading } = useTickets({ 
    raised_by: userId,
    page_size: 100,
    ordering: '-created_at',
  });

  // Calculate stats from actual ticket data
  const ticketStats = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        open: 0,
        assigned: 0,
        in_progress: 0,
        pending: 0,
        resolved: 0,
        closed: 0,
        total: 0,
      };
    }

    const stats = {
      open: 0,
      assigned: 0,
      in_progress: 0,
      pending: 0,
      resolved: 0,
      closed: 0,
      total: tickets.length,
    };

    tickets.forEach((ticket) => {
      const status = ticket.status.toLowerCase();
      if (status in stats) {
        stats[status as keyof typeof stats]++;
      }
    });

    return stats;
  }, [tickets]);

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
        value={ticketStats.open}
        description='Awaiting assignment'
        icon={<AlertTriangle className='h-6 w-6 text-[#ff8c00]' />}
        iconBgColor="bg-[#fff4e5]"
        className="bg-white"
      />

      <StatCard
        title="In Progress"
        value={ticketStats.in_progress + ticketStats.assigned}
        description='Being worked on'
        icon={<Wrench className='h-6 w-6 text-[#0078d4]' />}
        iconBgColor="bg-[#e5f2fc]"
        className="bg-white"
      />

      <StatCard
        title="Resolved"
        value={ticketStats.resolved}
        description='Successfully resolved'
        icon={<CheckCircle className='h-6 w-6 text-[#107c10]' />}
        iconBgColor="bg-[#e5f9e5]"
        className="bg-white"
      />

      <StatCard
        title="Pending"
        value={ticketStats.pending}
        description='Waiting for action'
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
