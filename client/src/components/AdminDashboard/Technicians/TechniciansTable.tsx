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
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Users,
  Plus,
} from "lucide-react";

// Import REST API hooks
import { useSharedData } from '@/contexts/SharedDataContext';
import TechnicianForm from './TechnicianForm';
import TechnicianDetails from './TechnicianDetails';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Technician } from "@/types";

function TechniciansTable() {
  // Get technicians from shared context (instant - no API call)
  const { technicians, techniciansLoading, refetchTechnicians } = useSharedData();
  const totalTechnicians = technicians.length;

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
  const [sectionFilter, setSectionFilter] = useState<string | null>("all");
  
  // Get sections from shared context for section names
  const { sections } = useSharedData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Add a searchable field to each technician that combines ID and name
  const dataWithSearchField = useMemo(() => {
    return technicians.map((tech) => ({
      ...tech,
      name: `${tech.first_name} ${tech.last_name}`,
      searchField: `${tech.id} ${tech.first_name} ${tech.last_name} ${tech.email}`.toLowerCase(),
      sectionNames: tech.sections.map(sectionId => {
        const section = sections.find(s => s.id === sectionId);
        return section?.name || '';
      }).filter(Boolean).join(', ')
    }));
  }, [technicians, sections]);

  // Define columns in the specified order
  const columns: ColumnDef<Technician & { name: string; searchField: string; sectionNames: string }>[] = [
    {
      accessorKey: "id",
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
      accessorKey: "sectionNames",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Sections</span>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()}
            className="p-0 h-4 w-4"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => <div>{row.getValue("sectionNames") || 'N/A'}</div>,
    },
    // Hidden columns by default
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
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
          <Button
            variant="ghost"
            onClick={() => { setSelectedTechnician(technician); setIsDetailsOpen(true); }}
            className="h-8 px-3"
          >
            View
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
  if (techniciansLoading && technicians.length === 0) {
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
          onClick={() => setIsFormOpen(true)}
        >
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
                {sections.map((section) => (
                  <SelectItem key={section.id} value={String(section.id)}>
                    {section.name}
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
        <TechnicianForm isOpen={isFormOpen} onOpenChange={() => { setIsFormOpen(false); setSelectedTechnician(null); }} onSuccess={() => { setIsFormOpen(false); refetchTechnicians(); }} technician={null} />
        {selectedTechnician && (
          <TechnicianDetails isOpen={isDetailsOpen} onOpenChange={(open: boolean) => { setIsDetailsOpen(open); if (!open) setSelectedTechnician(null); }} technician={selectedTechnician} onUpdated={() => refetchTechnicians()} />
        )}
      </CardContent>
    </Card>
  );
}

export default TechniciansTable;
