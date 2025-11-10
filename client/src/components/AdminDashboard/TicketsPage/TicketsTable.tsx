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

function AllTicketsTable() {
  // ✨ All state, data fetching, and handlers consolidated in one hook
  const table = useTicketTable({
    role: 'admin',
    fetchTechnicians: true,
    fetchUsers: true,
    fetchFacilities: true,
    defaultPageSize: 10,
    ordering: '-id',
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

export default AllTicketsTable;
