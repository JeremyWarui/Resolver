import { useState } from 'react';
import { Plus, Pencil, Trash2, Building2, UserCircle, MapPin, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDepartments } from '@/hooks/departments/useDepartments';
import { useCampuses } from '@/hooks/campuses/useCampuses';
import { departmentsService, campusDepartmentsService } from '@/lib/api/organizations';
import { handleDRFError } from '@/utils/handleDRFError';
import type { Department } from '@/types/organisationStructure';

interface LinkedCampus {
  campus_department_id: number;
  id: number;
  name: string;
  code: string;
}

interface HodEntry {
  campus_department_id: number;
  campus: string;
  hod: { id: number; name: string; username?: string };
}

interface RoleUser {
  id: number;
  name: string;
  username: string;
}

type DepartmentExtended = Department & {
  campuses?: LinkedCampus[];
  heads_of_department?: HodEntry[];
  manager_user?: { id: number; name?: string; username?: string };
};

// ⚠️ NOTE: fetchUsersByRole is deprecated (§28 Reconciliation)
// The /users/ endpoint does not exist on the backend. 
// User assignment features are disabled until backend role-assignment endpoints are available.
// Per CLAUDE.md, departments/roles should be managed via role-assignments, not direct user listing.
//
// async function fetchUsersByRole(role: string): Promise<RoleUser[]> {
//   // DISABLED: /users/ endpoint does not exist
//   throw new Error('/users/ endpoint is not available');
// }

