import { useState, useMemo } from 'react';
import {
  type ColumnDef, type ColumnFiltersState, type SortingState, type VisibilityState,
  getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, useReactTable,
} from '@tanstack/react-table';
import { Layers, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { departmentsService } from '@/api/services/organizationsService';
import { useSharedData } from '@/contexts/SharedDataContext';
import { AdminResourceTable } from '@/components/Common/AdminResourceTable';
import { useSortableColumn } from '@/hooks/useSortableColumn';
import { handleDRFError } from '@/utils/handleDRFError';
import type { Department } from '@/types/organisationStructure';

interface Campus {
  id: number;
  name: string;
  code: string;
  location?: string;
}

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
    } catch (error) {
      handleDRFError(error, { fallbackMessage: 'Failed to save department' });
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
  const { departments: depts, campuses, departmentsLoading, refetchDepartments } = useSharedData();
  const [searchValue, setSearchValue] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const nameHeader = useSortableColumn('Name');

  const data = useMemo(() => depts.map(d => ({
    ...d,
    campusNames: ((d as any).campuses ?? []).map((c: any) => c.name).join(', ') || '—',
    hodNames: ((d as any).heads_of_department ?? []).map((h: any) => `${h.hod.name} (${h.campus})`).join('; ') || '—',
    searchField: `${d.name.toLowerCase()} ${d.code.toLowerCase()} ${((d as any).campuses ?? []).map((c: any) => c.name.toLowerCase()).join(' ')}`,
  })), [depts]);

  const columns: ColumnDef<Department & { campusNames: string; hodNames: string; searchField: string }>[] = [
    { accessorKey: 'id', header: 'ID', cell: ({ row }) => <div>{row.getValue('id')}</div> },
    {
      accessorKey: 'name',
      header: nameHeader,
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
                  refetchDepartments();
                } catch (error) {
                  handleDRFError(error, { fallbackMessage: 'Failed to delete department' });
                }
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
    <>
      <AdminResourceTable
        icon={Layers}
        title="Departments"
        addLabel="Add Department"
        onAdd={() => { setEditing(null); setIsFormOpen(true); }}
        table={table}
        loading={departmentsLoading}
        emptyMessage="No departments found."
        itemCount={depts.length}
        searchValue={searchValue}
        onSearchChange={(value) => { setSearchValue(value); table.getColumn('searchField')?.setFilterValue(value.toLowerCase()); }}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPageIndex(0); }}
      />

      <Dialog open={isFormOpen} onOpenChange={open => { setIsFormOpen(open); if (!open) setEditing(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
          <DeptForm
            dept={editing}
            campuses={campuses}
            onSuccess={() => { setIsFormOpen(false); setEditing(null); refetchDepartments(); }}
            onClose={() => { setIsFormOpen(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DepartmentsPage;
