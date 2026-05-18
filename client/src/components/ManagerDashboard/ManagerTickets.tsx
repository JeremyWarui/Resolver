import { useMemo } from 'react';
import { useTicketTable } from '@/hooks/tickets';
import { createTicketTableFilters } from '@/components/Common/DataTable/utils/TicketTableFilters';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';
import { createTicketColumnVisibility } from '@/components/Common/DataTable/utils/TicketColumnVisibility';
import DataTable from '@/components/Common/DataTable/DataTable';
import { TicketDetailModal } from '@/components/shared/TicketDetailModal';
import { useManagerDashboard } from '@/contexts/ManagerDashboardContext';
import ManagerStatsCards from './ManagerStatsCards';

const ManagerTickets = ({ userId }: { userId?: number }) => {
  const { managerTickets, setManagerTickets, data, loading } = useManagerDashboard();
  const table = useTicketTable({
    role: 'manager',
    currentUserId: userId,
    initialData: managerTickets || undefined,
    onDataFetched: (tickets) => setManagerTickets(tickets),
  });

  const columns = useMemo(() => createTicketTableColumns({
    role: 'manager',
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

  const columnVisibility = createTicketColumnVisibility({ role: 'manager' });

  return (
    <>
      <ManagerStatsCards data={data} loading={loading} />

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

      <TicketDetailModal
        ticketId={table.selectedTicket?.id ?? null}
        isOpen={table.isTicketDialogOpen}
        onOpenChange={table.setIsTicketDialogOpen}
        onTicketUpdate={table.refetch}
      />
    </>
  );
};

export default ManagerTickets;