function UserSelect({ users, loading, value, onChange, placeholder }: {
  users: RoleUser[];
  loading: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  if (loading) return <Skeleton className="h-10 w-full" />;
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-gray-400 italic">None</span>
        </SelectItem>
        {users.map(u => (
          <SelectItem key={u.id} value={String(u.id)}>
            {u.name}
            <span className="text-gray-400 text-xs ml-1.5">@{u.username}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── Department Form (global — name + code + manager) ──────────────────────────

function DeptForm({ dept, onSuccess, onClose }: {
  dept: Department | null;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(dept?.name ?? '');
  const [code, setCode] = useState(dept?.code ?? '');
  const [managerId, setManagerId] = useState<string>(() => {
    const m = (dept as DepartmentExtended)?.manager_user;
    return m ? String(m.id) : 'none';
  });
  // User fetching disabled: role-assignment endpoint not yet wired (§28 Reconciliation)
  const managers: RoleUser[] = [];
  const loadingManagers = false;
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) { toast.error('Name and code are required'); return; }
    setSaving(true);
    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      manager_user_id: managerId && managerId !== 'none' ? Number(managerId) : null,
    };
    try {
      if (dept) {
        await departmentsService.updateDepartment(dept.id, payload);
        toast.success('Department updated');
      } else {
        await departmentsService.createDepartment(payload);
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Department Name <span className="text-red-500">*</span></Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Information Technology" className="h-10" required />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Code <span className="text-red-500">*</span></Label>
        <Input
          value={code}
          onChange={e => setCode(e.target.value.slice(0, 10))}
          placeholder="e.g. ICT"
          className="h-10 uppercase"
          required
        />
        <p className="text-xs text-gray-400">
          Short code used in ticket numbers (e.g. NRB-<strong>ICT</strong>-00001)
        </p>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <UserCircle className="h-3.5 w-3.5 text-gray-400" />
          Department Manager
        </Label>
        <UserSelect
          users={managers}
          loading={loadingManagers}
          value={managerId}
          onChange={setManagerId}
          placeholder="Select a manager (optional)"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? 'Saving…' : dept ? 'Save Changes' : 'Create Department'}
        </Button>
      </div>
    </form>
  );
}

// ── Assign to Campus dialog (+ HOD selection) ─────────────────────────────────

function AssignCampusDialog({ open, onOpenChange, dept, linkedCampuses, onAssigned }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dept: Department;
  linkedCampuses: LinkedCampus[];
  onAssigned: () => void;
}) {
  const { campuses } = useCampuses();
  const [selectedCampusId, setSelectedCampusId] = useState('');
  const [hodId, setHodId] = useState('none');
  // User fetching disabled: role-assignment endpoint not yet wired (§28 Reconciliation)
  const hods: RoleUser[] = [];
  const loadingHods = false;
  const [saving, setSaving] = useState(false);

  const linkedIds = new Set(linkedCampuses.map(c => c.id));
  const available = campuses.filter(c => !linkedIds.has(c.id));

  const handleAssign = async () => {
    if (!selectedCampusId) { toast.error('Select a campus'); return; }
    setSaving(true);
    try {
      const payload = {
        campus_id: Number(selectedCampusId),
        department_id: dept.id,
        ...(hodId && hodId !== 'none' ? { head_of_department_id: Number(hodId) } : {}),
      };

      await campusDepartmentsService.createCampusDepartment(payload);
      toast.success(`${dept.code} assigned to ${campuses.find(c => String(c.id) === selectedCampusId)?.name}`);
      onAssigned();
      onOpenChange(false);
    } catch (error) {
      handleDRFError(error, { fallbackMessage: 'Failed to assign campus' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-primary" />
            Assign {dept.name} to a campus
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-5">
          <p className="text-xs text-gray-500">
            This creates a campus branch (e.g. <strong>NRB-{dept.code}</strong>) which can then have
            sections and tickets routed to it.
          </p>
          {available.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-4">
              {dept.name} is already active at all campuses.
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Campus <span className="text-red-500">*</span></Label>
                <Select value={selectedCampusId} onValueChange={setSelectedCampusId}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select a campus" /></SelectTrigger>
                  <SelectContent>
                    {available.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} <span className="text-gray-400 text-xs ml-1">({c.code})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <UserCog className="h-3.5 w-3.5 text-gray-400" />
                  Head of Department
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <UserSelect
                  users={hods}
                  loading={loadingHods}
                  value={hodId}
                  onChange={setHodId}
                  placeholder="Assign HOD (optional)"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {available.length > 0 && (
            <Button onClick={handleAssign} disabled={saving || !selectedCampusId} className="bg-primary hover:bg-primary/90">
              {saving ? 'Assigning…' : 'Assign'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit HOD dialog (for existing campus branch pills) ────────────────────────

function EditHodDialog({ open, onOpenChange, campus, dept, currentHod, onSaved }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  campus: LinkedCampus;
  dept: Department;
  currentHod: HodEntry | undefined;
  onSaved: () => void;
}) {
  // User fetching disabled: role-assignment endpoint not yet wired (§28 Reconciliation)
  const hods: RoleUser[] = [];
  const loadingHods = false;
  const [hodId, setHodId] = useState('none');
  const [saving, setSaving] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setHodId(currentHod ? String(currentHod.hod.id) : 'none');
  }

  const initialId = currentHod ? String(currentHod.hod.id) : 'none';
  const hasChange = hodId !== initialId;

  const handleSave = async () => {
    setSaving(true);
    try {
      const newHodId = hodId !== 'none' ? Number(hodId) : null;
      await campusDepartmentsService.assignHOD(campus.campus_department_id, newHodId);
      toast.success(newHodId ? `HOD updated for ${campus.code}-${dept.code}` : `HOD removed from ${campus.code}-${dept.code}`);
      onSaved();
      onOpenChange(false);
    } catch (error) {
      handleDRFError(error, { fallbackMessage: 'Failed to update HOD' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base">
            HOD — {campus.code}-{dept.code}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Head of Department</Label>
          <UserSelect
            users={hods}
            loading={loadingHods}
            value={hodId}
            onChange={setHodId}
            placeholder="No HOD assigned"
          />
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !hasChange} className="bg-primary hover:bg-primary/90">
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const DepartmentsPage = () => {
  const { departments: depts, loading, refetch } = useDepartments();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [assigningDept, setAssigningDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingHod, setEditingHod] = useState<{
    campus: LinkedCampus;
    dept: Department;
    currentHod: HodEntry | undefined;
  } | null>(null);

  const filtered = depts.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deletingDept) return;
    setDeleting(true);
    try {
      await departmentsService.deleteDepartment(deletingDept.id);
      toast.success(`"${deletingDept.name}" deleted`);
      setDeletingDept(null);
      refetch();
    } catch (error) {
      handleDRFError(error, { fallbackMessage: 'Cannot delete — department may have sections or tickets attached' });
    } finally {
      setDeleting(false);
    }
  };

  const handleUnlinkCampus = async (dept: Department, campus: LinkedCampus) => {
    try {
      await campusDepartmentsService.deleteCampusDepartment(campus.campus_department_id);
      toast.success(`${dept.code} removed from ${campus.name}`);
      refetch();
    } catch {
      toast.error('Cannot remove — sections or tickets may exist under this campus branch');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Departments</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Global departments and their campus branches (e.g. NRB-ICT, MSA-ADM)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search departments…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-56 h-8 text-sm"
          />
          <Button size="sm" onClick={() => { setEditing(null); setIsFormOpen(true); }} className="bg-primary hover:bg-primary/90 gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Add Department
          </Button>
        </div>
      </div>

      {/* Department cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed rounded-lg p-16 text-center">
          <Building2 className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">
            {search ? 'No departments match your search' : 'No departments yet'}
          </p>
          {!search && (
            <Button size="sm" className="mt-4 bg-primary hover:bg-primary/90" onClick={() => { setEditing(null); setIsFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Department
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(dept => {
            const extDept = dept as DepartmentExtended;
            const linkedCampuses: LinkedCampus[] = extDept.campuses ?? [];
            const hods: HodEntry[] = extDept.heads_of_department ?? [];
            const manager = extDept.manager_user;

            return (
              <div key={dept.id} className="bg-white border rounded-lg overflow-hidden">
                {/* Department header row */}
                <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">{dept.name}</span>
                        <Badge variant="outline" className="text-xs font-mono">{dept.code}</Badge>
                      </div>
                      {manager && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <UserCircle className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">Manager: {manager.name ?? manager.username}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditing(dept); setIsFormOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeletingDept(dept)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* Campus assignments */}
                <div className="px-5 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-medium mr-1">Active at:</span>

                    {linkedCampuses.length === 0 && (
                      <span className="text-xs text-gray-300 italic">No campuses yet</span>
                    )}

                    {linkedCampuses.map(campus => {
                      const hod = hods.find(h => h.campus_department_id === campus.campus_department_id);
                      return (
                        <div
                          key={campus.id}
                          className="flex items-center gap-1.5 pl-4 pr-2 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium"
                        >
                          <button
                            onClick={() => setEditingHod({ campus, dept, currentHod: hod })}
                            className="flex items-center gap-1 hover:opacity-75 transition-opacity"
                            title={`Edit HOD for ${campus.code}-${dept.code}`}
                          >
                            <span className="font-semibold text-blue-700">{campus.code}</span>
                            <span className="text-blue-500">{dept.code}</span>
                            {hod ? (
                              <span className="text-blue-400 ml-0.5">· {hod.hod.name.split(' ')[0]}</span>
                            ) : (
                              <UserCog className="h-3 w-3 text-blue-300 ml-0.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleUnlinkCampus(dept, campus)}
                            className="ml-0.5 text-blue-300 hover:text-red-400 transition-colors leading-none"
                            title={`Remove ${dept.code} from ${campus.name}`}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/5"
                      onClick={() => setAssigningDept(dept)}
                    >
                      <Plus className="h-3 w-3" /> Assign campus
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Department dialog */}
      <Dialog open={isFormOpen} onOpenChange={open => { setIsFormOpen(open); if (!open) setEditing(null); }}>
        <DialogContent className="sm:max-w-lg p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-base">{editing ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
          <DeptForm
            dept={editing}
            onSuccess={() => { setIsFormOpen(false); setEditing(null); refetch(); }}
            onClose={() => { setIsFormOpen(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Assign to campus dialog */}
      {assigningDept && (
        <AssignCampusDialog
          open={!!assigningDept}
          onOpenChange={open => { if (!open) setAssigningDept(null); }}
          dept={assigningDept}
          linkedCampuses={(assigningDept as DepartmentExtended).campuses ?? []}
          onAssigned={refetch}
        />
      )}

      {/* Edit HOD dialog (pill click) */}
      {editingHod && (
        <EditHodDialog
          open={!!editingHod}
          onOpenChange={open => { if (!open) setEditingHod(null); }}
          campus={editingHod.campus}
          dept={editingHod.dept}
          currentHod={editingHod.currentHod}
          onSaved={refetch}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingDept} onOpenChange={() => setDeletingDept(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingDept?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This global department will be permanently deleted along with all campus branches, sections, and service categories under it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentsPage;
