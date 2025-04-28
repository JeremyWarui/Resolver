import { useState, useMemo, Dispatch, SetStateAction } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  PlayCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Import DataTable component
import DataTable from "@/components/Common/DataTable";

// Import the technician-specific ticket details component
import TechTicketDetails from "./TechTicketDetails";

// Import hooks
import useUpdateTicket from "@/hooks/useUpdateTicket";
import { Section } from './TechSideBar';

// Import sample data from shared file
import { sampleTickets, currentTechnician, allStatuses } from './data/sampleData';

// Define props type to receive onNavigate and defaultFilter
type TechTicketsProps = {
  onNavigate?: Dispatch<SetStateAction<Section['id']>>;
  defaultFilter?: string;
};

function TechTickets({ onNavigate, defaultFilter = "open" }: TechTicketsProps) {
  // State for ticket details dialog
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  
  // Use ticket update hook
  const { updateTicket, loading: updating } = useUpdateTicket();
  
  // Use defaultFilter prop to set initial state
  const [statusFilter, setStatusFilter] = useState<string>(defaultFilter);
  
  // Filter tickets with selected status from sample data
  const tickets = useMemo(() => {
    return sampleTickets.filter(ticket => 
      statusFilter === "all" ? true : ticket.status === statusFilter
    );
  }, [statusFilter]);
  
  const loading = false;

  // Add a searchable field to each ticket 
  const dataWithSearchField = useMemo(() => {
    return tickets.map((ticket) => ({
      ...ticket,
      searchField: `${String(ticket.id).toLowerCase()} ${ticket.title.toLowerCase()} ${ticket.ticket_no.toLowerCase()}`,
    }));
  }, [tickets]);

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // Function to handle ticket updates
  const handleTicketUpdate = async (updatedTicket: any) => {
    try {
      // In a real app, this would call the updateTicket function
      // await updateTicket(updatedTicket);
      
      // For demo purposes, just show a toast notification
      toast.success(`Updated ticket #${updatedTicket.ticket_no}`, {
        description: "Ticket has been updated successfully",
      });
      
      // Close the dialog
      setIsTicketDialogOpen(false);
      
      // In a real app, this would refresh the tickets list
      console.log("Ticket updated:", updatedTicket);
    } catch (error) {
      toast.error("Failed to update ticket");
      console.error("Error updating ticket:", error);
    }
  };

  // Function to open the ticket details dialog
  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsTicketDialogOpen(true);
  };

  // Handle Begin Work button click - Now only updates status without opening dialog
  const handleBeginWork = async (ticketId: number, ticketNo: string, event?: React.MouseEvent) => {
    // Prevent the row click event from triggering
    if (event) {
      event.stopPropagation();
    }
    
    try {
      // Find the ticket to update
      const ticketToUpdate = tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) return;

      // Create updated ticket object
      const updatedTicket = {
        ...ticketToUpdate,
        status: "in progress",
        updatedAt: new Date().toISOString()
      };
      
      // Show toast notification
      toast.success(`Started work on #${ticketNo}`, {
        description: "Ticket status changed to 'In Progress'",
      });
      
      console.log(`Started work on ticket ${ticketId}`, updatedTicket);
      
      // No longer opening the ticket details dialog
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    }
  };

  // Handle updating ticket status (for dropdown in "in progress" state)
  const handleUpdateStatus = async (ticketId: number, newStatus: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    try {
      // Find the ticket to update
      const ticketToUpdate = tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) return;
      
      // Create updated ticket object
      const updatedTicket = {
        ...ticketToUpdate,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      // Show toast notification based on status
      if (newStatus === "resolved") {
        toast.success(`Resolved ticket #${ticketToUpdate.ticket_no}`, {
          description: "Ticket status changed to 'Resolved'",
        });
      } else if (newStatus === "pending") {
        toast.success(`Marked ticket #${ticketToUpdate.ticket_no} as pending`, {
          description: "Ticket status changed to 'Pending'",
        });
      }
      
      console.log(`Updated ticket ${ticketId} to ${newStatus}`, updatedTicket);
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    }
  };

  // Handle Reopen button click (for pending tickets)
  const handleReopen = async (ticketId: number, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    try {
      toast.success(`Reopened work on ticket #${ticketId}`, {
        description: "Ticket status changed to 'In Progress'",
      });
      console.log(`Reopened work on ticket ${ticketId}`);
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    }
  };

  // Define table columns for the ticket data
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "ticket_no",
      header: "Ticket ID",
      cell: ({ row }) => <div>{row.getValue("ticket_no")}</div>,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.getValue("title")}>
          {truncateText(row.getValue("title"), 30)}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "facilityName",
      header: "Facility",
      cell: ({ row }) => <div>{row.getValue("facilityName")}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "raisedBy",
      header: "Raised By",
      cell: ({ row }) => <div>{row.getValue("raisedBy") || "N/A"}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant="outline"
            className={
              status === "open"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : status === "in progress"
                  ? "bg-orange-100 text-orange-800 border-orange-200"
                  : status === "pending"
                    ? "bg-gray-100 text-gray-800 border-gray-200"
                    : "bg-green-100 text-green-800 border-green-200"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        const date = new Date(createdAt);
        return (
          <div title={date.toLocaleString()}>
            {date.toLocaleDateString(undefined, { 
              year: "numeric", 
              month: "short", 
              day: "numeric" 
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "searchField",
      header: "Search Field",
      enableHiding: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const ticket = row.original;
        const status = ticket.status;
        
        return (
          <div className="flex items-center space-x-2">
            {/* Actions for OPEN tickets */}
            {status === "open" && (
              <Button
                variant="default"
                size="sm"
                onClick={(e) => handleBeginWork(ticket.id, ticket.ticket_no, e)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Begin Work
              </Button>
            )}
            
            {/* Actions for IN PROGRESS tickets - NOW WITH DROPDOWN */}
            {status === "in progress" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Update Status
                    <Clock className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem 
                    onClick={(e) => handleUpdateStatus(ticket.id, "resolved", e)}
                    className="cursor-pointer flex items-center text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => handleUpdateStatus(ticket.id, "pending", e)}
                    className="cursor-pointer flex items-center text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Pending
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Actions for PENDING tickets */}
            {status === "pending" && (
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={(e) => handleReopen(ticket.id, e)}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}
            
            {/* Actions for RESOLVED tickets */}
            {status === "resolved" && (
              <div className="flex items-center">
                <span className="text-sm text-green-600 font-medium flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Completed
                </span>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  // Create filter options for the DataTable
  const filterOptions = {
    label: "Filter by status",
    options: [
      { label: "All Statuses", value: "all" },
      ...allStatuses.map((status) => ({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      })),
    ],
    defaultValue: statusFilter,
    onFilterChange: (value: string) => setStatusFilter(value),
  };

  return (
    <>
      <DataTable
        variant="tech"
        columns={columns}
        data={dataWithSearchField}
        title="Tickets"
        subtitle=""
        searchPlaceholder="Search tickets..."
        emptyStateMessage="No tickets found with the selected filter"
        emptyStateDescription="Try changing your filter or check back later"
        defaultSorting={[{ id: 'createdAt', desc: true }]}
        filterOptions={filterOptions}
        onRowClick={handleViewTicket}
        loading={loading}
        totalItems={tickets.length}
      />
      
      {/* Ticket details dialog */}
      {selectedTicket && (
        <TechTicketDetails
          isOpen={isTicketDialogOpen}
          onOpenChange={setIsTicketDialogOpen}
          ticket={selectedTicket}
          onUpdate={handleTicketUpdate}
        />
      )}
    </>
  );
}

export default TechTickets;
