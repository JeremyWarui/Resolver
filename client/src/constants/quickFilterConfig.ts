import type { UserRole } from '@/types';
import { Filter, Inbox, AlertTriangle, CheckCircle, PlayCircle, ListTodo, Wrench, PauseCircle } from 'lucide-react';
import type { QuickFilterConfig } from '@/components/Common/GenericQuickFilterButtons';

export const QUICK_FILTER_CONFIG: Record<UserRole, QuickFilterConfig[]> = {
  admin: [
    {
      id: 'all',
      label: 'All Tickets',
      icon: ListTodo,
      colorClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
    {
      id: 'open',
      label: 'Open',
      icon: Inbox,
      colorClass: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    },
    {
      id: 'unassigned',
      label: 'Unassigned',
      icon: Filter,
      colorClass: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    },
    {
      id: 'overdue',
      label: 'Overdue',
      icon: AlertTriangle,
      colorClass: 'bg-red-100 text-red-700 hover:bg-red-200',
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      icon: PlayCircle,
      colorClass: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      icon: CheckCircle,
      colorClass: 'bg-green-100 text-green-700 hover:bg-green-200',
    },
  ],
  technician: [
    {
      id: 'all',
      label: 'All Tickets',
      icon: ListTodo,
      colorClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
    {
      id: 'assigned',
      label: 'New Work',
      icon: Inbox,
      description: 'Ready to start',
      colorClass: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    },
    {
      id: 'in_progress',
      label: 'Active Jobs',
      icon: Wrench,
      description: 'Working on it',
      colorClass: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    },
    {
      id: 'pending',
      label: 'On Hold',
      icon: PauseCircle,
      description: 'Need parts/help',
      colorClass: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    },
    {
      id: 'resolved',
      label: 'Finished',
      icon: CheckCircle,
      description: 'Work done',
      colorClass: 'bg-green-100 text-green-700 hover:bg-green-200',
    },
  ],
  // Other roles don't have quick filters yet
  user: [],
  head_of_section: [],
  hod: [],
  manager: [],
};
