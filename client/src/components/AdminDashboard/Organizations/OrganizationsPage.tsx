import { useState, useEffect, useMemo } from 'react';
import {
  type ColumnDef, type ColumnFiltersState, type SortingState, type VisibilityState,
  flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight, Plus, Building2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import organizationsService, { type Organization } from '@/api/services/organizationsService';

function OrgForm({ org, onSuccess, onClose }: { org: Organization | null; onSuccess: () => void; onClose: () => void }) {
  const [name, setName] = useState(org?.name ?? '');
  const [code, setCode] = useState(org?.code ?? '');
  const [orgType, setOrgType] = useState(org?.organization_type ?? '');
  const [hq, setHq] = useState(org?.headquarters ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (org) {
        await organizationsService.updateOrganization(org.id, { name, code, organization_type: orgType, headquarters: hq });
        toast.success('Organization updated');
      } else {
        await organizationsService.createOrganization({ name, code, organization_type: orgType, headquarters: hq });
        toast.success('Organization created');
      }
      onSuccess();
    } catch {
      toast.error('Failed to save organization');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Organization name" required />
      </div>
      <div className="space-y-2">
        <Label>Code</Label>
        <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. ORG-001" required />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Input value={orgType} onChange={e => setOrgType(e.target.value)} placeholder="e.g. University" />
      </div>
      <div className="space-y-2">
        <Label>Headquarters</Label>
        <Input value={hq} onChange={e => setHq(e.target.value)} placeholder="Location" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-[#0078d4] hover:bg-[#106ebe]">
          {saving ? 'Saving...' : org ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

const OrganizationsPage = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await organizationsService.getOrganizations();
      setOrgs(res.results);
    } catch {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrgs(); }, []);

  const data = useMemo(() => orgs.map(o => ({
    ...o,
    searchField: `${o.name.toLowerCase()} ${o.code.toLowerCase()}`,
  })), [orgs]);

  const columns: ColumnDef<Organization & { searchField: string }>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
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
    { accessorKey: 'code', header: 'Code', cell: ({ row }) => <div>{row.getValue('code')}</div> },
    { accessorKey: 'organization_type', header: 'Type', cell: ({ row }) => <div>{row.getValue('organization_type') || '—'}</div> },
    { accessorKey: 'headquarters', header: 'HQ', cell: ({ row }) => <div>{row.getValue('headquarters') || '—'}</div> },
    { accessorKey: 'searchField', header: 'Search', enableHiding: true },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const org = row.original as Organization;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setEditing(org); setIsFormOpen(true); }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={async () => {
                if (!window.confirm(`Delete "${org.name}"?`)) return;
                try {
                  await organizationsService.deleteOrganization(org.id);
                  toast.success('Organization deleted');
                  fetchOrgs();
                } catch { toast.error('Failed to delete'); }
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
            <Building2 className="h-6 w-6 mr-2" />
            Organizations
          </CardTitle>
          <Button size="sm" className="bg-[#0078d4] hover:bg-[#106ebe] flex items-center gap-1" onClick={() => { setEditing(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Add Organization
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center py-4">
            <Input
              placeholder="Search by name or code..."
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
                  <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No organizations found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">{orgs.length} organization(s)</div>
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
            <DialogTitle>{editing ? 'Edit Organization' : 'Add Organization'}</DialogTitle>
          </DialogHeader>
          <OrgForm
            org={editing}
            onSuccess={() => { setIsFormOpen(false); setEditing(null); fetchOrgs(); }}
            onClose={() => { setIsFormOpen(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationsPage;
