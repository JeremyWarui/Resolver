// Import DRY utilities
import { useTicketTable } from "@/hooks/tickets";
import { useTicketFilterOptions } from "@/hooks/tickets/useTicketFilterOptions";
import { createStatusFilter, createSectionFilter, createTechnicianFilter, createUserFilter } from "@/components/shared/data/DataTable/utils/FilterUtils";
import { createTicketTableColumns } from "@/components/shared/data/DataTable/utils/TicketTableColumns";
import { createTicketColumnVisibility } from "@/components/shared/data/DataTable/utils/TicketColumnVisibility";
import type { FilterOption } from "@/components/shared/data/DataTable/DataTable";

// Import DataTable component
import DataTable from "@/components/shared/data/DataTable/DataTable";
import { AdminTableHeader } from '@/components/shared/data/DataTable/utils/TableHeaders';

import { TicketDetailModal } from '@/components/shared/ticket/TicketDetailModal';

type RecentTicketsRole = 'admin' | 'manager' | 'hod' | 'hos';

interface RecentTicketsTableProps {
  /** Role scope for the table. Backend scopes results by JWT; this only drives column/filter presentation. */
  role?: RecentTicketsRole;
}

export default function RecentTicketsTable({ role = 'admin' }: RecentTicketsTableProps) {
  // ✨ All state, data fetching, and handlers consolidated in one hook
  const table = useTicketTable({
    role,
    defaultPageSize: 25,
  });

  // Scoped filter options — same endpoint used by the full Tickets page
  const { sections, technicians, requesters } = useTicketFilterOptions();

  // ✨ Generate columns with one function call
  const columns = createTicketTableColumns({
    role,
    technicians: table.technicians,
    allStatuses: table.allStatuses,
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  });

  // Build filters manually using scoped option lists from the dedicated endpoint
  const filters: FilterOption[] = [
    createStatusFilter(table.statusFilter, table.setStatusFilter, table.allStatuses, table.setPageIndex),
    createSectionFilter(
      table.sectionFilter ?? 'all',
      (v) => table.setSectionFilter(v == null ? null : Number(v)),
      sections,
      table.setPageIndex,
    ),
    createTechnicianFilter(
      String(table.technicianFilter ?? 'all'),
      (v) => table.setTechnicianFilter(v === 'all' ? null : Number(v)),
      technicians,
      undefined,
      table.setPageIndex,
    ),
    createUserFilter(
      String(table.userFilter ?? 'all'),
      (v) => table.setUserFilter(v === 'all' ? null : Number(v)),
      requesters,
      table.setPageIndex,
    ),
  ];

  // ✨ Generate column visibility config for Recent Tickets
  // Recent Tickets has different visibility than main Admin Tickets Table
  const columnVisibility = createTicketColumnVisibility({
    role,
    customVisibility: {
      ticket_no: true,      // Ticket ID
      title: true,          // Title
      sectionName: true,    // Section
      raised_by: true,      // Raised By
      status: true,         // Status
      created_at: true,     // Created At
      assigned_to: true,    // Assigned To
      facility: true,       // Facility
      actions: true,        // Actions
      updated_at: false,    // Hidden (different from main Admin table)
      description: false,   // Hidden
    }
  });

  return (
    <>
      <DataTable
        variant="admin"
        columns={columns}
        data={table.tableData}
        title="Recent Tickets"
        defaultPageSize={10} // UI pagination: Show 10 per page with prev/next controls
        manualPagination={false} // Use client-side pagination for small dataset
        initialColumnVisibility={columnVisibility}
        filterOptions={filters}
        loading={table.loading}
        onRowClick={table.handleViewTicket}
        selectedRowId={table.selectedTicket?.id || null}
        renderHeader={AdminTableHeader}
      />

      <TicketDetailModal
        ticketId={table.selectedTicket?.id ?? null}
        isOpen={table.isTicketDialogOpen}
        onOpenChange={table.setIsTicketDialogOpen}
        onTicketUpdate={table.refetch}
      />
    </>
  );
}
