import { useState, useEffect, ReactNode } from "react";
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Define the table variants
type TableVariant = 'tech' | 'admin';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
  defaultSorting?: SortingState;
  defaultPageSize?: number;
  initialColumnVisibility?: VisibilityState;
  filterOptions?: { 
    label: string;
    options: { label: string; value: string }[];
    defaultValue?: string;
    onFilterChange: (value: string) => void;
  };
  additionalFilters?: ReactNode;
  variant?: TableVariant;
  onRowClick?: (row: TData) => void;
  totalItems?: number;
  loading?: boolean;
  manualPagination?: boolean;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title = "Data Table",
  subtitle = "Manage your data",
  searchPlaceholder = "Search...",
  emptyStateMessage = "No data found",
  emptyStateDescription = "Try changing your filter or check back later",
  defaultSorting = [],
  defaultPageSize = 10,
  initialColumnVisibility = {},
  filterOptions,
  additionalFilters,
  variant = 'tech',
  onRowClick,
  totalItems,
  loading = false,
  manualPagination = false,
  onPageChange,
  onPageSizeChange,
  onColumnVisibilityChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // Initialize column visibility with searchField hidden by default
  const defaultVisibility: VisibilityState = {
    searchField: false,
    ...initialColumnVisibility
  };
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultVisibility);
  
  // Callback when column visibility changes
  const handleColumnVisibilityChange = (visibility: VisibilityState) => {
    setColumnVisibility(visibility);
    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(visibility);
    }
  };
  
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Calculate actual total items for pagination
  const actualTotalItems = manualPagination ? (totalItems || 0) : data.length;
  
  // Initialize the table
  const table = useReactTable({
    data,
    columns,
    manualPagination,
    pageCount: manualPagination ? Math.ceil(actualTotalItems / pageSize) : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  // Sync table pageSize state with the component's pageSize state
  useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  // Reset page index when search value changes
  useEffect(() => {
    setPageIndex(0);
  }, [columnFilters]);

  // Handle search input changes
  const handleSearch = (value: string) => {
    setSearchValue(value);
    // Assuming we have a searchable column (usually named 'searchField')
    if (table.getColumn("searchField")) {
      table.getColumn("searchField")?.setFilterValue(value.toLowerCase());
    }
  };

  // Handle page changes with support for manual pagination
  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    
    if (manualPagination && onPageChange) {
      onPageChange(newPageIndex);
    }
  };

  // Handle page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page on page size change
    
    // Notify parent component if callback is provided
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };
  
  // Determine the style based on the variant
  const isAdminVariant = variant === 'admin';

  return (
    <Card className={`w-full ${isAdminVariant ? '' : 'shadow-sm'}`}>
      <CardContent className={isAdminVariant ? 'pt-7' : 'p-6'}>
        {!isAdminVariant && (
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <div className="flex-1">
              <h3 className="text-lg font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(event) => handleSearch(event.target.value)}
                className="max-w-sm"
              />
              
              {filterOptions && (
                <Select
                  onValueChange={filterOptions.onFilterChange}
                  defaultValue={filterOptions.defaultValue}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={filterOptions.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto sm:ml-0 px-3">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
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
          </div>
        )}

        {/* Admin variant filters */}
        {isAdminVariant && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center py-4">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => handleSearch(event.target.value)}
              className="max-w-sm"
            />
            
            <div className="flex flex-col gap-4 md:flex-row">
              {filterOptions && (
                <Select
                  onValueChange={filterOptions.onFilterChange}
                  defaultValue={filterOptions.defaultValue}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={filterOptions.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {/* Additional filters slot */}
              {additionalFilters}
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
                  .filter((column) => column.getCanHide())
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
        )}

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center bg-gray-50 rounded-md border border-dashed">
            <p className="text-muted-foreground text-lg mb-2">
              {emptyStateMessage}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {emptyStateDescription}
            </p>
          </div>
        ) : (
          <>
            <div className={`${isAdminVariant ? 'rounded-sm' : 'rounded-md'} border`}>
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
                        data-state={row.getIsSelected() ? "selected" : undefined}
                        className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                        onClick={() => onRowClick && onRowClick(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
            
            {/* Pagination UI with support for manual pagination */}
            <div className="flex items-center justify-between space-x-2 py-4">
              {isAdminVariant ? (
                <>
                  <div className="flex items-center space-x-6">
                    <div className="text-sm text-muted-foreground">
                      {actualTotalItems} ticket(s) found.
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">Rows per page</p>
                      <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                          const newPageSize = Number(value);
                          handlePageSizeChange(newPageSize);
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
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {actualTotalItems} {actualTotalItems === 1 ? 'item' : 'items'} found
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageIndex - 1)}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center justify-center text-sm font-medium">
                  Page {pageIndex + 1} of {Math.max(1, Math.ceil(actualTotalItems / pageSize))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageIndex + 1)}
                  disabled={pageIndex + 1 >= Math.ceil(actualTotalItems / pageSize) || actualTotalItems === 0}
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

export default DataTable;