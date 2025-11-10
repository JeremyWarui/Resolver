import { toast } from "sonner";

// Import DRY utilities
import { useTicketTable } from "@/hooks/tickets";
import { createTicketTableFilters } from "@/components/Common/DataTable/utils/TicketTableFilters";
import { createTicketTableColumns } from "@/components/Common/DataTable/utils/TicketTableColumns";
import { createTicketColumnVisibility } from "@/components/Common/DataTable/utils/TicketColumnVisibility";

// Import DataTable component
import DataTable from "@/components/Common/DataTable/DataTable";
import { TechTableHeader } from "../Common/DataTable/utils/TableHeaders";

// Import the technician-specific ticket details component
import TicketDetails from "@/components/Common/DataTable/TicketDetails";

import type { Ticket } from "@/types";

// Define props type to receive defaultFilter
type TechTicketsProps = {
  defaultFilter?: string;
  currentTechnicianId?: number;
};

function TechTickets({ 
  defaultFilter = "open",
  currentTechnicianId 
}: TechTicketsProps) {
  // ✨ All state, data fetching, and handlers consolidated in one hook
  const table = useTicketTable({
    role: 'technician',
    currentUserId: currentTechnicianId,
    defaultStatusFilter: defaultFilter,
    defaultPageSize: 10,
    ordering: '-created_at',
  });

  // Technician-specific workflow action handlers
  const handleBeginWork = async (ticketId: number, ticketNo: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    try {
      const ticketToUpdate = table.tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) return;

      await table.updateTicket({
        ...ticketToUpdate,
        status: "in_progress",
      });
      
      toast.success(`Started work on #${ticketNo}`, {
        description: "Ticket status changed to 'In Progress'",
      });
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    }
  };

  const handleUpdateStatus = async (ticketId: number, newStatus: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    try {
      const ticketToUpdate = table.tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) return;
      
      await table.updateTicket({
        ...ticketToUpdate,
        status: newStatus as Ticket["status"],
      });
      
      if (newStatus === "resolved") {
        toast.success(`Resolved ticket #${ticketToUpdate.ticket_no}`, {
          description: "Ticket status changed to 'Resolved'",
        });
      } else if (newStatus === "pending") {
        toast.success(`Marked ticket #${ticketToUpdate.ticket_no} as pending`, {
          description: "Ticket status changed to 'Pending'",
        });
      }
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    }
  };

  const handleReopen = async (ticketId: number, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    try {
      const ticketToUpdate = table.tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) return;

      await table.updateTicket({
        ...ticketToUpdate,
        status: "in_progress",
      });

      toast.success(`Reopened work on ticket #${ticketToUpdate.ticket_no}`, {
        description: "Ticket status changed to 'In Progress'",
      });
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    }
  };

  // ✨ Generate columns with workflow actions
  const columns = createTicketTableColumns({
    role: 'technician',
    allStatuses: table.allStatuses,
    setSelectedTicket: table.setSelectedTicket,
    setIsTicketDialogOpen: table.setIsTicketDialogOpen,
    onBeginWork: handleBeginWork,
    onUpdateStatus: handleUpdateStatus,
    onReopen: handleReopen,
  });

  // ✨ Generate filters
  const filters = createTicketTableFilters(table, {
    includeStatus: true,
    includeSection: false,
    includeTechnician: false,
    includeUser: false,
  });

  // ✨ Generate column visibility config
  const columnVisibility = createTicketColumnVisibility({ role: 'technician' });

  return (
    <>
      <DataTable
        variant="tech"
        columns={columns}
        data={table.tableData}
        title="Assigned Tickets"
        subtitle=""
        {...table.commonTableProps}
        defaultPageSize={table.pageSize}
        initialColumnVisibility={columnVisibility}
        filterOptions={filters}
        totalItems={table.totalTickets}
        loading={table.loading}
        onPageChange={table.handlePageChange}
        onPageSizeChange={table.handlePageSizeChange}
        onRowClick={table.handleViewTicket}
        renderHeader={TechTableHeader}
      />
      
      {/* Ticket details dialog */}
      {table.selectedTicket && (
        <TicketDetails.TechnicianTicketDetailsComponent
          isOpen={table.isTicketDialogOpen}
          onOpenChange={table.setIsTicketDialogOpen}
          ticket={table.selectedTicket}
          onUpdate={table.handleTicketUpdate}
        />
      )}
    </>
  );
}

export default TechTickets;
