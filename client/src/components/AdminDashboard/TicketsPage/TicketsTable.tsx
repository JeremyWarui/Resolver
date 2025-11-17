// Import DRY utilities
import { useEffect } from "react";
import { useTicketTable } from "@/hooks/tickets";
import { createTicketTableFilters } from "@/components/Common/DataTable/utils/TicketTableFilters";
import { createTicketTableColumns } from "@/components/Common/DataTable/utils/TicketTableColumns";
import { createTicketColumnVisibility } from "@/components/Common/DataTable/utils/TicketColumnVisibility";
import type { QuickFilterType } from "./QuickFilterButtons";

// Import DataTable component
import DataTable from "@/components/Common/DataTable/DataTable";
import { AdminTableHeader } from "../../Common/DataTable/utils/TableHeaders";

// Import the new Sidebar component
import { TicketDetailsSidebar } from "@/components/Common/DataTable";

interface AllTicketsTableProps {
  activeQuickFilter?: QuickFilterType;
}

function AllTicketsTable({ activeQuickFilter = 'all' }: AllTicketsTableProps) {
  // ✨ All state, data fetching, and handlers consolidated in one hook
  const table = useTicketTable({
    role: 'admin',
    fetchTechnicians: true,
    fetchUsers: true,
    fetchFacilities: true,
    defaultPageSize: 10,
    ordering: '-id',
  });

  // Apply quick filter logic with backend parameters
  useEffect(() => {
    // Reset filters first
    table.setUnassignedFilter(false);
    table.setOverdueFilter(false);
    
    switch (activeQuickFilter) {
      case 'all':
        table.setStatusFilter('all');
        table.setTechnicianFilter(null);
        break;
      case 'open':
        table.setStatusFilter('open');
        table.setTechnicianFilter(null);
        break;
      case 'unassigned':
        // Backend will filter tickets where assigned_to is null
        table.setStatusFilter('open');
        table.setTechnicianFilter(null);
        table.setUnassignedFilter(true);
        break;
      case 'overdue':
        // Backend will filter overdue tickets
        table.setStatusFilter('all');
        table.setTechnicianFilter(null);
        table.setOverdueFilter(true);
        break;
      case 'in_progress':
        table.setStatusFilter('in_progress');
        table.setTechnicianFilter(null);
        break;
      case 'resolved':
        table.setStatusFilter('resolved');
        table.setTechnicianFilter(null);
        break;
    }
    // Reset to first page when filter changes
    table.setPageIndex(0);
  }, [activeQuickFilter]);

  // No need for client-side filtering anymore - backend handles it all

  // ✨ Generate columns with one function call
  const columns = createTicketTableColumns({
    role: 'admin',
    technicians: table.technicians,
    allStatuses: table.allStatuses,
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  });

  // ✨ Generate filters with one function call
  const filters = createTicketTableFilters(table, {
    includeStatus: true,
    includeSection: true,
    includeTechnician: true,
    includeUser: true,
  });

  // ✨ Generate column visibility config
  const columnVisibility = createTicketColumnVisibility({ role: 'admin' });

  return (
    <>
      <DataTable
        variant="admin"
        columns={columns}
        data={table.tableData}
        title="Tickets"
        {...table.commonTableProps}
        defaultPageSize={table.pageSize}
        initialColumnVisibility={columnVisibility}
        filterOptions={filters}
        totalItems={table.totalTickets}
        loading={table.loading}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        onRowClick={table.handleViewTicket}
        selectedRowId={table.selectedTicket?.id || null}
        renderHeader={AdminTableHeader}
      />

      {/* Ticket details sidebar */}
      {table.selectedTicket && (
        <TicketDetailsSidebar
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          ticket={table.selectedTicket}
          technicians={table.technicians}
          role="admin"
          onUpdate={table.handleTicketUpdate}
        />
      )}
    </>
  );
}

export default AllTicketsTable;
