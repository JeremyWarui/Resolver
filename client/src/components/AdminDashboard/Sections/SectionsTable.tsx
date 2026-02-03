import { useState, useMemo } from 'react';
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
} from '@tanstack/react-table';
import {
  ChevronDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
} from 'lucide-react';

import { useSharedData } from '@/contexts/SharedDataContext';
import SectionForm from './SectionForm';
import SectionDetails from './SectionDetails';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Section } from '@/types';

function SectionsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: true,
    name: true,
    description: true,
    technicians: true,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  // Get sections from shared context (instant - no API call)
  const { sections, sectionsLoading: loading, refetchSections: refetch } = useSharedData();
  const totalSections = sections.length;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const dataWithSearchField = useMemo(() => {
    return sections.map((s) => ({
      ...s,
      techniciansCount: s.technicians ? s.technicians.length : 0,
      searchField: `${String(s.id).toLowerCase()} ${s.name.toLowerCase()} ${String(s.description || '').toLowerCase()}`,
    }));
  }, [sections]);

  const columns: ColumnDef<Section & { techniciansCount: number; searchField: string }>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Section ID</span>
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="p-0 h-4 w-4">
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => <div>{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Name</span>
          <Button variant="ghost" onClick={() => column.toggleSorting()} className="p-0 h-4 w-4">
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <div className="text-sm text-gray-600">{row.getValue('description') || '—'}</div>,
    },
    {
      accessorKey: 'techniciansCount',
      header: 'Technicians',
      cell: ({ row }) => <div className="text-center">{row.getValue('techniciansCount')}</div>,
    },
    {
      accessorKey: 'searchField',
      header: 'Search Field',
      enableHiding: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const section = row.original as Section;
        return (
          <Button
            variant="ghost"
            onClick={() => { setSelectedSection(section); setIsDetailsOpen(true); }}
            className="h-8 px-3"
          >
            View
          </Button>
        );
      },
    },
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
    table.getColumn('searchField')?.setFilterValue(value.toLowerCase());
  };

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
    pageCount: Math.ceil(totalSections / pageSize) || 1,
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

  if (loading && sections.length === 0) {
    return (
      <Card className="w-full pt-7">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Sections
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p>Loading sections data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full pt-7">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          Sections
        </CardTitle>
        <Button size="sm" className="flex items-center gap-1 bg-[#0078d4] hover:bg-[#106ebe]" onClick={() => { setEditingSection(null); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center py-4">
          <Input placeholder="Search by ID or name..." value={searchValue} onChange={(e) => handleSearch(e.target.value)} className="max-w-sm" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().filter(c => c.id !== 'actions' && c.id !== 'searchField').map(column => (
                <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-sm border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(hg => (
                <TableRow key={hg.id}>
                  {hg.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex items-center space-x-6">
            <div className="text-sm text-muted-foreground">{totalSections} section(s) found.</div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select value={`${pageSize}`} onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }} className="h-8 w-[70px] rounded border px-2">
                {[5,10,15,20].map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center justify-center text-sm font-medium">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</div>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
      <SectionDetails isOpen={isDetailsOpen} onOpenChange={(open: boolean) => { setIsDetailsOpen(open); if (!open) setSelectedSection(null); }} section={selectedSection} onUpdated={() => refetch()} />
      <SectionForm isOpen={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingSection(null); }} onSuccess={() => { setIsFormOpen(false); setEditingSection(null); }} section={editingSection} />
    </Card>
  );
}

export default SectionsTable;
