import { useState, useMemo, useEffect } from 'react';
import {
  type ColumnDef, type SortingState, type VisibilityState,
  flexRender, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, useReactTable,
} from '@tanstack/react-table';
import { Users, Pencil, Trash2, ShieldCheck, Plus, ChevronDown, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getRoleAssignments, createRoleAssignment, deleteRoleAssignment, updateUser, createUser, deleteUser } from '@/lib/api/users';
import { getUsers } from '@/lib/api/users';
import { campusesService, departmentsService, sectionsService } from '@/lib/api/organizations';
import { useCampuses } from '@/hooks/campuses/useCampuses';
import { useDepartments } from '@/hooks/departments/useDepartments';
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

const ROLE_ORDER: UserRole[] = ['admin', 'manager', 'hod', 'hos', 'technician', 'user'];

const ROLES_REQUIRING_SECTION: UserRole[] = ['technician', 'hos'];
const ROLES_REQUIRING_CAMPUS_DEPT: UserRole[] = ['hod'];
const ROLES_REQUIRING_DEPARTMENT: UserRole[] = ['manager'];

interface RoleAssignFormState {
  role: UserRole;
  campus_id: string;
  department_id: string;
  section_id: string;
  valid_until: string;
}

const EMPTY_RA_FORM: RoleAssignFormState = {
  role: 'user',
  campus_id: '',
  department_id: '',
  section_id: '',
  valid_until: '',
};

interface RoleScopeValue {
  role: UserRole;
  campus_id: string;
  department_id: string;
  section_id: string;
}

/** Role + Campus/Department/Section cascading selects, shared by the role-assignment
 * modal and the Add/Edit User dialog so both stay in sync with what the backend accepts. */
