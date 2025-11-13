import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, User, UserPlus, Building2, Wrench } from 'lucide-react';
import { getRelativeTime } from '@/utils/date';
import type { ColumnDef } from '@tanstack/react-table';
import type { OverdueTicket, Ticket } from '@/types';

// Shared utility functions
export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800 border-blue-200',
    assigned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
    on_hold: 'bg-red-100 text-red-800 border-red-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getAgeColor = (hours: number) => {
  if (hours >= 72) return 'text-red-600 font-bold'; // 3+ days
  if (hours >= 48) return 'text-orange-600 font-semibold'; // 2+ days
  return 'text-yellow-600';
};

// Column creation functions
interface CreateOverdueColumnsParams {
  onView: (ticket: OverdueTicket) => void;
  onManage: (ticket: OverdueTicket) => void;
}

export const createOverdueTicketColumns = ({
  onView,
  onManage,
}: CreateOverdueColumnsParams): ColumnDef<OverdueTicket>[] => [
  {
    accessorKey: 'ticket_no',
    header: 'Ticket #',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.ticket_no}</span>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div className="max-w-xs truncate" title={row.original.title}>
        {row.original.title}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge className={getStatusColor(row.original.status)}>
        {row.original.status.replace('_', ' ')}
      </Badge>
    ),
  },
  {
    accessorKey: 'section',
    header: 'Section',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Building2 className="h-4 w-4 text-gray-500" />
        {row.original.section}
      </div>
    ),
  },
  {
    accessorKey: 'facility',
    header: 'Facility',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Wrench className="h-4 w-4 text-gray-500" />
        {row.original.facility}
      </div>
    ),
  },
  {
    accessorKey: 'assigned_to',
    header: 'Assigned To',
    cell: ({ row }) => (
      row.original.assigned_to ? (
        <div className="flex items-center gap-1">
          <User className="h-4 w-4 text-gray-500" />
          {row.original.assigned_to}
        </div>
      ) : (
        <span className="text-gray-400 italic">Unassigned</span>
      )
    ),
  },
  {
    accessorKey: 'age_hours',
    header: 'Age',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        <span className={getAgeColor(row.original.age_hours)}>
          {Math.floor(row.original.age_hours)}h
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">
        {getRelativeTime(row.original.created_at)}
      </span>
    ),
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onView(row.original);
          }}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            onManage(row.original);
          }}
        >
          Manage
        </Button>
      </div>
    ),
  },
];

interface CreateUnassignedColumnsParams {
  onAssign: (ticket: Ticket) => void;
}

export const createUnassignedTicketColumns = ({
  onAssign,
}: CreateUnassignedColumnsParams): ColumnDef<Ticket>[] => [
  {
    accessorKey: 'ticket_no',
    header: 'Ticket #',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.ticket_no}</span>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div className="max-w-xs truncate" title={row.original.title}>
        {row.original.title}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: () => (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
        OPEN
      </Badge>
    ),
  },
  {
    accessorKey: 'section',
    header: 'Section',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Building2 className="h-4 w-4 text-gray-500" />
        {row.original.section || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: 'facility',
    header: 'Facility',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Wrench className="h-4 w-4 text-gray-500" />
        {row.original.facility || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">
        {getRelativeTime(row.original.created_at)}
      </span>
    ),
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAssign(row.original);
          }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Assign
        </Button>
      </div>
    ),
  },
];
