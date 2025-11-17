import type { ColumnDef } from '@tanstack/react-table';
import type { Ticket } from '@/types';
import * as TableUtils from './TableUtils';

/**
 * Configuration for which columns to include and customization
 */
export interface TicketColumnsConfig {
  role: 'admin' | 'user' | 'technician';
  setSelectedTicket?: (ticket: Ticket | null) => void;
  setIsTicketDialogOpen?: (open: boolean) => void;
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
 *   setSelectedTicket,
 *   setIsTicketDialogOpen
 * });
 * 
 * @example
 * // Technician columns with workflow actions
 * const columns = createTicketTableColumns({
 *   role: 'technician',
 *   setSelectedTicket,
 *   setIsTicketDialogOpen,
 * });
 */
export function createTicketTableColumns(config: TicketColumnsConfig): ColumnDef<Ticket>[] {
  const {
    role,
    setSelectedTicket,
    setIsTicketDialogOpen,
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

  // Add view button column for technicians
  if (role === 'technician' && setSelectedTicket && setIsTicketDialogOpen) {
    columns.push(
      TableUtils.technicianViewColumn({
        setSelectedTicket,
        setIsTicketDialogOpen,
      })
    );
  }

  return columns;
}
