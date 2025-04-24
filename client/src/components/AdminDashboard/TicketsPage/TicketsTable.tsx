import { useState, useMemo } from "react";
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
  UserPlus,
  Printer,
  Trash2,
  AlertCircle,
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

// Import GraphQL hook instead of services
import useGraphQLTickets from "@/hooks/useGraphQLTickets";
import useGraphQLTechnicians from "@/hooks/useGraphQLTechnicians";

const allStatuses = [
  "open",
  "assigned",
  "in progress",
  "pending",
  "resolved",
];

// Add constant arrays for all sections and all technicians based on data.json
const allSections = [
  "HVAC",
  "IT",
  "Plumbing", 
  "Electrical",
  "Structural",
  "Mechanical",
  "Kitchen",
  "Grounds",
  "Security"
];

function AllTicketsTable() {
  // Table state and filters
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'id', desc: true } // Default sorting by ID in descending order
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: true,
    title: true,
    section: true,
    raisedBy: true,
    status: true,
    createdAt: true,
    assignedTo: true,
    updatedAt: true,
    description: false,
    facility: false,
    priority: false,
    actions: true,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState("");

  // Pagination state for server side pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | null>("all");
  const [sectionFilter, setSectionFilter] = useState<string | null>("all");
  const [technicianFilter, setTechnicianFilter] = useState<string | null>("all");

  // Use GraphQL hooks instead of fetching directly
  const { 
    tickets, 
    totalTickets, 
    sections, 
    loading: ticketsLoading 
  } = useGraphQLTickets({
    page: pageIndex,
    pageSize,
    status: statusFilter === "all" ? null : statusFilter,
    section: sectionFilter === "all" ? null : sectionFilter,
    technician: technicianFilter === "all" ? null : technicianFilter,
    sortField: 'id', // Sort by ID
    sortDirection: 'desc' // Sort in descending order
  });

  // Use GraphQL hooks to fetch technicians
  const { 
    technicians: allTechniciansData,
    loading: techniciansLoading 
  } = useGraphQLTechnicians({
    pageSize: 100, // Get a large batch of technicians
  });

  // Extract all technician names from the fetched data
  const allAvailableTechnicians = useMemo(() => {
    return allTechniciansData.map(tech => tech.name);
  }, [allTechniciansData]);

  // Build a lookup map from section id to section name
  const sectionMap = useMemo(() => {
    return sections.reduce<Record<string, string>>((map, section) => {
      map[section.id] = section.name;
      return map;
    }, {});
  }, [sections]);

  // Add a searchable field to each ticket that combines ID and title
  const dataWithSectionNames = useMemo(() => {
    return tickets.map((ticket) => ({
      ...ticket,
      sectionName: sectionMap[ticket.section] || "Unknown",
      searchField: `${String(ticket.id).toLowerCase()} ${ticket.title.toLowerCase()}`,
    }));
  }, [tickets, sectionMap]);

  // Unique values for filters (now using ticket's sectionName if needed)
  // const uniqueSections = useMemo(() => {
  //   return [
  //     ...new Set(dataWithSectionNames.map((ticket) => ticket.sectionName)),
  //   ];
  // }, [dataWithSectionNames]);

  const uniqueTechnicians = useMemo(() => {
    return [
      ...new Set(dataWithSectionNames.map((ticket) => ticket.assignedTo)),
    ];
  }, [dataWithSectionNames]);
  
  const uniqueUsers = useMemo(() => {
    return [
      ...new Set(
        dataWithSectionNames
          .map((ticket) => ticket.raisedBy)
          .filter((value): value is string => Boolean(value))
      ),
    ];
  }, [dataWithSectionNames]);

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // Define table columns
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
          {truncateText(row.getValue("title"), 20)}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div
          className="max-w-[300px] truncate"
          title={row.getValue("description") || "N/A"}
        >
          {row.getValue("description")
            ? truncateText(row.getValue("description"), 20)
            : "N/A"}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "facility",
      header: "Facility",
      cell: ({ row }) => <div>{row.getValue("facility")}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "sectionName",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Section</span>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="p-0 h-4 w-4"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => <div>{row.getValue("sectionName")}</div>,
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
                : status === "assigned"
                  ? "bg-purple-100 text-purple-800 border-purple-200"
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
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        return (
          <Badge
            variant="outline"
            className={
              priority === "high"
                ? "bg-red-100 text-red-800 border-red-200"
                : priority === "medium"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : "bg-green-100 text-green-800 border-green-200"
            }
          >
            {priority}
          </Badge>
        );
      },
      enableSorting: false,
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
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        return (
          <div title={date.toLocaleString()}>
            {diffInHours < 24
              ? diffInHours < 1
                ? `${Math.floor(diffInMs / (1000 * 60))} minutes ago`
                : `${Math.floor(diffInHours)} hours ago`
              : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
          </div>
        );
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => <div>{row.getValue("assignedTo")}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Updated</span>
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
        const updatedAt = row.original.updatedAt;
        if (!updatedAt) return <div>N/A</div>;
        const date = new Date(updatedAt);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        return (
          <div title={date.toLocaleString()}>
            {diffInHours < 24
              ? diffInHours < 1
                ? `${Math.floor(diffInMs / (1000 * 60))} minutes ago`
                : `${Math.floor(diffInHours)} hours ago`
              : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
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
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => alert(`View details for ticket ${ticket.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => alert(`Edit ticket ${ticket.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit ticket
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {allAvailableTechnicians.map((tech) => (
                    <DropdownMenuItem
                      key={tech}
                      onClick={() =>
                        alert(`Assigned ticket ${ticket.id} to ${tech}`)
                      }
                    >
                      {tech}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Change status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {allStatuses.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() =>
                        alert(`Changed ticket ${ticket.id} status to ${status}`)
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => alert(`Print ticket ${ticket.id}`)}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => alert(`Delete ticket ${ticket.id}`)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Handle search input changes
  const handleSearch = (value: string) => {
    setSearchValue(value);
    table.getColumn("searchField")?.setFilterValue(value.toLowerCase());
  };

  // Initialize the table using manual pagination so that page change triggers a refetch.
  const table = useReactTable({
    data: dataWithSectionNames,
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
    // Note: getPaginationRowModel is still used to easily render UI controls.
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility: {
        ...columnVisibility,
        searchField: false, // Always hide search field column
      },
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  // Handle page change (when clicking previous/next)
  const goToPage = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  // Determine if we're loading data
  const loading = ticketsLoading || techniciansLoading;

  return (
    <Card className="w-full pt-7">
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center py-4">
          <Input
            placeholder="Search by ID or title..."
            value={searchValue}
            onChange={(event) => handleSearch(event.target.value)}
            className="max-w-sm"
          />
          <div className="flex flex-col gap-4 md:flex-row">
            <Select
              onValueChange={(value) => {
                setSectionFilter(value);
                setPageIndex(0); // Reset to first page when filter changes
              }}
              value={sectionFilter || "all"}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by section">
                  {sectionFilter === "all" || !sectionFilter ? "All Sections" : sectionFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {allSections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) =>
                table
                  .getColumn("raisedBy")
                  ?.setFilterValue(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => {
                setStatusFilter(value === "all" ? "" : value);
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status">
                  {statusFilter || "All Statuses"}{" "}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {allStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) =>
                table
                  .getColumn("assignedTo")
                  ?.setFilterValue(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                {allAvailableTechnicians.length > 0 
                  ? allAvailableTechnicians.map((technician) => (
                    <SelectItem key={technician} value={technician}>
                      {technician}
                    </SelectItem>
                  ))
                  : uniqueTechnicians.map((technician) => (
                    <SelectItem key={technician} value={technician}>
                      {technician}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    column.id !== "actions" && column.id !== "searchField"
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <>
            <div className="rounded-sm border">
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
              <div className="flex items-center space-x-6">
                <div className="text-sm text-muted-foreground">
                  {totalTickets} ticket(s) found.
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setPageIndex(0); // Reset to first page on pageSize change
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[5, 10, 15, 20].map((size) => (
                        <SelectItem key={size} value={`${size}`}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pageIndex - 1)}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center justify-center text-sm font-medium">
                  Page {pageIndex + 1} of {Math.ceil(totalTickets / pageSize)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pageIndex + 1)}
                  disabled={pageIndex + 1 >= Math.ceil(totalTickets / pageSize)}
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

export default AllTicketsTable;
