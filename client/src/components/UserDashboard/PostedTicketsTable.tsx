import { useEffect, useMemo } from 'react';
import { useTicketTable } from '@/hooks/tickets';
import { createTicketTableFilters } from '@/components/Common/DataTable/utils/TicketTableFilters';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';
import { createTicketColumnVisibility } from '@/components/Common/DataTable/utils/TicketColumnVisibility';
import DataTable from '@/components/Common/DataTable/DataTable';
import { UserTableHeader } from '../Common/DataTable/utils/TableHeaders';
import { UserTicketDetailsSidebar } from './UserTicketDetailsSidebar';

interface PostedTicketsTableProps {
  currentUser?: number;
  viewOnly?: boolean;
  statusFilter?: string;
}

function PostedTicketsTable({ currentUser, viewOnly = false, statusFilter }: PostedTicketsTableProps) {
  const table = useTicketTable({
    role: 'user',
    currentUserId: currentUser,
    defaultPageSize: 10,
    ordering: '-updated_at',
  });

  useEffect(() => {
    if (statusFilter !== undefined) {
      table.setStatusFilter(statusFilter);
      table.setPageIndex(0);
    }
  }, [statusFilter]);

  const columns = useMemo(() => createTicketTableColumns({
    role: 'user',
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  }), [table.setSelectedTicket, table.setIsTicketDialogOpen]);

  const filters = createTicketTableFilters(table, {
    includeStatus: true,
    includeSection: true,
    includeTechnician: true,
    includeUser: true,
  });

  const columnVisibility = createTicketColumnVisibility({ role: 'user' });

  return (
    <>
      <DataTable
        variant="user"
        columns={columns}
        data={table.tableData}
        title={currentUser ? 'My Tickets' : 'Posted Tickets'}
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
        selectedRowId={table.selectedTicket?.id || null}
        renderHeader={UserTableHeader}
      />
      {table.selectedTicket && (
        <UserTicketDetailsSidebar
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          ticket={table.selectedTicket}
          currentUser={table.selectedTicket.raised_by}
          onUpdate={table.handleTicketUpdate}
          viewOnly={viewOnly}
        />
      )}
    </>
  );
}

export default PostedTicketsTable;
