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
  Calendar,
  AlertTriangle,
  CheckCircle,
  WrenchIcon,
  LockIcon,
  Building,
  Plus,
} from "lucide-react";

// Import GraphQL hook
import useGraphQLFacilities from "@/hooks/useGraphQLFacilities";

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

// Define the facility type
export type Facility = {
  id: string;
  name: string;
  type: string;
  status: "operational" | "maintenance" | "closed";
  openTickets: number;
  resolvedTickets: number;
  closedTickets: number;
};

// List of status options
const statusOptions = ["operational", "maintenance", "closed"];

// List of all facility types
const allFacilityTypes = [
  "Office",
  "Housing",
  "Industrial",
  "Mixed Use",
  "Conference",
  "Technical",
  "Parking",
  "Food Service",
  "Reception",
  "Landscape"
];

// Sample data for facilities - will be enhanced with GraphQL data
const facilitiesData: Facility[] = [
  {
    id: "FAC-001",
    name: "Main Building",
    type: "Office",
    status: "operational",
    openTickets: 3,
    resolvedTickets: 10,
    closedTickets: 2,
  },
  {
    id: "FAC-002",
    name: "Admin Block",
    type: "Office",
    status: "operational",
    openTickets: 2,
    resolvedTickets: 5,
    closedTickets: 1,
  },
  {
    id: "FAC-003",
    name: "Residential Area",
    type: "Housing",
    status: "maintenance",
    openTickets: 5,
    resolvedTickets: 2,
    closedTickets: 0,
  },
  {
    id: "FAC-004",
    name: "Workshop",
    type: "Industrial",
    status: "operational",
    openTickets: 1,
    resolvedTickets: 8,
    closedTickets: 3,
  },
  {
    id: "FAC-005",
    name: "Tower Block",
    type: "Mixed Use",
    status: "operational",
    openTickets: 4,
    resolvedTickets: 12,
    closedTickets: 4,
  },
  {
    id: "FAC-006",
    name: "Meeting Center",
    type: "Conference",
    status: "maintenance",
    openTickets: 2,
    resolvedTickets: 3,
    closedTickets: 1,
  },
  {
    id: "FAC-007",
    name: "IT Center",
    type: "Technical",
    status: "operational",
    openTickets: 3,
    resolvedTickets: 7,
    closedTickets: 2,
  },
  {
    id: "FAC-008",
    name: "Parking Garage",
    type: "Parking",
    status: "operational",
    openTickets: 1,
    resolvedTickets: 15,
    closedTickets: 5,
  },
  {
    id: "FAC-009",
    name: "Cafeteria",
    type: "Food Service",
    status: "operational",
    openTickets: 2,
    resolvedTickets: 6,
    closedTickets: 0,
  },
  {
    id: "FAC-010",
    name: "East Wing",
    type: "Office",
    status: "closed",
    openTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
  },
  {
    id: "FAC-011",
    name: "Main Entrance",
    type: "Reception",
    status: "operational",
    openTickets: 1,
    resolvedTickets: 4,
    closedTickets: 1,
  },
  {
    id: "FAC-012",
    name: "Exterior Grounds",
    type: "Landscape",
    status: "maintenance",
    openTickets: 3,
    resolvedTickets: 1,
    closedTickets: 0,
  },
];

