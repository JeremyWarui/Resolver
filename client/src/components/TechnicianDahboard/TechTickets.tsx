import { useState, useMemo, Dispatch, SetStateAction } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  MoreHorizontal,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  AlertCircle,
  Printer,
  PlayCircle,
  CheckCircle,
  Clock,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Import hooks
import useGraphQLTechnicianTickets from "@/hooks/useGraphQLTechnicianTickets";
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
  // Table state and filters
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true } // Default sorting by creation date in descending order (most recent first)
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: true,
    title: true,
    raisedBy: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    description: false,
    facilityName: true,
    priority: true,
    actions: true,
    // Hide section and assignedTo since all tickets are from same section and assigned to current user
    section: false,
    assignedTo: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState("");

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
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
  
  const totalTickets = tickets.length;
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

  // Handle Begin Work button click
  const handleBeginWork = async (ticketId: number, ticketNo: string) => {
    try {
      // In a real app, this would call the updateTicket function
      // await updateTicket({ id: ticketId, status: "in progress" });
      
      // For demo purposes, just show a toast notification
      toast.success(`Started work on #${ticketNo}`, {
        description: "Ticket status changed to 'In Progress'",
      });
      
      // In a real app, this would refresh the tickets list
      // But for this demo, we'll just log the action
      console.log(`Started work on ticket ${ticketId}`);
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    }
  };

  // Handle Mark as Resolved button click
  const handleMarkResolved = async (ticketId: number) => {
    try {
      toast.success(`Resolved ticket #${ticketId}`, {
        description: "Ticket status changed to 'Resolved'",
      });
      console.log(`Marked ticket ${ticketId} as resolved`);
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    }
  };

  // Handle Mark as Pending button click
  const handleMarkPending = async (ticketId: number, reason?: string) => {
    try {
      toast.success(`Marked ticket #${ticketId} as pending`, {
        description: reason ? `Reason: ${reason}` : "Waiting for additional resources",
      });
      console.log(`Marked ticket ${ticketId} as pending`);
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating ticket status:", error);
    }
  };

  // Handle Reopen button click (for pending tickets)
  const handleReopen = async (ticketId: number) => {
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
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Ticket ID</span>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="p-0 h-4 w-4"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ),
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
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Status</span>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="p-0 h-4 w-4"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ),
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
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Created</span>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="p-0 h-4 w-4"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ),
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
          <div className="flex items-center">
            {/* Main action area with status-specific buttons */}
            <div className="flex-1">
              {/* Actions for OPEN tickets */}
              {status === "open" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleBeginWork(ticket.id, ticket.ticket_no)}
                  className="bg-blue-600 hover:bg-blue-700 w-[140px]"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Begin Work
                </Button>
              )}
              
              {/* Actions for IN PROGRESS tickets */}
              {status === "in progress" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 w-[140px]"
                    >
                      Update Status
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuItem
                      onClick={() => handleMarkResolved(ticket.id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Resolved
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleMarkPending(ticket.id)}
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Mark as Pending
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Actions for PENDING tickets */}
              {status === "pending" && (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 w-[140px]"
                  onClick={() => handleReopen(ticket.id)}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Resume Work
                </Button>
              )}
              
              {/* Actions for RESOLVED tickets */}
              {status === "resolved" && (
                <div className="flex items-center h-9 pl-3 w-[140px]">
                  <span className="text-sm text-green-600 font-medium flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Completed
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "view",
      header: "View",
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.info(`Viewing details for ticket #${ticket.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  // Handle search input changes
  const handleSearch = (value: string) => {
    setSearchValue(value);
    table.getColumn("searchField")?.setFilterValue(value.toLowerCase());
  };

  // Initialize the table
  const table = useReactTable({
    data: dataWithSearchField,
    columns,
    manualPagination: true,
    pageCount: Math.ceil(totalTickets / pageSize),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility: {
        ...columnVisibility,
        searchField: false,
      },
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div className="flex-1">
            <h3 className="text-lg font-medium">Your Assigned Tickets</h3>
            <p className="text-sm text-muted-foreground">
              Manage tickets assigned to you
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search tickets..."
              value={searchValue}
              onChange={(event) => handleSearch(event.target.value)}
              className="max-w-sm"
            />
            <Select
              onValueChange={(value) => {
                setStatusFilter(value);
                setPageIndex(0);
              }}
              value={statusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {allStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading your assigned tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center bg-gray-50 rounded-md border border-dashed">
            <p className="text-muted-foreground text-lg mb-2">
              No tickets found with the selected filter
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Try changing your filter or check back later
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                {totalTickets} ticket(s) found.
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex(pageIndex - 1)}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center justify-center text-sm font-medium">
                  Page {pageIndex + 1} of {Math.max(1, Math.ceil(totalTickets / pageSize))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex(pageIndex + 1)}
                  disabled={pageIndex + 1 >= Math.ceil(totalTickets / pageSize) || totalTickets === 0}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default TechTickets;
