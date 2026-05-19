// Import DRY utilities
import { useMemo } from "react";
import { useTicketTable } from "@/hooks/tickets";
import { useSharedData } from "@/contexts/SharedDataContext";
import { createTicketTableFilters } from "@/components/Common/DataTable/utils/TicketTableFilters";
import { createTicketTableColumns } from "@/components/Common/DataTable/utils/TicketTableColumns";
import { createTicketColumnVisibility } from "@/components/Common/DataTable/utils/TicketColumnVisibility";
import type { AdminQuickFilterType } from "@/components/Common/QuickFilterButtons";
import { QuickFilterButtons } from "@/components/Common/QuickFilterButtons";

// Import DataTable component
import DataTable from "@/components/Common/DataTable/DataTable";
import { AdminTableHeader } from "../../Common/DataTable/utils/TableHeaders";

import { TicketDetailModal } from '@/components/shared/TicketDetailModal';

function AllTicketsTable() {
  // ✨ Use hook's built-in filtering system (like TechTickets)
  const table = useTicketTable({
    role: 'admin',
    defaultPageSize: 20,
    defaultStatusFilter: 'all',
    ordering: '-updated_at',
  });

  // Get admin analytics from shared context (same source as StatsCards)
  const { adminAnalytics } = useSharedData();

  // Calculate filter counts from adminAnalytics (server-computed, matches StatsCards)
  // Counts calculated from table.tickets for accuracy with actual filtering behavior
  const filterCounts = useMemo(() => {
    if (!adminAnalytics) {
      return {
        all: table.totalTickets,
        open: 0,
        unassigned: 0,
        overdue: 0,
        in_progress: 0,
        resolved: 0,
      };
    }

    const { system_overview: overview, overdue_tickets } = adminAnalytics;
    const totalTickets = overview?.total_tickets || 0;
    const openTickets = overview?.open_tickets || 0;
    const resolvedTickets = overview?.resolved_tickets || 0;
    const overdueCount = overdue_tickets?.length || 0;
    
    // Calculate from current table data to match filter behavior
    const unassignedCount = table.tickets.filter(t => !t.assigned_to_id && !t.assigned_to).length;
    const inProgressCount = table.tickets.filter(t => t.status === 'in_progress').length;
    
    return {
      all: totalTickets,
      open: openTickets,
      unassigned: unassignedCount,
      overdue: overdueCount,
      in_progress: inProgressCount,  // ← Now shows only 'in_progress' status tickets
      resolved: resolvedTickets,
    };
  }, [adminAnalytics, table.tickets]);

  // ✨ Generate columns with one function call
  const columns = useMemo(() => createTicketTableColumns({
    role: 'admin',
    technicians: table.technicians,
    allStatuses: table.allStatuses,
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  }), [table.technicians, table.allStatuses, table.setSelectedTicket, table.setIsTicketDialogOpen]);

  // ✨ Generate filters (status, section, technician, user)
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
      {/* Quick Filter Buttons — uses hook's statusFilter */}
      <QuickFilterButtons
        role="admin"
        activeFilter={(table.statusFilter === 'all' ? 'all' : table.statusFilter) as AdminQuickFilterType}
        onFilterChange={(filter) => {
          if (filter === 'overdue') {
            // Overdue is a special filter combining status + age
            table.setOverdueFilter(true);
            table.setStatusFilter('all');
            table.setPageIndex(0);
          } else {
            table.setOverdueFilter(false);
            table.setStatusFilter(filter === 'all' ? 'all' : filter);
            table.setPageIndex(0);
          }
        }}
        counts={filterCounts}
      />
      
      <DataTable
        variant="admin"
        columns={columns}
        data={table.tableData}
        title="Tickets"
        defaultPageSize={20}
        initialColumnVisibility={columnVisibility}
        filterOptions={filters}
        totalItems={table.totalTickets}
        loading={table.loading}
        onRowClick={table.handleViewTicket}
        selectedRowId={table.selectedTicket?.id || null}
        renderHeader={AdminTableHeader}
        manualPagination={true}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
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

export default AllTicketsTable;
