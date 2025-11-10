import type { ColumnDef } from '@tanstack/react-table';
import type { Ticket } from '@/types';
import * as TableUtils from './TableUtils';

/**
 * Configuration for which columns to include and customization
 */
export interface TicketColumnsConfig {
  role: 'admin' | 'user' | 'technician';
  technicians?: { first_name: string; last_name: string }[];
  allStatuses?: string[];
  setSelectedTicket?: (ticket: Ticket | null) => void;
  setIsTicketDialogOpen?: (open: boolean) => void;
  onBeginWork?: (ticketId: number, ticketNo: string, event?: React.MouseEvent) => Promise<void>;
  onUpdateStatus?: (ticketId: number, status: string, event?: React.MouseEvent) => Promise<void>;
  onReopen?: (ticketId: number, event?: React.MouseEvent) => Promise<void>;
}

/**
 * Generates standardized column definitions for ticket tables.
 * Provides consistent columns across Admin, User, and Technician dashboards.
 * 
 * @param config - Configuration for role-specific columns and actions
 * @returns Array of ColumnDef objects for TanStack Table
 * 
 * @example
 * // Admin columns with all actions
 * const columns = createTicketTableColumns({
 *   role: 'admin',
 *   technicians: allTechniciansData,
 *   allStatuses: ['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'],
 *   setSelectedTicket,
 *   setIsTicketDialogOpen
 * });
 * 
 * @example
 * // Technician columns with workflow actions
 * const columns = createTicketTableColumns({
 *   role: 'technician',
 *   allStatuses,
 *   setSelectedTicket,
 *   setIsTicketDialogOpen,
 *   onBeginWork: handleBeginWork,
 *   onUpdateStatus: handleUpdateStatus,
 *   onReopen: handleReopen
 * });
 */
export function createTicketTableColumns(config: TicketColumnsConfig): ColumnDef<Ticket>[] {
  const {
    role,
    technicians = [],
    allStatuses = [],
    setSelectedTicket,
    setIsTicketDialogOpen,
    onBeginWork,
    onUpdateStatus,
    onReopen,
  } = config;

  const columns: ColumnDef<Ticket>[] = [
    TableUtils.ticketNoColumn('Ticket ID'),
    TableUtils.ticketTitleColumn('Title'),
    TableUtils.descriptionColumn('Description'),
    TableUtils.facilityColumn('Facility'),
    TableUtils.sectionColumn('Section'),
    TableUtils.raisedByColumn('Raised By'),
    TableUtils.statusColumn('Status'),
    TableUtils.createdAtColumn('Created At'),
    TableUtils.assignedToColumn('Assigned To'),
    TableUtils.updatedAtColumn('Updated At'),
    TableUtils.searchFieldColumn('Search Field'),
  ];

  // Add role-specific actions column
  if (role === 'admin' && setSelectedTicket && setIsTicketDialogOpen) {
    columns.push(
      TableUtils.AdminActionsColumn<Ticket>({
        technicians: technicians.map((t) => `${t.first_name} ${t.last_name}`),
        statuses: allStatuses,
        setSelectedTicket,
        setIsTicketDialogOpen,
      })
    );
  } else if (role === 'user' && setSelectedTicket && setIsTicketDialogOpen) {
    columns.push(
      TableUtils.userActionsColumn<Ticket>({
        setSelectedTicket,
        setIsTicketDialogOpen,
      })
    );
  } else if (role === 'technician' && onBeginWork && onUpdateStatus && onReopen) {
    columns.push(
      TableUtils.technicianActionsColumn<Ticket>({
        handleBeginWork: onBeginWork,
        handleUpdateStatus: onUpdateStatus,
        handleReopen: onReopen,
      })
    );
  }

  return columns;
}
