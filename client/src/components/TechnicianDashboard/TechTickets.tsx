import { useMemo } from "react";

// Import DRY utilities
import { useTicketTable } from "@/hooks/tickets";
import { createTicketTableFilters } from "@/components/Common/DataTable/utils/TicketTableFilters";
import { createTicketTableColumns } from "@/components/Common/DataTable/utils/TicketTableColumns";
import { createTicketColumnVisibility } from "@/components/Common/DataTable/utils/TicketColumnVisibility";

// Import DataTable component
import DataTable from "@/components/Common/DataTable/DataTable";
import { TechTableHeader } from "../Common/DataTable/utils/TableHeaders";

// Import the sidebar component
import { TicketDetailsSidebar } from "@/components/Common/DataTable";
import type { TechQuickFilterType } from "./QuickFilterButtons";
import TechnicianStatsCards from "./TechnicianStatsCards";
import TechQuickFilterButtons from "./QuickFilterButtons";

// Define props type to receive activeQuickFilter for client-side filtering
type TechTicketsProps = {
  activeQuickFilter?: TechQuickFilterType;
  currentTechnicianId?: number;
  onFilterChange?: (filter: TechQuickFilterType) => void;
  onStatCardClick?: (filter: TechQuickFilterType) => void;
};

function TechTickets({ 
  activeQuickFilter = 'assigned',
  currentTechnicianId,
  onFilterChange,
  onStatCardClick,
}: TechTicketsProps) {
  const technicianId = currentTechnicianId ?? 3;
  
  const table = useTicketTable({
    role: 'technician',
    currentUserId: technicianId,
    defaultStatusFilter: 'all', // Fetch all statuses, filter client-side
    defaultPageSize: 100, // Fetch more for client-side filtering
    ordering: '-updated_at',
  });

  // ✨ Client-side filtering based on activeQuickFilter
  const filteredTickets = useMemo(() => {
    let filtered = table.tickets;
    
    if (activeQuickFilter !== 'all') {
      filtered = table.tickets.filter(ticket => ticket.status === activeQuickFilter);
    }
    
    // Ensure tickets are sorted by updated_at (most recent first)
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.updated_at).getTime();
      const dateB = new Date(b.updated_at).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [table.tickets, activeQuickFilter]);

  // Calculate filter counts from actual tickets
  const filterCounts = useMemo(() => {
    return {
      all: table.tickets.length,
      assigned: table.tickets.filter(t => t.status === 'assigned').length,
      in_progress: table.tickets.filter(t => t.status === 'in_progress').length,
      pending: table.tickets.filter(t => t.status === 'pending').length,
      resolved: table.tickets.filter(t => t.status === 'resolved').length,
    };
  }, [table.tickets]);

    // Use filtered tickets for table data
  const filteredTableData = useMemo(() => {
    return filteredTickets.map((ticket) => {
      // Find the user who raised this ticket to get their full name
      const raisedByUser = table.users.find(u => u.username === ticket.raised_by);
      const raisedByName = raisedByUser 
        ? `${raisedByUser.first_name} ${raisedByUser.last_name}`
        : ticket.raised_by || "Unknown";
      
      return {
        ...ticket,
        sectionName: ticket.section || "N/A",
        facilityName: ticket.facility || "N/A",
        raisedByName: raisedByName, // Fix: Changed from raisedBy to raisedByName
        assignedTo: ticket.assigned_to_name
          ? ticket.assigned_to_name
          : (ticket.assigned_to
            ? `${ticket.assigned_to.first_name} ${ticket.assigned_to.last_name}`
            : "Unassigned"),
        // Add search field for global filtering
        searchField: `${ticket.ticket_no} ${ticket.title} ${ticket.description || ""} ${ticket.section} ${ticket.facility} ${raisedByName} ${ticket.status}`.toLowerCase(),
      };
    });
  }, [filteredTickets, table.users]);

  // ✨ Generate columns with view button
  const columns = createTicketTableColumns({
    role: 'technician',
    allStatuses: table.allStatuses,
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
  });

  // ✨ Generate filters
  const filters = createTicketTableFilters(table, {
    includeStatus: true,
    includeSection: false,
    includeTechnician: false,
    includeUser: false,
  });

  // ✨ Generate column visibility config for technician
  // Shows: Ticket ID, Title, Facility, Raised By, Status, Created At, Updated At
  // Hidden by default: Section, Assigned To, Description
  const columnVisibility = createTicketColumnVisibility({ role: 'technician' });

  return (
    <>
      {/* Stats Cards - Clickable to filter */}
      <TechnicianStatsCards 
        counts={filterCounts} 
        loading={table.loading}
        onCardClick={onStatCardClick}
      />
      
      {/* Quick Filter Buttons */}
      <TechQuickFilterButtons 
        activeFilter={activeQuickFilter}
        onFilterChange={onFilterChange || (() => {})}
        counts={filterCounts}
      />
      
      <DataTable
        variant="tech"
        columns={columns}
        data={filteredTableData}
        title="My Tickets"
        subtitle={`Showing ${filteredTickets.length} ticket${filteredTickets.length !== 1 ? 's' : ''}`}
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
        renderHeader={TechTableHeader}
        manualPagination={false} // Client-side pagination for filtered data
      />
      
      {/* Ticket details sidebar */}
      {table.selectedTicket && (
        <TicketDetailsSidebar
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          ticket={table.selectedTicket}
          sections={table.sections}
          users={table.users}
          role="technician"
          onUpdate={table.handleTicketUpdate}
        />
      )}
    </>
  );
}

export default TechTickets;