function RoleScopeSelectFields({
  value,
  onChange,
  compact = false,
}: {
  value: RoleScopeValue;
  onChange: (next: RoleScopeValue) => void;
  compact?: boolean;
}) {
  const { role, campus_id, department_id, section_id } = value;
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<{ id: number; name: string }[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);

  const needsSection = ROLES_REQUIRING_SECTION.includes(role);
  const needsCampusDept = ROLES_REQUIRING_CAMPUS_DEPT.includes(role);
  const needsDepartment = ROLES_REQUIRING_DEPARTMENT.includes(role);
  const needsCampus = needsSection || needsCampusDept;

  useEffect(() => {
    campusesService.getCampuses().then(setCampuses).catch(() => {});
  }, []);

  // Load departments when campus changes (also runs on mount to hydrate an edit-mode value)
  useEffect(() => {
    if (!campus_id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDepartments([]);
      return;
    }
    setLoadingDepts(true);
    departmentsService
      .getDepartments({ campus: Number(campus_id) })
      .then(setDepartments)
      .catch(() => {})
      .finally(() => setLoadingDepts(false));
  }, [campus_id]);

  // Load sections when campus or department changes (for technician/HOS)
  useEffect(() => {
    if (!campus_id || !department_id || !needsSection) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSections([]);
      return;
    }
    setLoadingSections(true);
    sectionsService
      .getSections({ campus: Number(campus_id), department: Number(department_id) })
      .then(setSections)
      .catch(() => {})
      .finally(() => setLoadingSections(false));
  }, [campus_id, department_id, needsSection]);

  const triggerClass = compact ? 'h-8 text-sm' : '';
  const labelClass = compact ? 'text-xs' : '';

  return (
    <>
      <div className="space-y-1.5">
        <Label className={labelClass}>Role</Label>
        <Select
          value={role}
          onValueChange={v => onChange({ role: v as UserRole, campus_id: '', department_id: '', section_id: '' })}
        >
          <SelectTrigger className={triggerClass}><SelectValue /></SelectTrigger>
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
          <Label className={labelClass}>Campus {needsCampus ? '' : '(optional)'}</Label>
          <Select value={campus_id} onValueChange={v => onChange({ ...value, campus_id: v, department_id: '', section_id: '' })}>
            <SelectTrigger className={triggerClass}><SelectValue placeholder="Select campus" /></SelectTrigger>
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
          <Label className={labelClass}>Department</Label>
          <Select
            value={department_id}
            onValueChange={v => onChange({ ...value, department_id: v, section_id: '' })}
            disabled={!campus_id || loadingDepts}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder={!campus_id ? 'Select campus first' : loadingDepts ? 'Loading…' : 'Select department'} />
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
          <Label className={labelClass}>Section</Label>
          <Select
            value={section_id}
            onValueChange={v => onChange({ ...value, section_id: v })}
            disabled={!department_id || loadingSections}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder={!department_id ? 'Select department first' : loadingSections ? 'Loading…' : 'Select section'} />
            </SelectTrigger>
            <SelectContent>
              {sections.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}

function RoleAssignmentModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [form, setForm] = useState<RoleAssignFormState>(EMPTY_RA_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.valid_until) {
      toast.error('Set an end date — cover assignments must be time-boxed');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateRoleAssignmentPayload = {
        role: form.role,
        is_primary: false,
        campus_id: form.campus_id ? Number(form.campus_id) : null,
        department_id: form.department_id ? Number(form.department_id) : null,
        section_id: form.section_id ? Number(form.section_id) : null,
        valid_until: new Date(form.valid_until).toISOString(),
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
          <DialogDescription>
            View or remove assignments, and add a time-boxed cover role. To change this
            user's primary role, use Edit User instead.
          </DialogDescription>
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
                    {ra.is_primary ? (
                      <Badge variant="outline" className="text-xs shrink-0 border-primary text-primary">Primary</Badge>
                    ) : ra.valid_until ? (
                      <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground">
                        Until {new Date(ra.valid_until).toLocaleDateString()}
                      </Badge>
                    ) : null}
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

          {/* Add cover assignment form */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Add Cover Assignment</p>
            <form onSubmit={handleAdd} className="space-y-3">
              <RoleScopeSelectFields
                value={{ role: form.role, campus_id: form.campus_id, department_id: form.department_id, section_id: form.section_id }}
                onChange={next => setForm(f => ({ ...f, ...next }))}
                compact
              />

              <div className="space-y-1.5">
                <Label className="text-xs">Ends on</Label>
                <Input
                  type="date"
                  className="h-8 text-sm"
                  value={form.valid_until}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                  required
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" disabled={submitting} className="bg-primary hover:bg-primary/90">
                  {submitting ? 'Adding…' : 'Add Cover Assignment'}
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
  role: UserRole;
  campus_id: string;
  department_id: string;
  section_id: string;
  home_campus_id: string;
}

const EMPTY_FORM: UserFormData = {
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  password: '',
  role: 'user',
  campus_id: '',
  department_id: '',
  section_id: '',
  home_campus_id: '',
};

function roleScopeFromUser(u: User | null): Pick<UserFormData, 'role' | 'campus_id' | 'department_id' | 'section_id'> {
  if (!u) return { role: 'user', campus_id: '', department_id: '', section_id: '' };
  return {
    role: u.role,
    campus_id: u.primary_campus_id != null ? String(u.primary_campus_id) : '',
    department_id: u.primary_department_id != null ? String(u.primary_department_id) : '',
    section_id: u.sections?.[0] != null ? String(u.sections[0]) : '',
  };
}

function buildForm(editing: User | null): UserFormData {
  return editing
    ? {
        ...EMPTY_FORM,
        first_name: editing.first_name,
        last_name: editing.last_name,
        email: editing.email,
        username: editing.username,
        home_campus_id: editing.home_campus_id != null ? String(editing.home_campus_id) : '',
        ...roleScopeFromUser(editing),
      }
    : EMPTY_FORM;
}

function UserForm({ editing, onSuccess, onClose }: { editing: User | null; onSuccess: () => void; onClose: () => void }) {
  const [form, setForm] = useState<UserFormData>(() => buildForm(editing));
  const [saving, setSaving] = useState(false);
  const [prevEditing, setPrevEditing] = useState(editing);
  const { campuses: homeCampuses } = useCampuses();

  if (prevEditing !== editing) {
    setPrevEditing(editing);
    setForm(buildForm(editing));
  }

  const set = (key: keyof UserFormData, val: string) => setForm(f => ({ ...f, [key]: val }));

  const needsSection = ROLES_REQUIRING_SECTION.includes(form.role);
  const needsCampusDept = ROLES_REQUIRING_CAMPUS_DEPT.includes(form.role);
  const needsDepartment = ROLES_REQUIRING_DEPARTMENT.includes(form.role);

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
    if (!form.home_campus_id) {
      toast.error("Select the user's home campus");
      return;
    }

    const initialScope = roleScopeFromUser(editing);
    const roleChanged = editing
      ? form.role !== initialScope.role
        || form.campus_id !== initialScope.campus_id
        || form.department_id !== initialScope.department_id
        || form.section_id !== initialScope.section_id
      : form.role !== 'user';

    if (roleChanged) {
      if (needsSection && !form.section_id) {
        toast.error('Select a section for this role');
        return;
      }
      if (needsCampusDept && (!form.campus_id || !form.department_id)) {
        toast.error('Select a campus and department for this role');
        return;
      }
      if (needsDepartment && !form.department_id) {
        toast.error('Select a department for this role');
        return;
      }
    }

    setSaving(true);
    try {
      let userId: number;
      if (editing) {
        await updateUser(editing.id, {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          campus_id: Number(form.home_campus_id),
        });
        userId = editing.id;
      } else {
        const payload: CreateUserPayload = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          password: form.password,
          campus_id: Number(form.home_campus_id),
          ...(form.username.trim() ? { username: form.username.trim() } : {}),
        };
        const created = await createUser(payload);
        userId = created.id;
      }

      if (roleChanged) {
        try {
          await createRoleAssignment(userId, {
            role: form.role,
            is_primary: true,
            campus_id: form.campus_id ? Number(form.campus_id) : null,
            department_id: form.department_id ? Number(form.department_id) : null,
            section_id: form.section_id ? Number(form.section_id) : null,
          });
        } catch (roleError) {
          handleDRFError(roleError, { fallbackMessage: 'User saved, but the role update failed — use the role assignment button to fix it.' });
          onSuccess();
          return;
        }
      }

      toast.success(editing ? 'User updated' : 'User created');
      onSuccess();
    } catch (error) {
      handleDRFError(error, { fallbackMessage: 'Failed to save user' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
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
      <div className="space-y-2">
        <Label>Home Campus</Label>
        <Select value={form.home_campus_id} onValueChange={v => set('home_campus_id', v)}>
          <SelectTrigger><SelectValue placeholder="Select campus" /></SelectTrigger>
          <SelectContent>
            {homeCampuses.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Where this person is based — used to route tickets they raise themselves, independent of their role.</p>
      </div>
      {!editing && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Username <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input value={form.username} onChange={e => set('username', e.target.value)} placeholder="e.g. john.doe" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Minimum 8 characters" required />
          </div>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Role &amp; Scope</p>
        <div className="grid grid-cols-2 gap-4">
          <RoleScopeSelectFields
            value={{ role: form.role, campus_id: form.campus_id, department_id: form.department_id, section_id: form.section_id }}
            onChange={next => setForm(f => ({ ...f, ...next }))}
          />
        </div>
      </div>

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
  const [campusFilter, setCampusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [collapsedRoles, setCollapsedRoles] = useState<Set<UserRole>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [roleAssignTarget, setRoleAssignTarget] = useState<User | null>(null);

  const nameHeader = useSortableColumn('Name');
  const emailHeader = useSortableColumn('Email');

  const { campuses } = useCampuses();
  const { departments } = useDepartments();

  // Departments are org-wide, but each carries the campuses it actually has a
  // CampusDepartment presence on (DepartmentSerializer.campuses) — narrow to those
  // so the Department dropdown only ever offers choices valid for the chosen campus.
  const departmentOptions = useMemo(() => {
    if (campusFilter === 'all') return departments;
    return departments.filter(d => d.campuses?.some(c => String(c.id) === campusFilter));
  }, [departments, campusFilter]);

  const toggleRoleGroup = (role: UserRole) => {
    setCollapsedRoles(prev => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role); else next.add(role);
      return next;
    });
  };

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

  const scopedUsers = useMemo(() => users.filter(u =>
    (campusFilter === 'all' || String(u.primary_campus_id) === campusFilter)
    && (departmentFilter === 'all' || String(u.primary_department_id) === departmentFilter)
  ), [users, campusFilter, departmentFilter]);

  const data: UserRow[] = useMemo(() => scopedUsers.map(u => ({
    ...u,
    fullName: `${u.first_name} ${u.last_name}`.trim() || u.username,
    searchField: `${u.first_name} ${u.last_name} ${u.email} ${u.username} ${u.role}`.toLowerCase(),
  })), [scopedUsers]);

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="text-xs font-mono text-gray-500">{row.getValue('id')}</span>,
    },
    {
      accessorKey: 'fullName',
      header: nameHeader,
      cell: ({ row }) => <span className="font-medium text-sm">{row.getValue('fullName') as string}</span>,
    },
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => <span className="text-sm text-gray-500">@{row.getValue('username')}</span>,
    },
    {
      accessorKey: 'email',
      header: emailHeader,
      cell: ({ row }) => <span className="text-sm">{row.getValue('email')}</span>,
    },
    {
      accessorKey: 'campus_name',
      header: 'Campus',
      cell: ({ row }) => <span className="text-sm text-gray-600">{(row.getValue('campus_name') as string | null) ?? '—'}</span>,
    },
    {
      accessorKey: 'primary_department_name',
      header: 'Department',
      cell: ({ row }) => <span className="text-sm text-gray-600">{(row.getValue('primary_department_name') as string | null | undefined) ?? '—'}</span>,
    },
    {
      accessorKey: 'section_names',
      header: 'Section',
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
    state: {
      sorting,
      columnVisibility: { ...columnVisibility, searchField: false },
    },
  });

  // Grouped by role rather than paginated — role is the natural first thing an
  // admin scopes by here, and splitting a role's members across pages would make
  // each group's count badge lie about how many people are actually in it.
  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const sortedFilteredRows = table.getRowModel().rows;
  const roleGroups = ROLE_ORDER
    .map(role => ({ role, rows: sortedFilteredRows.filter(row => row.original.role === role) }))
    .filter(group => group.rows.length > 0);

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
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 mr-2" />
              Users
            </CardTitle>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 flex items-center gap-1"
              onClick={() => { setEditing(null); setIsFormOpen(true); }}
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 items-center py-2">
              <Input
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  table.getColumn('searchField')?.setFilterValue(e.target.value.toLowerCase());
                }}
                className="max-w-sm"
              />

              <Select value={campusFilter} onValueChange={(v) => setCampusFilter(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Campuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  {campuses.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentOptions.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(campusFilter !== 'all' || departmentFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80"
                  onClick={() => { setCampusFilter('all'); setDepartmentFilter('all'); }}
                >
                  Clear filters
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table.getAllColumns()
                    .filter((c) => c.id !== 'actions' && c.id !== 'searchField')
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        className="capitalize"
                        checked={col.getIsVisible()}
                        onCheckedChange={(v) => col.toggleVisibility(!!v)}
                      >
                        {col.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="text-sm text-muted-foreground pb-2">
              {loading ? 'Loading…' : `Showing ${data.length} of ${users.length} users`}
            </div>

            <div className="rounded-sm border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((h) => (
                        <TableHead key={h.id}>
                          {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={visibleColumnCount} className="h-24 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : roleGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={visibleColumnCount} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    roleGroups.flatMap(({ role, rows }) => {
                      const collapsed = collapsedRoles.has(role);
                      const groupHeader = (
                        <TableRow key={`group-${role}`} className="bg-gray-50 hover:bg-gray-50">
                          <TableCell colSpan={visibleColumnCount} className="py-2">
                            <button
                              type="button"
                              onClick={() => toggleRoleGroup(role)}
                              className="flex items-center gap-2 text-left"
                            >
                              {collapsed ? (
                                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE_STYLES[role] ?? 'bg-gray-100 text-gray-600'}`}>
                                {ROLE_LABELS[role] ?? role}
                              </span>
                              <span className="text-xs text-muted-foreground">{rows.length}</span>
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                      const dataRows = collapsed ? [] : rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ));
                      return [groupHeader, ...dataRows];
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditing(null); }}>
        <DialogContent className="sm:max-w-2xl p-8 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {editing ? 'Edit User' : 'Add User'}
            </DialogTitle>
            <DialogDescription>
              {editing ? 'Update user details, account information, and role.' : 'Create a new user account and optionally assign a role.'}
            </DialogDescription>
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
