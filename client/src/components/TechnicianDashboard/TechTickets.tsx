import { useMemo, useState } from 'react';
import { useTicketTable } from '@/hooks/tickets';
import { useTechDashboard } from '@/contexts/TechnicianDashboardContext';
import { createTicketTableFilters } from '@/components/Common/DataTable/utils/TicketTableFilters';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';
import { createTicketColumnVisibility } from '@/components/Common/DataTable/utils/TicketColumnVisibility';
import DataTable from '@/components/Common/DataTable/DataTable';
import { TechTableHeader } from '../Common/DataTable/utils/TableHeaders';
import { TicketDetailModal } from '@/components/shared/TicketDetailModal';
import type { TechQuickFilterType } from '@/components/Common/QuickFilterButtons';
import { QuickFilterButtons } from '@/components/Common/QuickFilterButtons';
import TechnicianStatsCards from './TechnicianStatsCards';
import type { Section } from '@/types';

type TechTicketsProps = {
  currentTechnicianId?: number;
};

function TechTickets({ currentTechnicianId }: TechTicketsProps) {
  // Get dashboard data from context (assigned tickets + KPIs)
  const { data: dashboardData } = useTechDashboard();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Convert dashboard sections to Section type for table filters
  const externalSections: Section[] | undefined = dashboardData?.sections.map(s => ({
    id: s.id,
    name: s.name,
    code: s.code,
    campus: { code: s.campus, name: s.campus } as any,
    department: { code: s.department, name: s.department } as any,
    section_type_name: s.section_type_name,
  } as unknown as Section));

  // Lazy-fetch only when filter changes
  const table = useTicketTable({
    role: 'technician',
    currentUserId: currentTechnicianId,
    defaultStatusFilter: statusFilter,
    defaultPageSize: 20,
    ordering: '-updated_at',
    externalSections,
    skipUntilUserId: true,
  });

  // Derive counts from actual fetched tickets so stat cards match the table
  const filterCounts = useMemo(() => {
    const tickets = table.tickets;
    return {
      all: table.totalTickets,
      assigned: tickets.filter(t => t.status === 'open' || t.status === 'assigned').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      pending: tickets.filter(t => t.status === 'pending').length,
      resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    };
  }, [table.tickets, table.totalTickets]);

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

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    table.setStatusFilter(filter);
    table.setPageIndex(0);
  };

  return (
    <>
      <TechnicianStatsCards
        counts={filterCounts}
        loading={table.loading}
        onCardClick={(filter) => handleFilterChange(filter)}
      />

      <QuickFilterButtons
        role="technician"
        activeFilter={statusFilter as TechQuickFilterType}
        onFilterChange={handleFilterChange}
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
