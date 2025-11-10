// Import DRY utilities
import { useTicketTable } from "@/hooks/tickets";
import { createTicketTableFilters } from "@/components/Common/DataTable/utils/TicketTableFilters";
import { createTicketTableColumns } from "@/components/Common/DataTable/utils/TicketTableColumns";
import { createTicketColumnVisibility } from "@/components/Common/DataTable/utils/TicketColumnVisibility";

// Import DataTable component
import DataTable from "@/components/Common/DataTable/DataTable";
import { AdminTableHeader } from "../../Common/DataTable/utils/TableHeaders";

// Import the AdminTicketDetails component
import TicketDetails from "@/components/Common/DataTable/TicketDetails";

export default function RecentTicketsTable() {
  // ✨ All state, data fetching, and handlers consolidated in one hook
  const table = useTicketTable({
    role: 'admin',
    fetchTechnicians: true,
    fetchUsers: true,
    fetchFacilities: true,
    defaultPageSize: 10,
    ordering: '-created_at', // Most recent first
  });

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

  // ✨ Generate column visibility config for Recent Tickets
  // Recent Tickets has different visibility than main Admin Tickets Table
  const columnVisibility = createTicketColumnVisibility({ 
    role: 'admin',
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
        {...table.commonTableProps}
        defaultPageSize={table.pageSize}
        initialColumnVisibility={columnVisibility}
        filterOptions={filters}
        totalItems={table.totalTickets}
        loading={table.loading}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        onRowClick={table.handleViewTicket}
        renderHeader={AdminTableHeader}
      />

      {/* Ticket details dialog */}
      {table.selectedTicket && (
        <TicketDetails.AdminTicketDetailsComponent
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          ticket={table.selectedTicket}
          onUpdate={table.handleTicketUpdate}
          sections={table.sections}
          facilities={table.facilities}
        />
      )}
    </>
  );
}