function FacilitiesTable() {
  // State for sorting, filtering, and column visibility
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: true,
    name: true,
    type: true,
    status: true,
    openTickets: false,
    resolvedTickets: false,
    closedTickets: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>("all");

  // Use GraphQL hook to fetch facilities
  const { facilities: graphQLFacilities, loading } = useGraphQLFacilities();
  
  // Combine GraphQL facilities data with our extended facility data
  const facilities = useMemo(() => {
    // If we have GraphQL facilities data, enhance it with our additional properties
    if (graphQLFacilities.length > 0) {
      return graphQLFacilities.map(facility => {
        // Find matching facility in our sample data or create default values
        const existingFacility = facilitiesData.find(f => f.id === facility.id);
        
        return {
          ...facility,
          type: existingFacility?.type || "Office",
          status: existingFacility?.status || "operational",
          openTickets: existingFacility?.openTickets || Math.floor(Math.random() * 5),
          resolvedTickets: existingFacility?.resolvedTickets || Math.floor(Math.random() * 10) + 5,
          closedTickets: existingFacility?.closedTickets || Math.floor(Math.random() * 3)
        };
      });
    }
    
    // Fall back to sample data if GraphQL data is not available
    return facilitiesData;
  }, [graphQLFacilities]);
  
  // Get unique values for filter dropdowns
  const uniqueStatuses = useMemo(
    () => [...new Set(facilities.map((facility) => facility.status))],
    [facilities]
  );

  // Add a searchable field to each facility that combines ID and name
  const dataWithSearchField = useMemo(() => {
    // Filter facilities by type if a type filter is set
    const filteredFacilities = typeFilter && typeFilter !== "all" 
      ? facilities.filter(facility => facility.type === typeFilter)
      : facilities;
      
    return filteredFacilities.map((facility) => ({
      ...facility,
      searchField: `${facility.id.toLowerCase()} ${facility.name.toLowerCase()}`,
    }));
  }, [typeFilter, facilities]);

  // Define columns in the specified order
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Facility ID</span>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="p-0 h-4 w-4"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
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
              status === "operational"
                ? "bg-green-100 text-green-800 border-green-200"
                : status === "maintenance"
                  ? "bg-orange-100 text-orange-800 border-orange-200"
                  : "bg-red-100 text-red-800 border-red-200"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "openTickets",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Open Tickets</span>
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
        const tickets = row.getValue("openTickets") as number;
        return (
          <div
            className={`flex justify-center  ${
              tickets > 0 ? "text-amber-600 font-medium" : "text-gray-500"
            }`}
          >
            {tickets}
          </div>
        );
      },
    },
    {
      accessorKey: "resolvedTickets",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Resolved Tickets</span>
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
        const tickets = row.getValue("resolvedTickets") as number;
        return <div className="flex justify-center">{tickets}</div>;
      },
    },
    {
      accessorKey: "closedTickets",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Closed Tickets</span>
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
        <div className="flex justify-center">
          {row.getValue("closedTickets")}
        </div>
      ),
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
        const facility = row.original;

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
                onClick={() => alert(`View details for ${facility.name}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  alert(`Schedule maintenance for ${facility.name}`)
                }
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule maintenance
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Change status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {statusOptions.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() =>
                        alert(`Changed ${facility.name}'s status to ${status}`)
                      }
                    >
                      {status === "operational" ? (
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      ) : status === "maintenance" ? (
                        <WrenchIcon className="mr-2 h-4 w-4 text-orange-600" />
                      ) : (
                        <LockIcon className="mr-2 h-4 w-4 text-red-600" />
                      )}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => alert(`Delete ${facility.name}`)}
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
        searchField: false, // Always hide the search field column
      },
      rowSelection,
      pagination: {
        pageIndex: 0,
        pageSize: 10, // Show 10 rows per page
      },
    },
  });

  // Show loading state
  if (loading && facilities.length === 0) {
    return (
      <Card className="w-full pt-7">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Building className="h-6 w-6 mr-2" />
            Facilities
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p>Loading facilities data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full pt-7">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Building className="h-6 w-6 mr-2" />
          Facilities
        </CardTitle>
        <Button
          size="sm"
          className="flex items-center gap-1 bg-[#0078d4] hover:bg-[#106ebe]"
          onClick={() => alert("Add new facility")}
        >
          <Plus className="h-4 w-4" />
          Add Facility
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
                setTypeFilter(value);
                // Reset to first page when filter changes
                table.setPageIndex(0);
              }}
              value={typeFilter || "all"}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type">
                  {typeFilter === "all" || !typeFilter ? "All Types" : typeFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {allFacilityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) =>
                table
                  .getColumn("status")
                  ?.setFilterValue(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map((status) => (
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
              {table.getFilteredRowModel().rows.length} facility(ies) found.
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 15, 20].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
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
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
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

export default FacilitiesTable;
