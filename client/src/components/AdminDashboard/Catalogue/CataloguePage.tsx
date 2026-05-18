import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Clock, AlertCircle, Tag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import * as catalogueService from '@/api/services/catalogueService';
import type { ServiceCategory, ServiceItem } from '@/types/catalogue';

interface SectionType {
  id: number;
  name: string;
  code: string;
  department_id: number;
  department_code: string;
  default_sla_hours: number;
  service_categories: ServiceCategory[];
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const DEPT_NAMES: Record<string, string> = {
  ICT: 'Information Technology',
  ADM: 'Administration',
  HR: 'Human Resources',
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-[#0078d4]' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  );
}

// ── Category Form ─────────────────────────────────────────────────────────────
function CategoryForm({ open, onOpenChange, sectionTypes, editing, defaultSectionTypeId, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  sectionTypes: SectionType[]; editing?: ServiceCategory | null;
  defaultSectionTypeId?: number; onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sectionTypeId, setSectionTypeId] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setName(editing.name); setDescription(editing.description || '');
      setSectionTypeId(String(editing.section_type)); setIsActive(editing.is_active);
    } else {
      setName(''); setDescription('');
      setSectionTypeId(defaultSectionTypeId ? String(defaultSectionTypeId) : '');
      setIsActive(true);
    }
  }, [editing, defaultSectionTypeId, open]);

  const handleSave = async () => {
    if (!name.trim() || !sectionTypeId) { toast.error('Name and section type are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await catalogueService.updateCategory(editing.id, { name: name.trim(), description: description.trim(), is_active: isActive });
        toast.success('Category updated');
      } else {
        await catalogueService.createCategory({ section_type_id: Number(sectionTypeId), name: name.trim(), description: description.trim(), is_active: isActive });
        toast.success('Category created');
      }
      onSaved(); onOpenChange(false);
    } catch { toast.error('Failed to save category'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'New Service Category'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Section Type</Label>
            <Select value={sectionTypeId} onValueChange={setSectionTypeId} disabled={!!editing}>
              <SelectTrigger><SelectValue placeholder="Select section type" /></SelectTrigger>
              <SelectContent>
                {sectionTypes.map(st => (
                  <SelectItem key={st.id} value={String(st.id)}>
                    {st.name} <span className="text-gray-400 text-xs">({DEPT_NAMES[st.department_code] || st.department_code})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Category Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Plumbing Services" />
          </div>
          <div className="space-y-1">
            <Label>Description <span className="text-gray-400 text-xs">(optional)</span></Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this category cover?" rows={2} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Toggle checked={isActive} onChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#0078d4] hover:bg-[#106ebe]">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Service Item Form ─────────────────────────────────────────────────────────
function ItemForm({ open, onOpenChange, categories, editing, defaultCategoryId, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  categories: ServiceCategory[]; editing?: ServiceItem | null;
  defaultCategoryId?: number; onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [priority, setPriority] = useState('low');
  const [slaHours, setSlaHours] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setName(editing.name); setDescription(editing.description || '');
      setCategoryId(String(editing.category)); setPriority(editing.default_priority);
      setSlaHours(editing.sla_hours != null ? String(editing.sla_hours) : '');
      setRequiresApproval(editing.requires_approval); setIsActive(editing.is_active);
    } else {
      setName(''); setDescription('');
      setCategoryId(defaultCategoryId ? String(defaultCategoryId) : '');
      setPriority('low'); setSlaHours(''); setRequiresApproval(false); setIsActive(true);
    }
  }, [editing, defaultCategoryId, open]);

  const handleSave = async () => {
    if (!name.trim() || !categoryId) { toast.error('Name and category are required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(), description: description.trim(),
        default_priority: priority as ServiceItem['default_priority'],
        sla_hours: slaHours ? Number(slaHours) : null,
        requires_approval: requiresApproval, is_active: isActive,
      };
      if (editing) {
        await catalogueService.updateServiceItem(editing.id, payload);
        toast.success('Service item updated');
      } else {
        await catalogueService.createServiceItem({ ...payload, category_id: Number(categoryId) });
        toast.success('Service item created');
      }
      onSaved(); onOpenChange(false);
    } catch { toast.error('Failed to save service item'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? 'Edit Service Item' : 'New Service Item'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={!!editing}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Service Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Leaking Faucet" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What this service covers and what the requester can expect" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Default Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['low', 'medium', 'high', 'critical'] as const).map(p => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>SLA Hours <span className="text-gray-400 text-xs">(blank = default)</span></Label>
              <Input type="number" value={slaHours} onChange={e => setSlaHours(e.target.value)} placeholder="e.g. 24" min={1} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between border rounded-lg px-3 py-2">
              <div>
                <p className="text-sm font-medium">Requires Approval</p>
                <p className="text-xs text-gray-500">Manager sign-off needed</p>
              </div>
              <Toggle checked={requiresApproval} onChange={setRequiresApproval} />
            </div>
            <div className="flex items-center justify-between border rounded-lg px-3 py-2">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-gray-500">Visible to users</p>
              </div>
              <Toggle checked={isActive} onChange={setIsActive} />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 space-y-0.5">
            <p className="font-semibold mb-1">ITSM SLA Guidelines</p>
            <p><span className="font-medium">Critical (4h)</span> — System down, data loss risk</p>
            <p><span className="font-medium">High (8h)</span> — Major impact, workaround available</p>
            <p><span className="font-medium">Medium (24h)</span> — Partial impact, workaround exists</p>
            <p><span className="font-medium">Low (48h+)</span> — Minor, no urgency</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#0078d4] hover:bg-[#106ebe]">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CataloguePage() {
  const [sectionTypes, setSectionTypes] = useState<SectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeDept, setActiveDept] = useState<string>('');
  const [activeTypeId, setActiveTypeId] = useState<number | null>(null);

  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [defaultCatId, setDefaultCatId] = useState<number | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'item'; id: number; name: string } | null>(null);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true); else setRefetching(true);
    try {
      const res = await import('@/api/client').then(m => m.default.get('/service-catalogue/section-types/'));
      const data: SectionType[] = res.data;
      setSectionTypes(data);
      if (data.length > 0) {
        const firstDept = data[0].department_code;
        setActiveDept(prev => prev || firstDept);
        setActiveTypeId(prev => prev ?? data[0].id);
      }
    } catch { toast.error('Failed to load catalogue'); }
    finally { setLoading(false); setRefetching(false); }
  }, []);

  useEffect(() => { fetchData(true); }, []);

  // Group by department
  const depts = [...new Map(sectionTypes.map(st => [st.department_code, DEPT_NAMES[st.department_code] || st.department_code])).entries()];
  const typesInDept = sectionTypes.filter(st => st.department_code === activeDept);
  const selectedType = sectionTypes.find(st => st.id === activeTypeId);
  const allCategories = sectionTypes.flatMap(st => st.service_categories);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      deleteTarget.type === 'category'
        ? await catalogueService.deleteCategory(deleteTarget.id)
        : await catalogueService.deleteServiceItem(deleteTarget.id);
      toast.success(`${deleteTarget.type === 'category' ? 'Category' : 'Item'} deleted`);
      setDeleteTarget(null);
      fetchData();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Skeleton header */}
        <div className="bg-white border-b px-6 pt-4 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-52" />
            </div>
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
          {/* Skeleton department tabs */}
          <div className="flex gap-2 pb-0">
            {[120, 100, 160].map((w, i) => <Skeleton key={i} className="h-8 rounded-none rounded-t-md" style={{ width: w }} />)}
          </div>
        </div>
        {/* Skeleton categories */}
        <div className="px-6 py-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-20 rounded" />
                  <Skeleton className="h-7 w-7 rounded" />
                  <Skeleton className="h-7 w-7 rounded" />
                </div>
              </div>
              <div className="divide-y">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex items-center gap-4 px-5 py-3">
                    <Skeleton className="h-4 flex-1 max-w-xs" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                    <div className="flex gap-1 ml-auto">
                      <Skeleton className="h-7 w-7 rounded" />
                      <Skeleton className="h-7 w-7 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 relative">
      {/* ── Top nav: Department tabs ── */}
      <div className="bg-white border-b px-6 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Service Catalogue</h2>
            <p className="text-xs text-gray-500">Manage service categories and items per department</p>
          </div>
          <Button
            onClick={() => { setEditingCat(null); setCatFormOpen(true); }}
            className="bg-[#0078d4] hover:bg-[#106ebe] gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>

        {/* Department tabs */}
        <div className="flex gap-1">
          {depts.map(([code, name]) => (
            <button
              key={code}
              onClick={() => {
                setActiveDept(code);
                const first = sectionTypes.find(st => st.department_code === code);
                if (first) setActiveTypeId(first.id);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
                activeDept === code
                  ? 'border-[#0078d4] text-[#0078d4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Section type pills */}
        {typesInDept.length > 1 && (
          <div className="flex gap-2 mb-4">
            {typesInDept.map(st => (
              <button
                key={st.id}
                onClick={() => setActiveTypeId(st.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activeTypeId === st.id
                    ? 'bg-[#0078d4] text-white border-[#0078d4]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {st.name}
                <span className={`ml-1.5 text-xs ${activeTypeId === st.id ? 'text-blue-100' : 'text-gray-400'}`}>
                  {st.service_categories.length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Categories */}
        {!selectedType ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p>Select a department above</p>
          </div>
        ) : selectedType.service_categories.length === 0 ? (
          <div className="bg-white border border-dashed rounded-lg p-16 text-center">
            <Tag className="h-8 w-8 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No categories yet</p>
            <p className="text-gray-400 text-xs mt-1 mb-4">Add a category to start building the service catalogue</p>
            <Button size="sm" onClick={() => { setEditingCat(null); setCatFormOpen(true); }} className="bg-[#0078d4] hover:bg-[#106ebe]">
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedType.service_categories.map(cat => (
              <div key={cat.id} className="bg-white border rounded-lg overflow-hidden">
                {/* Category header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b">
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-[#0078d4]" />
                    <div>
                      <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                      {cat.description && <span className="text-xs text-gray-500 ml-2">— {cat.description}</span>}
                    </div>
                    <Badge variant="outline" className="text-xs">{cat.service_items.length} item{cat.service_items.length !== 1 ? 's' : ''}</Badge>
                    {!cat.is_active && <Badge variant="outline" className="text-xs text-gray-400">Inactive</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setDefaultCatId(cat.id); setEditingItem(null); setItemFormOpen(true); }} className="h-8 gap-1 text-xs text-[#0078d4]">
                      <Plus className="h-3 w-3" /> Add Item
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingCat(cat); setCatFormOpen(true); }} className="h-8 w-8 p-0">
                      <Pencil className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ type: 'category', id: cat.id, name: cat.name })} className="h-8 w-8 p-0">
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* Service items table */}
                {cat.service_items.length === 0 ? (
                  <div className="px-5 py-4 text-xs text-gray-400 italic">No items yet</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b">
                        <th className="text-left px-5 py-2 font-medium">Service Item</th>
                        <th className="text-left px-3 py-2 font-medium">Priority</th>
                        <th className="text-left px-3 py-2 font-medium">SLA</th>
                        <th className="text-left px-3 py-2 font-medium">Approval</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {cat.service_items.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            {item.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{item.description}</p>}
                            {!item.is_active && <span className="text-xs text-gray-400">(inactive)</span>}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLORS[item.default_priority]}`}>
                              {item.default_priority}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-500">
                            {item.sla_hours ? (
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.sla_hours}h</span>
                            ) : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-3 py-3">
                            {item.requires_approval
                              ? <span className="text-xs text-amber-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Required</span>
                              : <span className="text-xs text-gray-300">—</span>
                            }
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => { setEditingItem(item); setItemFormOpen(true); }} className="h-7 w-7 p-0">
                                <Pencil className="h-3.5 w-3.5 text-gray-400" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ type: 'item', id: item.id, name: item.name })} className="h-7 w-7 p-0">
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refetch overlay — keeps current data visible with a subtle loading indicator */}
      {refetching && (
        <div className="absolute inset-0 bg-white/50 flex items-start justify-center pt-24 z-10 pointer-events-none">
          <div className="flex items-center gap-2 bg-white border rounded-lg shadow-sm px-4 py-2 text-sm text-gray-600">
            <div className="h-4 w-4 border-2 border-[#0078d4] border-t-transparent rounded-full animate-spin" />
            Updating catalogue…
          </div>
        </div>
      )}

      {/* Forms */}
      <CategoryForm open={catFormOpen} onOpenChange={setCatFormOpen} sectionTypes={sectionTypes} editing={editingCat} defaultSectionTypeId={activeTypeId ?? undefined} onSaved={fetchData} />
      <ItemForm open={itemFormOpen} onOpenChange={setItemFormOpen} categories={allCategories} editing={editingItem} defaultCategoryId={defaultCatId} onSaved={fetchData} />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type === 'category' ? 'Category' : 'Service Item'}?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deleteTarget?.name}"</strong> will be permanently deleted.
              {deleteTarget?.type === 'category' && ' All service items inside it will also be deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting} className="bg-red-600 hover:bg-red-700 gap-2">
              {deleting && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
