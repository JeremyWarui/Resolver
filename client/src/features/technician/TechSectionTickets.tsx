import { useMemo } from 'react';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useTicketTable } from '@/hooks/tickets';
import { useTechnicianDashboard } from '@/hooks/dashboard';
import { createTicketTableColumns } from '@/components/shared/data/DataTable/utils/TicketTableColumns';
import { createTicketTableFilters } from '@/components/shared/data/DataTable/utils/TicketTableFilters';
import { createTicketColumnVisibility } from '@/components/shared/data/DataTable/utils/TicketColumnVisibility';
import DataTable from '@/components/shared/data/DataTable/DataTable';
import { TicketDetailModal } from '@/components/shared/ticket/TicketDetailModal';
import RoleStatsGrid from '@/components/shared/data/RoleStatsGrid';
import type { StatConfig } from '@/components/shared/data/RoleStatsGrid';
import type { Section } from '@/types';

const TechSectionTickets = ({ currentTechnicianId, onTicketSelect }: { currentTechnicianId?: number; onTicketSelect?: (ticketId: number) => void }) => {
  const { data: dashboardData } = useTechnicianDashboard();

  const externalSections: Section[] | undefined = dashboardData?.sections?.map(s => ({
    id: s.id,
    name: s.name,
    code: s.code,
    campus: { code: s.campus, name: s.campus },
    department: { code: s.department, name: s.department },
    section_type_name: s.section_type_name,
  } as unknown as Section));

  const table = useTicketTable({
    role: 'technician',
    currentUserId: currentTechnicianId,
    fetchSectionTickets: true,
    defaultStatusFilter: 'all',
    defaultPageSize: 20,
    externalSections,
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
    const byStatus: Record<string, number> = sectionQueueStats?.tickets_by_status ?? {};
    const total: number = Object.values(byStatus).reduce((s: number, c: number) => s + c, 0);
    const open      = byStatus['open'] ?? 0;
    const closed    = (byStatus['resolved'] ?? 0) + (byStatus['closed'] ?? 0);
    const inProgress = byStatus['in_progress'] ?? 0;

    return [
      {
        title: 'Total Tickets',
        value: total,
        description: 'All section tickets',
        icon: <FileText className="h-6 w-6 text-primary" />,
        iconBgColor: 'bg-primary/10',
        badge: { value: 'Section', color: 'blue' },
      },
      {
        title: 'Open Tickets',
        value: open,
        description: 'Awaiting assignment',
        icon: <AlertTriangle className="h-6 w-6 text-status-pending" />,
        iconBgColor: 'bg-amber-50',
        badge: open > 0 ? { value: 'Active', color: 'amber' } : { value: 'Clear', color: 'green' },
      },
      {
        title: 'Resolved',
        value: closed,
        description: 'Completed tickets',
        icon: <CheckCircle className="h-6 w-6 text-status-resolved" />,
        iconBgColor: 'bg-green-50',
        badge: { value: closed > 0 ? 'Done' : 'None yet', color: closed > 0 ? 'green' : 'gray' },
      },
      {
        title: 'In Progress',
        value: inProgress,
        description: 'Being worked on',
        icon: <Clock className="h-6 w-6 text-status-assigned" />,
        iconBgColor: 'bg-violet-50',
        badge: inProgress > 0 ? { value: 'Active', color: 'purple' } : { value: 'None', color: 'gray' },
      },
    ];
  }, [sectionQueueStats]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
      <div>
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
        onRowClick={onTicketSelect ? (t) => onTicketSelect(t.id) : table.handleViewTicket}
        selectedRowId={table.selectedTicket?.id || null}
        manualPagination={true}
        defaultPageSize={20}
      />
      {!onTicketSelect && (
        <TicketDetailModal
          ticketId={table.selectedTicket?.id ?? null}
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          onTicketUpdate={table.refetch}
        />
      )}
    </div>
  );
};

export default TechSectionTickets;
