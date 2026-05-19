import { useMemo, useCallback } from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useTicketTable } from '@/hooks/tickets';
import { useTechDashboard } from '@/contexts/TechnicianDashboardContext';
import { createTicketTableColumns } from '@/components/Common/DataTable/utils/TicketTableColumns';
import { createTicketTableFilters } from '@/components/Common/DataTable/utils/TicketTableFilters';
import { createTicketColumnVisibility } from '@/components/Common/DataTable/utils/TicketColumnVisibility';
import DataTable from '@/components/Common/DataTable/DataTable';
import { TicketDetailModal } from '@/components/shared/TicketDetailModal';
import RoleStatsGrid from '@/components/Common/RoleStatsGrid';
import type { StatConfig } from '@/components/Common/RoleStatsGrid';
import type { Ticket, Section } from '@/types';

const TechSectionTickets = ({ currentTechnicianId }: { currentTechnicianId?: number }) => {
  // Get dashboard data from context
  const { data: dashboardData, sectionTickets, setSectionTickets } = useTechDashboard();

  // Convert dashboard sections to Section type for table filters
  const externalSections: Section[] | undefined = dashboardData?.sections.map(s => ({
    id: s.id,
    name: s.name,
    code: s.code,
    campus: { code: s.campus, name: s.campus } as any,
    department: { code: s.department, name: s.department } as any,
    section_type_name: s.section_type_name,
  } as unknown as Section));

  // Callback to cache fetched section tickets
  const handleDataFetched = useCallback((tickets: Ticket[]) => {
    setSectionTickets(tickets);
  }, [setSectionTickets]);

  const table = useTicketTable({
    role: 'technician',
    currentUserId: currentTechnicianId,
    fetchSectionTickets: true,
    defaultStatusFilter: 'all',
    defaultPageSize: 20,
    ordering: '-updated_at',
    externalSections,
    initialData: sectionTickets ?? undefined,
    onDataFetched: handleDataFetched,
  });

  const columns = useMemo(() => createTicketTableColumns({
    role: 'technician',
    allStatuses: table.allStatuses,
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  }), [table.allStatuses, table.setSelectedTicket, table.setIsTicketDialogOpen]);

  const filters = createTicketTableFilters(table, { includeStatus: true, includeSection: true });

  // For section tickets view: show assigned_to but hide actions (view-only mode)
  const columnVisibility = createTicketColumnVisibility({
    role: 'technician',
    customVisibility: {
      assigned_to: true,  // Show who each ticket is assigned to
      actions: false,     // Hide actions — view-only mode
    }
  });

  const sectionQueueStats = dashboardData?.section_queue;
  const unassignedCount = sectionQueueStats?.unassigned_count ?? 0;

  const sectionStats: StatConfig[] = useMemo(() => {
    const byStatus = sectionQueueStats?.tickets_by_status ?? {};
    const total     = Object.values(byStatus).reduce((s, c) => s + c, 0);
    const open      = byStatus['open'] ?? 0;
    const closed    = (byStatus['resolved'] ?? 0) + (byStatus['closed'] ?? 0);
    const inProgress = byStatus['in_progress'] ?? 0;
    const escalated = byStatus['escalated'] ?? 0;

    return [
      {
        title: 'Total Tickets',
        value: total,
        description: 'All section tickets',
        icon: <FileText className="h-6 w-6 text-[#0078d4]" />,
        iconBgColor: 'bg-[#e5f2fc]',
        badge: { value: 'Section', color: 'blue' },
      },
      {
        title: 'Open Tickets',
        value: open,
        description: 'Awaiting assignment',
        icon: <AlertTriangle className="h-6 w-6 text-[#ca5010]" />,
        iconBgColor: 'bg-[#fcf0e5]',
        badge: open > 0 ? { value: 'Active', color: 'amber' } : { value: 'Clear', color: 'green' },
      },
      {
        title: 'Resolved',
        value: closed,
        description: 'Completed tickets',
        icon: <CheckCircle className="h-6 w-6 text-[#107c10]" />,
        iconBgColor: 'bg-[#e5f9e5]',
        badge: { value: closed > 0 ? 'Done' : 'None yet', color: closed > 0 ? 'green' : 'gray' },
      },
      {
        title: 'In Progress',
        value: inProgress,
        description: 'Being worked on',
        icon: <Clock className="h-6 w-6 text-[#5c2d91]" />,
        iconBgColor: 'bg-[#f9f3ff]',
        badge: inProgress > 0 ? { value: 'Active', color: 'purple' } : { value: 'None', color: 'gray' },
      },
      {
        title: 'Escalated',
        value: escalated,
        description: escalated > 0 ? 'Flagged for review' : 'All on track',
        icon: <AlertCircle className="h-6 w-6 text-[#d13438]" />,
        iconBgColor: 'bg-[#fde7e9]',
        badge: escalated > 0 ? { value: 'Flagged', color: 'red' } : { value: 'None', color: 'green' },
      },
    ];
  }, [sectionQueueStats]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Section Tickets</h1>
        <p className="text-sm text-gray-600">
          All tickets in your section — {unassignedCount} unassigned
        </p>
      </div>

      <RoleStatsGrid stats={sectionStats} loading={table.loading} />

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
      <TicketDetailModal
        ticketId={table.selectedTicket?.id ?? null}
        isOpen={table.isTicketDialogOpen}
        onOpenChange={table.setIsTicketDialogOpen}
        onTicketUpdate={table.refetch}
      />
    </div>
  );
};

export default TechSectionTickets;
