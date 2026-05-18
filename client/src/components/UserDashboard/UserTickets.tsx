import { Button } from '@/components/ui/button';
import { Plus, ListTodo, FolderOpen, Wrench, PauseCircle, CheckCircle } from 'lucide-react';
import PostedTicketsTable from './PostedTicketsTable';
import UserStatsCards from '@/components/Common/UserStatsCards';
import QuickFilterPills from '@/components/Common/QuickFilterPills';
import type { FilterPill } from '@/components/Common/QuickFilterPills';
import { useUserDashboard } from '@/contexts/UserDashboardContext';
import { useState } from 'react';

interface UserTicketsProps {
  onNavigate?: (section: 'dashboard' | 'userTickets' | 'submitTicket' | 'settings') => void;
}

const STATUS_PILLS: readonly FilterPill[] = [
  { id: 'all',         label: 'All Tickets', icon: ListTodo,    colorClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  { id: 'open',        label: 'Open',        icon: FolderOpen,  colorClass: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { id: 'in_progress', label: 'In Progress', icon: Wrench,      colorClass: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { id: 'pending',     label: 'On Hold',     icon: PauseCircle, colorClass: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  { id: 'resolved',    label: 'Resolved',    icon: CheckCircle, colorClass: 'bg-green-100 text-green-700 hover:bg-green-200' },
];

const UserTickets = ({ onNavigate }: UserTicketsProps) => {
  const { userTickets, setUserTickets } = useUserDashboard();
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="flex justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">My Tickets</h1>
          <p className="text-sm text-gray-600">All tickets raised by you</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            className="flex items-center gap-1 bg-[#0078d4] hover:bg-[#106ebe]"
            onClick={() => onNavigate?.('submitTicket')}
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      <UserStatsCards />

      <QuickFilterPills
        filters={STATUS_PILLS}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      <PostedTicketsTable
        statusFilter={statusFilter}
        initialData={userTickets ?? undefined}
        onDataFetched={setUserTickets}
      />
    </div>
  );
};

export default UserTickets;
