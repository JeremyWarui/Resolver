import { flexRender, type Table as TableType, type ColumnDef } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RenderTableContentProps<TData, TValue = unknown> {
  table: TableType<TData>;
  columns: ColumnDef<TData, TValue>[];
  onRowClick?: (row: TData) => void;
  isAdminVariant: boolean;
  actualTotalItems: number;
  pageSize: number;
  pageIndex: number;
  handlePageSizeChange: (size: number) => void;
  handlePageChange: (index: number) => void;
  loading: boolean;
  data: TData[];
  emptyStateMessage: string;
  emptyStateDescription: string;
}

export function RenderTableContent<TData, TValue = unknown>({
  table,
  columns,
  onRowClick,
  actualTotalItems,
  pageSize,
  pageIndex,
  handlePageSizeChange,
  handlePageChange,
  loading,
  emptyStateMessage,
  emptyStateDescription,
}: RenderTableContentProps<TData, TValue>) {
  if (loading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  return (
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
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
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
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-lg font-medium text-muted-foreground">
                      {emptyStateMessage}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {emptyStateDescription}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-6">
          <div className="text-sm text-muted-foreground">
            {actualTotalItems} ticket(s) found.
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
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
            onClick={() => handlePageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center justify-center text-sm font-medium">
            Page {pageIndex + 1} of {Math.ceil(actualTotalItems / pageSize) || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pageIndex + 1)}
            disabled={pageIndex + 1 >= Math.ceil(actualTotalItems / pageSize)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </>
  );
}
