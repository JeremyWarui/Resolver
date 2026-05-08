import { useMemo } from 'react';
import { useTicketTable } from '@/hooks/tickets';
import { createTicketTableFilters } from '@/components/Common/DataTable/utils/TicketTableFilters';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';
import { createTicketColumnVisibility } from '@/components/Common/DataTable/utils/TicketColumnVisibility';
import DataTable from '@/components/Common/DataTable/DataTable';
import { TechTableHeader } from '../Common/DataTable/utils/TableHeaders';
import { TicketDetailModal } from '@/components/shared/TicketDetailModal';
import type { TechQuickFilterType } from './QuickFilterButtons';
import TechnicianStatsCards from './TechnicianStatsCards';
import TechQuickFilterButtons from './QuickFilterButtons';

type TechTicketsProps = {
  currentTechnicianId?: number;
};

function TechTickets({ currentTechnicianId }: TechTicketsProps) {
  const table = useTicketTable({
    role: 'technician',
    currentUserId: currentTechnicianId,
    defaultStatusFilter: 'all',
    defaultPageSize: 20,
    ordering: '-updated_at',
  });

  const filterCounts = useMemo(() => ({
    all: table.totalTickets,
    assigned: table.tableData.filter(t => t.status === 'assigned').length,
    in_progress: table.tableData.filter(t => t.status === 'in_progress').length,
    pending: table.tableData.filter(t => t.status === 'pending').length,
    resolved: table.tableData.filter(t => t.status === 'resolved').length,
  }), [table.tableData, table.totalTickets]);

  const columns = useMemo(() => createTicketTableColumns({
    role: 'technician',
    allStatuses: table.allStatuses,
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  }), [table.allStatuses, table.setSelectedTicket, table.setIsTicketDialogOpen]);

  const filters = createTicketTableFilters(table, {
    includeStatus: true,
    includeSection: false,
    includeTechnician: false,
    includeUser: false,
  });

  const columnVisibility = createTicketColumnVisibility({ role: 'technician' });

  return (
    <>
      <TechnicianStatsCards
        counts={filterCounts}
        loading={table.loading}
        onCardClick={(filter) => {
          table.setStatusFilter(filter);
          table.setPageIndex(0);
        }}
      />

      <TechQuickFilterButtons
        activeFilter={table.statusFilter as TechQuickFilterType}
        onFilterChange={(filter) => {
          table.setStatusFilter(filter);
          table.setPageIndex(0);
        }}
        counts={filterCounts}
      />

      <DataTable
        variant="tech"
        columns={columns}
        data={table.tableData}
        title="Assigned Tickets"
        subtitle=""
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
        renderHeader={TechTableHeader}
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
}

export default TechTickets;
