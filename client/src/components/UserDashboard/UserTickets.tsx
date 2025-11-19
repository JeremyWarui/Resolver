import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import PostedTicketsTable from './PostedTicketsTable';
import useUserData from '@/hooks/users/useUserData';

// Define props to receive the section change function
interface UserTicketsProps {
  onNavigate?: (section: 'dashboard' | 'postedTickets' | 'userTickets' | 'submitTicket' | 'settings') => void;
}

const UserTickets = ({ onNavigate }: UserTicketsProps) => {
  // Get current user data
  const { userData } = useUserData();
  const currentUserId = userData?.id || 1;

  return (
    <div className='flex-1 overflow-y-auto p-4 bg-gray-50'>
      <div className='flex justify-between mb-4'>
        <div>
          <h2 className='text-2xl font-semibold text-gray-800 mb-1'>My Tickets</h2>
          <p className='text-sm text-gray-600'>
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
      
      {/* Tickets table - Filter to show only current user's tickets */}
      <PostedTicketsTable currentUser={currentUserId} />
    </div>
  );
};

export default UserTickets;
