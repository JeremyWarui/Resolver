import { useMemo } from 'react';
import { useTicketTable } from '@/hooks/tickets';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';
import { createTicketTableFilters } from '@/components/Common/DataTable/utils/TicketTableFilters';
import { createTicketColumnVisibility } from '@/components/Common/DataTable/utils/TicketColumnVisibility';
import DataTable from '@/components/Common/DataTable/DataTable';
import { TicketDetailsSidebar } from '@/components/Common/DataTable';

const TechSectionTickets = ({ currentTechnicianId }: { currentTechnicianId?: number }) => {
  const table = useTicketTable({
    role: 'technician',
    currentUserId: currentTechnicianId,
    fetchSectionTickets: true,
    defaultStatusFilter: 'all',
    defaultPageSize: 20,
    ordering: '-updated_at',
  });

  const columns = useMemo(() => createTicketTableColumns({
    role: 'technician',
    allStatuses: table.allStatuses,
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  }), [table.allStatuses, table.setSelectedTicket, table.setIsTicketDialogOpen]);

  const filters = createTicketTableFilters(table, { includeStatus: true, includeSection: true });
  const columnVisibility = createTicketColumnVisibility({ role: 'technician' });

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Section Tickets</h1>
        <p className="text-sm text-gray-600">All tickets in your section</p>
      </div>
      <DataTable
        variant="admin"
        columns={columns}
        data={table.tableData}
        {...table.commonTableProps}
        filterOptions={filters}
        initialColumnVisibility={columnVisibility}
        totalItems={table.totalTickets}
        loading={table.loading}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        onRowClick={table.handleViewTicket}
        selectedRowId={table.selectedTicket?.id || null}
        manualPagination={true}
        defaultPageSize={20}
      />
      {table.selectedTicket && (
        <TicketDetailsSidebar
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          ticket={table.selectedTicket}
          sections={table.sections}
          users={table.users}
          role="technician"
          viewOnly={true}
          onUpdate={table.handleTicketUpdate}
        />
      )}
    </div>
  );
};

export default TechSectionTickets;
