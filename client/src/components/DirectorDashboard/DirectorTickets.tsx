import { useMemo } from 'react';
import { useTicketTable } from '@/hooks/tickets';
import { createTicketTableFilters } from '@/components/Common/DataTable/utils/TicketTableFilters';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';
import { createTicketColumnVisibility } from '@/components/Common/DataTable/utils/TicketColumnVisibility';
import DataTable from '@/components/Common/DataTable/DataTable';
import { TicketDetailsSidebar } from '@/components/Common/DataTable';

const DirectorTickets = ({ userId }: { userId?: number }) => {
  const table = useTicketTable({ role: 'director', currentUserId: userId });

  const columns = useMemo(() => createTicketTableColumns({
    role: 'director',
    allStatuses: table.allStatuses,
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  }), [table.allStatuses, table.setSelectedTicket, table.setIsTicketDialogOpen]);

  const filters = createTicketTableFilters(table, {
    includeStatus: true,
    includeSection: true,
    includeTechnician: true,
    includeUser: false,
  });

  const columnVisibility = createTicketColumnVisibility({ role: 'director' });

  return (
    <>
      <DataTable
        variant="admin"
        columns={columns}
        data={table.tableData}
        title="All Tickets"
        subtitle={`${table.totalTickets} ticket${table.totalTickets !== 1 ? 's' : ''}`}
        {...table.commonTableProps}
        defaultPageSize={20}
        initialColumnVisibility={columnVisibility}
        filterOptions={filters}
        totalItems={table.totalTickets}
        loading={table.loading}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        onRowClick={table.handleViewTicket}
        selectedRowId={table.selectedTicket?.id || null}
        manualPagination={true}
      />

      {table.selectedTicket && (
        <TicketDetailsSidebar
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          ticket={table.selectedTicket}
          sections={table.sections}
          users={table.users}
          role="director"
          onUpdate={table.handleTicketUpdate}
        />
      )}
    </>
  );
};

export default DirectorTickets;
