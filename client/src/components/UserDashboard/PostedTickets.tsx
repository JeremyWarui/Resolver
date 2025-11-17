import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import PostedTicketsTable from './PostedTicketsTable';

// Define props to receive the section change function
interface PostedTicketsProps {
  onNavigate?: (section: 'dashboard' | 'postedTickets' | 'userTickets' | 'submitTicket' | 'settings') => void;
}

const PostedTickets = ({ onNavigate: _onNavigate }: PostedTicketsProps) => {
  return (
    <div className='flex-1 overflow-y-auto p-4 bg-gray-50'>
      <div className='flex justify-between mb-4'>
        <div>
          <h2 className='text-2xl font-semibold text-gray-800 mb-1'>Posted Tickets</h2>
          <p className='text-sm text-gray-600'>
            View all tickets in the system (read-only)
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* All tickets table - view only, no currentUser filter */}
      <PostedTicketsTable viewOnly={true} />
    </div>
  );
};

export default PostedTickets;
