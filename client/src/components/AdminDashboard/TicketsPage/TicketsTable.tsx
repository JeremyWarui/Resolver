// Import DRY utilities
import { useMemo } from "react";
import { useAdminAnalytics } from '@/hooks/analytics';
import { useTicketTable } from "@/hooks/tickets";
import { createTicketTableFilters } from "@/components/Common/DataTable/utils/TicketTableFilters";
import { createTicketTableColumns } from "@/components/Common/DataTable/utils/TicketTableColumns";
import { createTicketColumnVisibility } from "@/components/Common/DataTable/utils/TicketColumnVisibility";
import type { QuickFilterType } from "./QuickFilterButtons";
import QuickFilterButtons from "./QuickFilterButtons";

// Import DataTable component
import DataTable from "@/components/Common/DataTable/DataTable";
import { AdminTableHeader } from "../../Common/DataTable/utils/TableHeaders";

// Import the new Sidebar component
import { TicketDetailsSidebar } from "@/components/Common/DataTable";

interface AllTicketsTableProps {
  activeQuickFilter?: QuickFilterType;
  onFilterChange?: (filter: QuickFilterType) => void;
}

function AllTicketsTable({ activeQuickFilter = 'all', onFilterChange }: AllTicketsTableProps) {
  // ✨ Fetch ALL tickets once with large page_size for client-side filtering
  const table = useTicketTable({
    role: 'admin',
    fetchTechnicians: true,
    fetchUsers: true,
    fetchFacilities: true,
    defaultPageSize: 1000, // Fetch ALL tickets for client-side filtering (backend is 66x faster now!)
    defaultStatusFilter: 'all', // Fetch all statuses
    ordering: '-updated_at',
  });

  // Helper: Check if ticket is overdue (7+ days old and still active)
  const isOverdue = (ticket: any) => {
    const activeStatuses = ['open', 'assigned', 'in_progress'];
    if (!activeStatuses.includes(ticket.status)) return false;
    
    const createdDate = new Date(ticket.created_at);
    const now = new Date();
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 7;
  };

  // Use server-side analytics when available to determine overdue tickets
  // This keeps the QuickFilter counts consistent with the StatsCards which use admin analytics
  const { data: adminAnalytics } = useAdminAnalytics();
  const overdueIdSet = useMemo(() => {
    if (!adminAnalytics || !adminAnalytics.overdue_tickets) return null;
    return new Set(adminAnalytics.overdue_tickets.map((t) => t.id));
  }, [adminAnalytics]);

  // ✨ Client-side filtering based on activeQuickFilter (instant, no API calls!)
  const filteredTickets = useMemo(() => {
    switch (activeQuickFilter) {
      case 'all':
        return table.tickets;
      case 'open':
        return table.tickets.filter(t => t.status === 'open');
      case 'unassigned':
        return table.tickets.filter(t => 
          !t.assigned_to_id && !t.assigned_to && !t.assigned_to_name
        );
      case 'overdue':
        return overdueIdSet
          ? table.tickets.filter((t) => overdueIdSet.has(t.id))
          : table.tickets.filter(isOverdue);
      case 'in_progress':
        return table.tickets.filter(t => t.status === 'in_progress');
      case 'resolved':
        return table.tickets.filter(t => t.status === 'resolved');
      default:
        return table.tickets;
    }
  }, [table.tickets, activeQuickFilter]);

  // Calculate filter counts - use analytics total for "all" to match StatsCards
  const filterCounts = useMemo(() => {
    return {
      all: adminAnalytics?.system_overview?.total_tickets || table.tickets.length,
      open: table.tickets.filter(t => t.status === 'open').length,
      unassigned: table.tickets.filter(t => 
        !t.assigned_to_id && !t.assigned_to && !t.assigned_to_name
      ).length,
      overdue: overdueIdSet
        ? table.tickets.filter((t) => overdueIdSet.has(t.id)).length
        : table.tickets.filter(isOverdue).length,
      in_progress: table.tickets.filter(t => t.status === 'in_progress').length,
      resolved: table.tickets.filter(t => t.status === 'resolved').length,
    };
  }, [table.tickets, adminAnalytics]);

  // Transform filtered tickets with raisedByName
  const filteredTableData = useMemo(() => {
    return filteredTickets.map((ticket) => {
      // Find in tableData which already has raisedByName computed
      const enrichedTicket = table.tableData.find(t => t.id === ticket.id);
      return enrichedTicket || ticket;
    });
  }, [filteredTickets, table.tableData]);

  // ✨ Generate columns with one function call
  const columns = createTicketTableColumns({
    role: 'admin',
    technicians: table.technicians,
    allStatuses: table.allStatuses,
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  });

  // ✨ Generate filters with one function call
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
      {/* Quick Filter Buttons */}
      <QuickFilterButtons
        activeFilter={activeQuickFilter}
        onFilterChange={onFilterChange || (() => {})} // Pass through to parent
        counts={filterCounts}
      />
      
      <DataTable
        variant="admin"
        columns={columns}
        data={filteredTableData}
        title="Tickets"
        subtitle={`Showing ${filteredTickets.length} of ${adminAnalytics?.system_overview?.total_tickets || table.tickets.length} tickets`}
        {...table.commonTableProps}
        defaultPageSize={10}
        initialColumnVisibility={columnVisibility}
        filterOptions={filters}
        totalItems={filteredTickets.length}
        loading={table.loading}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        onRowClick={table.handleViewTicket}
        selectedRowId={table.selectedTicket?.id || null}
        renderHeader={AdminTableHeader}
        manualPagination={false} // Client-side pagination for filtered data
      />

      {/* Ticket details sidebar */}
      {table.selectedTicket && (
        <TicketDetailsSidebar
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          ticket={table.selectedTicket}
          technicians={table.technicians}
          sections={table.sections}
          users={table.users}
          role="admin"
          onUpdate={table.handleTicketUpdate}
        />
      )}
    </>
  );
}

export default AllTicketsTable;
