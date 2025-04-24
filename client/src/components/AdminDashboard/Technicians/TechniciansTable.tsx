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
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Plus,
} from "lucide-react";

// Import GraphQL hook instead of service
import useGraphQLTechnicians from "@/hooks/useGraphQLTechnicians";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the technician type
export type Technician = {
  id: string;
  technician_no: string;
  name: string;
  phone: string;
  username: string;
  section: string;
  availability: "available" | "busy" | "off-duty";
  completedTasks: number;
  assignedTasks: number;
  email: string;
  specialization: string;
  joinDate: string;
};

// List of availability statuses
const availabilityOptions = ["available", "busy", "off-duty"];

// List of all sections - this ensures sections are always available in the dropdown
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

function TechniciansTable() {
  // State for sorting, filtering, and column visibility
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: true,
    name: true,
    section: true,
    availability: true,
    completedTasks: false,
    assignedTasks: false,
    email: true,
    // Hide other columns by default
    joinDate: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState("");
  
  // Pagination and filters state
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>("all");
  const [sectionFilter, setSectionFilter] = useState<string | null>("all");
  
  // Get sorted field and direction from the sorting state
  const sortField = sorting.length > 0 ? sorting[0].id : undefined;
  const sortDirection = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined;

  // Use GraphQL hook to fetch technicians
  const { 
    technicians, 
    totalTechnicians, 
    loading: isLoading
  } = useGraphQLTechnicians({
    page: pageIndex,
    pageSize,
    availability: availabilityFilter === "all" ? null : availabilityFilter,
    section: sectionFilter === "all" ? null : sectionFilter,
    sortField,
    sortDirection
  });

  // Add a searchable field to each technician that combines ID and name
  const dataWithSearchField = useMemo(() => {
    return technicians.map((tech) => ({
      ...tech,
      searchField: `${tech.technician_no.toLowerCase()} ${tech.name.toLowerCase()}`,
    }));
  }, [technicians]);

  // Define columns in the specified order
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "technician_no", // Changed from id to technician_no
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Tech ID</span>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="p-0 h-4 w-4"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => <div>{row.getValue("technician_no")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Name</span>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="p-0 h-4 w-4"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "section",
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
      cell: ({ row }) => <div>{row.getValue("section")}</div>,
    },
    {
      accessorKey: "availability",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Availability</span>
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
        const availability = row.getValue("availability") as string;
        return (
          <Badge
            variant="outline"
            className={
              availability === "available"
                ? "bg-green-100 text-green-800 border-green-200"
                : availability === "busy"
                  ? "bg-orange-100 text-orange-800 border-orange-200"
                  : "bg-gray-100 text-gray-800 border-gray-200"
            }
          >
            {availability}
          </Badge>
        );
      },
    },
    {
      accessorKey: "completedTasks",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Completed</span>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="p-0 h-4 w-4"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("completedTasks")}</div>
      ),
    },
    {
      accessorKey: "assignedTasks",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Assigned</span>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="p-0 h-4 w-4"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("assignedTasks")}</div>
      ),
    },
    // Hidden columns by default
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
      enableSorting: false,
    },

    {
      accessorKey: "specialization",
      header: "Specialization",
      cell: ({ row }) => <div>{row.getValue("specialization")}</div>,
      enableSorting: false,
    },
    // Hidden column for search
    {
      accessorKey: "searchField",
      header: "Search Field",
      enableHiding: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const technician = row.original;

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
                onClick={() => alert(`View details for ${technician.name}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Clock className="mr-2 h-4 w-4" />
                  Change availability
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {availabilityOptions.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() =>
                        alert(
                          `Changed ${technician.name}'s availability to ${status}`
                        )
                      }
                    >
                      {status === "available" ? (
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      ) : status === "busy" ? (
                        <Clock className="mr-2 h-4 w-4 text-orange-600" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                      )}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => alert(`Delete ${technician.name}`)}
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

  // Initialize table
  const table = useReactTable({
    data: dataWithSearchField,
    columns,
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(totalTechnicians / pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility: {
        ...columnVisibility,
        searchField: false, // Always hide the search field column
      },
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  // Handle page change
  const goToPage = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  // Loading state indicator
  if (isLoading && technicians.length === 0) {
    return (
      <Card className="w-full pt-7">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Technicians
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p>Loading technicians data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full pt-7">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Technicians
        </CardTitle>
        <Button
          size="sm"
          className="flex items-center gap-1 bg-[#0078d4] hover:bg-[#106ebe]"
          onClick={() => alert("Add new technician")}
        >
          {" "}
          <Plus className="h-4 w-4" />
          Add Technician
        </Button>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center py-4">
          <Input
            placeholder="Search by ID or name..."
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
              onValueChange={(value) => {
                setAvailabilityFilter(value);
                setPageIndex(0); // Reset to first page when filter changes
              }}
              value={availabilityFilter || "all"}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by availability">
                  {availabilityFilter === "all" || !availabilityFilter ? "All Statuses" : 
                   availabilityFilter.charAt(0).toUpperCase() + availabilityFilter.slice(1)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {availabilityOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
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
                .map((column) => {
                  return (
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
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
              {table.getRowModel().rows?.length ? (
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
              {totalTechnicians} technician(s) found.
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
              Page {pageIndex + 1} of {Math.ceil(totalTechnicians / pageSize)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pageIndex + 1)}
              disabled={pageIndex + 1 >= Math.ceil(totalTechnicians / pageSize)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TechniciansTable;
