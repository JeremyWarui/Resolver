import { useState, useMemo, useEffect } from 'react';
import {
  type ColumnDef, type SortingState, type VisibilityState,
  getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, useReactTable,
} from '@tanstack/react-table';
import { Users, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getRoleAssignments, createRoleAssignment, deleteRoleAssignment, updateUser, createUser, deleteUser } from '@/lib/api/users';
import { getUsers } from '@/lib/api/users';
import { campusesService, departmentsService, sectionsService } from '@/lib/api/organizations';
import { AdminResourceTable } from '@/components/shared/data/AdminResourceTable';
import { useSortableColumn } from '@/hooks/useSortableColumn';
import { handleDRFError } from '@/utils/handleDRFError';
import type { User, UserRole, RoleAssignment, CreateRoleAssignmentPayload, CreateUserPayload } from '@/types';
import type { Campus, Department } from '@/types';

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'User',
  technician: 'Technician',
  hos: 'Head of Section',
  hod: 'Head of Department',
  manager: 'Manager',
  admin: 'Admin',
};

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  user: 'bg-gray-100 text-gray-600',
  technician: 'bg-blue-100 text-blue-700',
  hos: 'bg-purple-100 text-purple-700',
  hod: 'bg-orange-100 text-orange-700',
  manager: 'bg-teal-100 text-teal-700',
  admin: 'bg-red-100 text-red-700',
};

const ROLES_REQUIRING_SECTION: UserRole[] = ['technician', 'hos'];
const ROLES_REQUIRING_CAMPUS_DEPT: UserRole[] = ['hod'];
const ROLES_REQUIRING_DEPARTMENT: UserRole[] = ['manager'];

interface RoleAssignFormState {
  role: UserRole;
  campus_id: string;
  department_id: string;
  section_id: string;
  is_primary: boolean;
}

const EMPTY_RA_FORM: RoleAssignFormState = {
  role: 'user',
  campus_id: '',
  department_id: '',
  section_id: '',
  is_primary: false,
};

function RoleAssignmentModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<{ id: number; name: string }[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [form, setForm] = useState<RoleAssignFormState>(EMPTY_RA_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const needsSection = ROLES_REQUIRING_SECTION.includes(form.role);
  const needsCampusDept = ROLES_REQUIRING_CAMPUS_DEPT.includes(form.role);
  const needsDepartment = ROLES_REQUIRING_DEPARTMENT.includes(form.role);
  const needsCampus = needsSection || needsCampusDept;

  const fetchAssignments = async () => {
    setLoadingList(true);
    try {
      setAssignments(await getRoleAssignments(user.id));
    } catch {
      toast.error('Failed to load role assignments');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssignments();
    campusesService.getCampuses().then(setCampuses).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  // Load departments when campus changes
  useEffect(() => {
    if (!form.campus_id) {
      setDepartments([]);
      setSections([]);
      setForm(f => ({ ...f, department_id: '', section_id: '' }));
      return;
    }
    setLoadingDepts(true);
    departmentsService
      .getDepartments({ campus: Number(form.campus_id) })
      .then(setDepartments)
      .catch(() => {})
      .finally(() => setLoadingDepts(false));
    setForm(f => ({ ...f, department_id: '', section_id: '' }));
  }, [form.campus_id]);

  // Load sections when department changes (for technician/HOS)
  useEffect(() => {
    if (!form.department_id || !needsSection) {
      setSections([]);
      setForm(f => ({ ...f, section_id: '' }));
      return;
    }
    setLoadingSections(true);
    sectionsService
      .getSections({ department: Number(form.department_id) })
      .then(setSections)
      .catch(() => {})
      .finally(() => setLoadingSections(false));
    setForm(f => ({ ...f, section_id: '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.department_id, needsSection]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: CreateRoleAssignmentPayload = {
        role: form.role,
        is_primary: form.is_primary,
        campus_id: form.campus_id ? Number(form.campus_id) : null,
        department_id: form.department_id ? Number(form.department_id) : null,
        section_id: form.section_id ? Number(form.section_id) : null,
      };
      await createRoleAssignment(user.id, payload);
      toast.success('Role assignment added');
      setForm(EMPTY_RA_FORM);
      fetchAssignments();
    } catch (error) {
      handleDRFError(error, { fallbackMessage: 'Failed to add role assignment' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ra: RoleAssignment) => {
    setDeletingId(ra.id);
    try {
      await deleteRoleAssignment(user.id, ra.id);
      toast.success('Role assignment removed');
      fetchAssignments();
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { detail?: string } } };
      if (axiosError?.response?.status === 422 || axiosError?.response?.status === 400) {
        toast.error(axiosError.response?.data?.detail ?? 'Cannot delete this assignment.');
      } else {
        handleDRFError(error, { fallbackMessage: 'Failed to remove role assignment' });
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Role Assignments — {user.first_name} {user.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Current assignments */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Current Assignments</p>
            {loadingList ? (
              <div className="space-y-2">
                {[1, 2].map(i => <Skeleton key={i} className="h-9 w-full rounded-md" />)}
              </div>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No role assignments yet.</p>
            ) : (
              <ul className="space-y-2">
                {assignments.map(ra => (
                  <li key={ra.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE_STYLES[ra.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_LABELS[ra.role] ?? ra.role}
                    </span>
                    <span className="flex-1 text-muted-foreground truncate">
                      {[ra.campus_name, ra.department_name, ra.section_name].filter(Boolean).join(' / ') || 'Global'}
                    </span>
                    {ra.is_primary && (
                      <Badge variant="outline" className="text-xs shrink-0 border-primary text-primary">Primary</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0 text-red-400 hover:text-red-600 disabled:opacity-40"
                      disabled={ra.is_primary || deletingId === ra.id}
                      onClick={() => handleDelete(ra)}
                      title={ra.is_primary ? 'Cannot delete primary assignment' : 'Remove assignment'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Separator />

          {/* Add assignment form */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Add Assignment</p>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Role</Label>
                <Select
                  value={form.role}
                  onValueChange={v => setForm(f => ({ ...f, role: v as UserRole, campus_id: '', department_id: '', section_id: '' }))}
                >
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campus — shown for roles that need it */}
              {(needsCampus || needsDepartment) && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Campus {needsCampus ? '' : '(optional)'}</Label>
                  <Select value={form.campus_id} onValueChange={v => setForm(f => ({ ...f, campus_id: v }))}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select campus" /></SelectTrigger>
                    <SelectContent>
                      {campuses.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Department — shown when campus is selected */}
              {(needsCampus || needsDepartment) && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Department</Label>
                  <Select
                    value={form.department_id}
                    onValueChange={v => setForm(f => ({ ...f, department_id: v }))}
                    disabled={!form.campus_id || loadingDepts}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder={!form.campus_id ? 'Select campus first' : loadingDepts ? 'Loading…' : 'Select department'} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Section — only for technician / HOS */}
              {needsSection && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Section</Label>
                  <Select
                    value={form.section_id}
                    onValueChange={v => setForm(f => ({ ...f, section_id: v }))}
                    disabled={!form.department_id || loadingSections}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder={!form.department_id ? 'Select department first' : loadingSections ? 'Loading…' : 'Select section'} />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="ra-primary"
                  checked={form.is_primary}
                  onCheckedChange={checked => setForm(f => ({ ...f, is_primary: !!checked }))}
                />
                <Label htmlFor="ra-primary" className="text-xs cursor-pointer">
                  Set as primary assignment (replaces current primary role)
                </Label>
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" disabled={submitting} className="bg-primary hover:bg-primary/90">
                  {submitting ? 'Adding…' : 'Add Assignment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
}

const EMPTY_FORM: UserFormData = {
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  password: '',
};

function UserForm({ editing, onSuccess, onClose }: { editing: User | null; onSuccess: () => void; onClose: () => void }) {
  const [form, setForm] = useState<UserFormData>(
    editing ? { ...EMPTY_FORM, first_name: editing.first_name, last_name: editing.last_name, email: editing.email, username: editing.username } : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [prevEditing, setPrevEditing] = useState(editing);

  if (prevEditing !== editing) {
    setPrevEditing(editing);
    setForm(
      editing
        ? { ...EMPTY_FORM, first_name: editing.first_name, last_name: editing.last_name, email: editing.email, username: editing.username }
        : EMPTY_FORM
    );
  }

  const set = (key: keyof UserFormData, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      toast.error('First name, last name and email are required');
      return;
    }
    if (!editing && !form.password.trim()) {
      toast.error('Password is required for new users');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateUser(editing.id, {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
        });
        toast.success('User updated');
      } else {
        const payload: CreateUserPayload = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          password: form.password,
          ...(form.username.trim() ? { username: form.username.trim() } : {}),
        };
        await createUser(payload);
        toast.success('User created — use the role assignment button to assign a staff role');
      }
      onSuccess();
    } catch (error) {
      handleDRFError(error, { fallbackMessage: 'Failed to save user' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="First name" required />
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Last name" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@example.com" required />
      </div>
      {!editing && (
        <>
          <div className="space-y-2">
            <Label>Username <span className="text-muted-foreground text-xs">(optional — auto-generated if blank)</span></Label>
            <Input value={form.username} onChange={e => set('username', e.target.value)} placeholder="e.g. john.doe" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Minimum 8 characters" required />
          </div>
        </>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? 'Saving…' : editing ? 'Update' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}

type UserRow = User & { fullName: string; searchField: string };

const UsersPage = () => {
  'use no memo';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageSize, setPageSize] = useState(20);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [roleAssignTarget, setRoleAssignTarget] = useState<User | null>(null);

  const nameHeader = useSortableColumn('Name');
  const emailHeader = useSortableColumn('Email');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const resp = await getUsers();
      setUsers(resp.results);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const data: UserRow[] = useMemo(() => users.map(u => ({
    ...u,
    fullName: `${u.first_name} ${u.last_name}`.trim() || u.username,
    searchField: `${u.first_name} ${u.last_name} ${u.email} ${u.username} ${u.role}`.toLowerCase(),
  })), [users]);

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: 'fullName',
      header: nameHeader,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.getValue('fullName') as string}</p>
          <p className="text-xs text-gray-400">@{row.original.username}</p>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: emailHeader,
      cell: ({ row }) => <span className="text-sm">{row.getValue('email')}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.getValue('role') as UserRole;
        return (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE_STYLES[role] ?? 'bg-gray-100 text-gray-600'}`}>
            {ROLE_LABELS[role] ?? role}
          </span>
        );
      },
    },
    {
      accessorKey: 'campus_name',
      header: 'Campus',
      cell: ({ row }) => <span className="text-sm text-gray-600">{(row.getValue('campus_name') as string | null) ?? '—'}</span>,
    },
    {
      accessorKey: 'section_names',
      header: 'Sections',
      cell: ({ row }) => {
        const names = row.original.section_names ?? [];
        if (names.length === 0) return <span className="text-gray-400 text-sm">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {names.slice(0, 2).map((n, i) => (
              <Badge key={i} variant="outline" className="text-xs">{n}</Badge>
            ))}
            {names.length > 2 && <Badge variant="outline" className="text-xs">+{names.length - 2}</Badge>}
          </div>
        );
      },
    },
    { accessorKey: 'searchField', header: 'Search', enableHiding: true },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditing(user); setIsFormOpen(true); }} title="Edit user">
              <Pencil className="h-3.5 w-3.5 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-primary hover:text-primary/80"
              onClick={() => setRoleAssignTarget(user)}
              title="Manage role assignments"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
              onClick={() => setDeleteTarget(user)}
              title="Delete user"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnVisibility: { ...columnVisibility, searchField: false },
      pagination: { pageIndex: 0, pageSize },
    },
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success('User deleted');
      setDeleteTarget(null);
      fetchUsers();
    } catch (error) {
      handleDRFError(error, { fallbackMessage: 'Failed to delete user' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminResourceTable
        icon={Users}
        title="Users"
        addLabel="Add User"
        onAdd={() => { setEditing(null); setIsFormOpen(true); }}
        table={table}
        loading={loading}
        emptyMessage="No users found."
        itemCount={users.length}
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value);
          table.getColumn('searchField')?.setFilterValue(value.toLowerCase());
        }}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); }}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditing(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {editing ? 'Edit User' : 'Add User'}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            editing={editing}
            onSuccess={() => { setIsFormOpen(false); setEditing(null); fetchUsers(); }}
            onClose={() => { setIsFormOpen(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Role Assignment Modal */}
      {roleAssignTarget && (
        <RoleAssignmentModal
          user={roleAssignTarget}
          onClose={() => { setRoleAssignTarget(null); fetchUsers(); }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deleteTarget?.first_name} {deleteTarget?.last_name}"</strong> ({deleteTarget?.email}) will be permanently deleted.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              {deleting && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UsersPage;
