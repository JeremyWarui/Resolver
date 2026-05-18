import { useState, useEffect, useMemo } from 'react';
import {
  type ColumnDef, type ColumnFiltersState, type SortingState, type VisibilityState,
  flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight, Plus, Layers, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { departmentsService, campusesService, type Department, type Campus } from '@/api/services/organizationsService';

function DeptForm({ dept, campuses, onSuccess, onClose }: {
  dept: Department | null;
  campuses: Campus[];
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(dept?.name ?? '');
  const [code, setCode] = useState(dept?.code ?? '');
  const [campusId, setCampusId] = useState<string>(String(dept?.campus ?? ''));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campusId) { toast.error('Please select a campus'); return; }
    setSaving(true);
    try {
      if (dept) {
        await departmentsService.updateDepartment(dept.id, { name, code, campus: Number(campusId) });
        toast.success('Department updated');
      } else {
        await departmentsService.createDepartment({ name, code, campus: Number(campusId) });
        toast.success('Department created');
      }
      onSuccess();
    } catch {
      toast.error('Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Campus</Label>
        <Select value={campusId} onValueChange={setCampusId}>
          <SelectTrigger><SelectValue placeholder="Select campus" /></SelectTrigger>
          <SelectContent>
            {campuses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Department Name</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Department name" required />
      </div>
      <div className="space-y-2">
        <Label>Code</Label>
        <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. ENG-DEPT" required />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-[#0078d4] hover:bg-[#106ebe]">
          {saving ? 'Saving...' : dept ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

const DepartmentsPage = () => {
  const [depts, setDepts] = useState<Department[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, campusRes] = await Promise.all([
        departmentsService.getDepartments(),
        campusesService.getCampuses(),
      ]);
      setDepts(deptRes);
      setCampuses(campusRes);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const data = useMemo(() => depts.map(d => ({
    ...d,
    campusNames: ((d as any).campuses ?? []).map((c: any) => c.name).join(', ') || '—',
    hodNames: ((d as any).heads_of_department ?? []).map((h: any) => `${h.hod.name} (${h.campus})`).join('; ') || '—',
    searchField: `${d.name.toLowerCase()} ${d.code.toLowerCase()} ${((d as any).campuses ?? []).map((c: any) => c.name.toLowerCase()).join(' ')}`,
  })), [depts]);

  const columns: ColumnDef<Department & { campusName: string; hodName: string; searchField: string }>[] = [
    { accessorKey: 'id', header: 'ID', cell: ({ row }) => <div>{row.getValue('id')}</div> },
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
    { accessorKey: 'code', header: 'Code', cell: ({ row }) => <div>{row.getValue('code')}</div> },
    {
      accessorKey: 'campusNames',
      header: 'Campuses',
      cell: ({ row }) => {
        const campuses = (row.original as any).campuses ?? [];
        return (
          <div className="flex flex-wrap gap-1">
            {campuses.length > 0
              ? campuses.map((c: any) => (
                  <Badge key={c.id} variant="outline" className="text-xs">{c.code}</Badge>
                ))
              : <span className="text-gray-400">—</span>
            }
          </div>
        );
      },
    },
    {
      accessorKey: 'hodNames',
      header: 'HODs',
      cell: ({ row }) => {
        const hods = (row.original as any).heads_of_department ?? [];
        return (
          <div className="space-y-0.5">
            {hods.length > 0
              ? hods.map((h: any, i: number) => (
                  <div key={i} className="text-xs text-gray-600">
                    <span className="font-medium">{h.hod.name}</span>
                    <span className="text-gray-400 ml-1">({h.campus.replace(' Campus', '')})</span>
                  </div>
                ))
              : <span className="text-gray-400 text-xs">Unassigned</span>
            }
          </div>
        );
      },
    },
    { accessorKey: 'searchField', header: 'Search', enableHiding: true },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const dept = row.original as Department;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setEditing(dept); setIsFormOpen(true); }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={async () => {
                if (!window.confirm(`Delete "${dept.name}"?`)) return;
                try {
                  await departmentsService.deleteDepartment(dept.id);
                  toast.success('Department deleted');
                  fetchData();
                } catch { toast.error('Failed to delete department'); }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, columnFilters, columnVisibility: { ...columnVisibility, searchField: false }, pagination: { pageIndex, pageSize } },
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <Card className="w-full pt-7">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Layers className="h-6 w-6 mr-2" />
            Departments
          </CardTitle>
          <Button size="sm" className="bg-[#0078d4] hover:bg-[#106ebe] flex items-center gap-1" onClick={() => { setEditing(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center py-4">
            <Input
              placeholder="Search by name, code or campus..."
              value={searchValue}
              onChange={e => { setSearchValue(e.target.value); table.getColumn('searchField')?.setFilterValue(e.target.value.toLowerCase()); }}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table.getAllColumns().filter(c => c.id !== 'actions' && c.id !== 'searchField').map(col => (
                  <DropdownMenuCheckboxItem key={col.id} className="capitalize" checked={col.getIsVisible()} onCheckedChange={v => col.toggleVisibility(!!v)}>
                    {col.id}
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
                    {hg.headers.map(h => (
                      <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Loading...</TableCell></TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No departments found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">{depts.length} department(s)</div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPageIndex(0); }} className="h-8 w-[70px] rounded border px-2">
                  {[5, 10, 15, 20].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <ChevronLeft className="h-4 w-4 mr-1" />Previous
              </Button>
              <span className="text-sm font-medium">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next<ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={open => { setIsFormOpen(open); if (!open) setEditing(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
          <DeptForm
            dept={editing}
            campuses={campuses}
            onSuccess={() => { setIsFormOpen(false); setEditing(null); fetchData(); }}
            onClose={() => { setIsFormOpen(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentsPage;
