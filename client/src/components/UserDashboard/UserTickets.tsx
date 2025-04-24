import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import PostedTicketsTable from './PostedTicketsTable';
import StatsCards from '../Common/StatsCards';
import { useState } from 'react';
import { useGraphQLUserData } from '@/hooks/useGraphQLUserData';

// Define props to receive the section change function
interface UserTicketsProps {
  onNavigate?: (section: 'dashboard' | 'userTickets' | 'submitTicket' | 'settings') => void;
}

const UserTickets = ({ onNavigate }: UserTicketsProps) => {
  // State to control create ticket modal visibility
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  
  // Get current user data
  const { userData, loading: userLoading } = useGraphQLUserData();
  const currentUser = userData?.name || '';

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
      {/* Stats Cards - Filter to show only current user's tickets stats */}
      <StatsCards showTicketsStatsOnly currentUser={currentUser} />
      {/* Tickets table - Filter to show only current user's tickets */}
      <PostedTicketsTable currentUser={currentUser} />
    </div>
  );
};

export default UserTickets;
