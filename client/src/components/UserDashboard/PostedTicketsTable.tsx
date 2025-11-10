// Import DRY utilities
import { useTicketTable } from '@/hooks/tickets';
import { createTicketTableFilters } from '@/components/Common/DataTable/utils/TicketTableFilters';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';
import { createTicketColumnVisibility } from '@/components/Common/DataTable/utils/TicketColumnVisibility';

// Import DataTable component
import DataTable from '@/components/Common/DataTable/DataTable';
import { UserTableHeader } from '../Common/DataTable/utils/TableHeaders';
import TicketDetails from '@/components/Common/DataTable/TicketDetails';

// Add interface for component props
interface PostedTicketsTableProps {
  currentUser?: number;
}

function PostedTicketsTable({ currentUser }: PostedTicketsTableProps) {
  // ✨ All state, data fetching, and handlers consolidated in one hook
  const table = useTicketTable({
    role: 'user',
    currentUserId: currentUser,
    fetchTechnicians: true,
    fetchUsers: true, // Enable users fetching for raised_by filter
    fetchFacilities: true,
    defaultPageSize: 10,
    ordering: '-id',
  });

  // ✨ Generate columns with one function call
  const columns = createTicketTableColumns({
    role: 'user',
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  });

  // ✨ Generate filters with one function call
  const filters = createTicketTableFilters(table, {
    includeStatus: true,
    includeSection: true,
    includeTechnician: true,
    includeUser: true, // Enable raised_by filter for users
  });

  // ✨ Generate column visibility config
  const columnVisibility = createTicketColumnVisibility({ role: 'user' });

  return (
    <>
      <DataTable
        variant="user"
        columns={columns}
        data={table.tableData}
        title={currentUser ? 'Your Tickets' : 'Posted Tickets'}
        subtitle=""
        {...table.commonTableProps}
        defaultPageSize={table.pageSize}
        initialColumnVisibility={columnVisibility}
        filterOptions={filters}
        totalItems={table.totalTickets}
        loading={table.loading}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        onRowClick={table.handleViewTicket}
        renderHeader={UserTableHeader}
      />

      {/* Add the ticket detail dialog */}
      {table.selectedTicket && (
        <TicketDetails.UserTicketDetailsComponent
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          ticket={table.selectedTicket}
          sections={table.sections}
          facilities={table.facilities}
          onUpdate={table.handleTicketUpdate}
          currentUser={table.selectedTicket.raised_by}
        />
      )}
    </>
  );
}

export default PostedTicketsTable;
