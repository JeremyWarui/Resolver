import { useReducer, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Building2, Layers, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import * as catalogueService from '@/lib/api/catalogue';
import { getPriorities, type SLAPriority } from '@/lib/api/sla';
import { departmentsService, sectionsService } from '@/lib/api/organizations';
import type { ServiceCategory, ServiceItem } from '@/types/catalogue';

interface Department {
  id: number;
  name: string;
  code: string;
}

interface SectionType {
  id: number;
  name: string;
  code: string;
  department_id: number;
  department_code: string;
  service_categories: ServiceCategory[];
}

interface PageState {
  sectionTypes: SectionType[];
  departments: Department[];
  priorities: SLAPriority[];
  activeTypeCategories: ServiceCategory[];
  loading: boolean;
  catsLoading: boolean;
  activeDeptCode: string | null;
  activeTypeId: number | null;
  // section type CRUD
  stFormOpen: boolean;
  editingST: SectionType | null;
  deletingST: SectionType | null;
  // category CRUD
  catFormOpen: boolean;
  editingCat: ServiceCategory | null;
  // item CRUD
  itemFormOpen: boolean;
  editingItem: ServiceItem | null;
  openItemCategoryId: number | null;
  deleteTarget: { type: 'category' | 'item'; id: number; name: string } | null;
}

type PageAction =
  | { type: 'SET_SECTION_TYPES'; payload: SectionType[] }
  | { type: 'SET_DEPARTMENTS'; payload: Department[] }
  | { type: 'SET_PRIORITIES'; payload: SLAPriority[] }
  | { type: 'SET_ACTIVE_TYPE_CATEGORIES'; payload: ServiceCategory[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CATS_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVE_DEPT'; payload: string | null }
  | { type: 'SET_ACTIVE_TYPE_ID'; payload: number | null }
  | { type: 'OPEN_ST_FORM'; payload?: SectionType | null }
  | { type: 'CLOSE_ST_FORM' }
  | { type: 'SET_DELETING_ST'; payload: SectionType | null }
  | { type: 'OPEN_CAT_FORM'; payload?: ServiceCategory | null }
  | { type: 'CLOSE_CAT_FORM' }
  | { type: 'OPEN_ITEM_FORM'; payload: { item?: ServiceItem | null; categoryId?: number } }
  | { type: 'CLOSE_ITEM_FORM' }
  | { type: 'SET_DELETE_TARGET'; payload: { type: 'category' | 'item'; id: number; name: string } | null };

const initialState: PageState = {
  sectionTypes: [],
  departments: [],
  priorities: [],
  activeTypeCategories: [],
  loading: true,
  catsLoading: false,
  activeDeptCode: null,
  activeTypeId: null,
  stFormOpen: false,
  editingST: null,
  deletingST: null,
  catFormOpen: false,
  editingCat: null,
  itemFormOpen: false,
  editingItem: null,
  openItemCategoryId: null,
  deleteTarget: null,
};

function reducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case 'SET_SECTION_TYPES':
      return { ...state, sectionTypes: action.payload };
    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload };
    case 'SET_PRIORITIES':
      return { ...state, priorities: action.payload };
    case 'SET_ACTIVE_TYPE_CATEGORIES':
      return { ...state, activeTypeCategories: action.payload, catsLoading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CATS_LOADING':
      return { ...state, catsLoading: action.payload };
    case 'SET_ACTIVE_DEPT':
      return { ...state, activeDeptCode: action.payload, activeTypeId: null, activeTypeCategories: [] };
    case 'SET_ACTIVE_TYPE_ID':
      return { ...state, activeTypeId: action.payload, activeTypeCategories: [] };
    case 'OPEN_ST_FORM':
      return { ...state, stFormOpen: true, editingST: action.payload ?? null };
    case 'CLOSE_ST_FORM':
      return { ...state, stFormOpen: false, editingST: null };
    case 'SET_DELETING_ST':
      return { ...state, deletingST: action.payload };
    case 'OPEN_CAT_FORM':
      return { ...state, catFormOpen: true, editingCat: action.payload ?? null };
    case 'CLOSE_CAT_FORM':
      return { ...state, catFormOpen: false, editingCat: null };
    case 'OPEN_ITEM_FORM':
      return {
        ...state,
        itemFormOpen: true,
        editingItem: action.payload.item ?? null,
        openItemCategoryId: action.payload.categoryId ?? null,
      };
    case 'CLOSE_ITEM_FORM':
      return { ...state, itemFormOpen: false, editingItem: null, openItemCategoryId: null };
    case 'SET_DELETE_TARGET':
      return { ...state, deleteTarget: action.payload };
    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CataloguePage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    sectionTypes,
    departments,
    priorities,
    activeTypeCategories,
    loading,
    catsLoading,
    activeDeptCode,
    activeTypeId,
    stFormOpen,
    editingST,
    deletingST,
    catFormOpen,
    editingCat,
    itemFormOpen,
    editingItem,
    openItemCategoryId,
    deleteTarget,
  } = state;

  const validSectionTypes = Array.isArray(sectionTypes) ? sectionTypes : [];
  const typesInDept = validSectionTypes.filter(st => st.department_code === activeDeptCode);
  const selectedType = validSectionTypes.find(st => st.id === activeTypeId);
  const selectedDept = departments.find(d => d.code === activeDeptCode);

  // Initial load: section types, departments, priorities
  const fetchData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [types, depts, prios] = await Promise.all([
        sectionsService.getSectionTypes(),
        departmentsService.getDepartments(),
        getPriorities(),
      ]);
      dispatch({ type: 'SET_SECTION_TYPES', payload: types as unknown as SectionType[] });
      dispatch({ type: 'SET_DEPARTMENTS', payload: depts });
      dispatch({ type: 'SET_PRIORITIES', payload: prios });
      if (depts.length > 0 && !activeDeptCode) {
        dispatch({ type: 'SET_ACTIVE_DEPT', payload: depts[0].code });
      }
    } catch (err) {
      toast.error('Failed to load catalogue');
      console.error(err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [activeDeptCode]);

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first section type when department changes
  useEffect(() => {
    if (typesInDept.length > 0 && !activeTypeId) {
      dispatch({ type: 'SET_ACTIVE_TYPE_ID', payload: typesInDept[0].id });
    }
  }, [activeDeptCode, typesInDept, activeTypeId]);

  // Bug 1 fix: fetch full categories+items whenever section type changes
  const loadCategories = useCallback((typeId: number) => {
    dispatch({ type: 'SET_CATS_LOADING', payload: true });
    catalogueService.getAllCategories({ section_type: typeId })
      .then(res => {
        const raw = res.data;
        const cats: ServiceCategory[] = Array.isArray(raw)
          ? raw
          : (raw as { results: ServiceCategory[] }).results ?? [];
        dispatch({ type: 'SET_ACTIVE_TYPE_CATEGORIES', payload: cats });
      })
      .catch(() => {
        toast.error('Failed to load categories');
        dispatch({ type: 'SET_CATS_LOADING', payload: false });
      });
  }, []);

  useEffect(() => {
    if (activeTypeId) loadCategories(activeTypeId);
  }, [activeTypeId, loadCategories]);

  const refreshCategories = useCallback(() => {
    if (activeTypeId) loadCategories(activeTypeId);
  }, [activeTypeId, loadCategories]);

  const handleDeleteST = async () => {
    if (!deletingST) return;
    try {
      await sectionsService.deleteSectionType(deletingST.id);
      toast.success(`"${deletingST.name}" deleted`);
      dispatch({ type: 'SET_DELETING_ST', payload: null });
      // If we just deleted the active type, deselect it
      if (activeTypeId === deletingST.id) dispatch({ type: 'SET_ACTIVE_TYPE_ID', payload: null });
      fetchData();
    } catch {
      toast.error('Failed to delete — it may have categories or sections attached');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteTarget || deleteTarget.type !== 'category') return;
    try {
      await catalogueService.deleteCategory(deleteTarget.id);
      toast.success('Category deleted');
      dispatch({ type: 'SET_DELETE_TARGET', payload: null });
      refreshCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget || deleteTarget.type !== 'item') return;
    try {
      await catalogueService.deleteServiceItem(deleteTarget.id);
      toast.success('Service item deleted');
      dispatch({ type: 'SET_DELETE_TARGET', payload: null });
      refreshCategories();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Single unified card — Department row + T-separator + Section Types | Categories */}
      <Card className="overflow-hidden">

        {/* ── Department row — same 1/4 + 3/4 split as the grid below ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 px-6 py-4">
          {/* Left col (1/4) — label + subtitle */}
          <div className="lg:col-span-1 flex items-start gap-2">
            <Building2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-base font-semibold text-gray-800">Department</p>
              <p className="text-xs text-gray-400 mt-0.5">Global across all campuses</p>
            </div>
          </div>
          {/* Right col (3/4) — dropdown + code */}
          <div className="lg:col-span-3 flex items-center gap-3">
            <Select
              value={activeDeptCode || ''}
              onValueChange={(code) => dispatch({ type: 'SET_ACTIVE_DEPT', payload: code })}
            >
              <SelectTrigger className="h-8 w-72 text-sm">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.code}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDept && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {selectedDept.code}
              </span>
            )}
          </div>
        </div>

        {/* ── T-separator: horizontal line spanning full width ───────────── */}
        <div className="border-t border-gray-200" />

        {/* ── Section Types | Categories grid (vertical divider = T stem) ── */}
        {selectedDept ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[480px]">

            {/* Left column — Section Types with inline CRUD */}
            <div className="lg:col-span-1 lg:border-r border-gray-200 border-b lg:border-b-0 flex flex-col">
              <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">Section Types</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Select a type to manage its categories</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => dispatch({ type: 'OPEN_ST_FORM', payload: undefined })}
                  className="gap-1.5 text-xs flex-shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Section Type
                </Button>
              </div>
              <div className="px-5 pb-5 flex-1">
                {typesInDept.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">
                      No section types for this department yet.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dispatch({ type: 'OPEN_ST_FORM', payload: undefined })}
                      className="gap-1.5 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New Section Type
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {typesInDept.map(type => (
                      <div
                        key={type.id}
                        className={`group flex items-center gap-1 rounded-lg transition-all duration-150 ${
                          activeTypeId === type.id
                            ? 'bg-blue-50 border border-blue-200 shadow-sm'
                            : 'border border-transparent hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <button
                          onClick={() => dispatch({ type: 'SET_ACTIVE_TYPE_ID', payload: type.id })}
                          className="flex-1 text-left px-3 py-2 text-sm min-w-0"
                        >
                          <div className={`font-medium leading-tight truncate ${activeTypeId === type.id ? 'text-blue-900' : 'text-gray-700'}`}>
                            {type.name}
                          </div>
                          <div className="text-xs opacity-50 mt-0.5">{type.code}</div>
                        </button>
                        <div className="flex gap-0.5 pr-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dispatch({ type: 'OPEN_ST_FORM', payload: type })}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dispatch({ type: 'SET_DELETING_ST', payload: type })}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column — Service Categories & Items */}
            <div className="lg:col-span-3">
              {/* Right column header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {selectedType ? selectedType.name : 'Service Categories'}
                  </p>
                  {selectedType ? (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 bg-gray-300 rounded-full" />
                      <span>{selectedType.code}</span>
                      <span className="text-gray-200">·</span>
                      <span>service categories and items</span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">Choose a section type on the left</p>
                  )}
                </div>
                {selectedType && (
                  <Button
                    size="sm"
                    onClick={() => dispatch({ type: 'OPEN_CAT_FORM', payload: undefined })}
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Service Category
                  </Button>
                )}
              </div>

              {/* Right column body */}
              <div className="px-6 pb-6">
                {!selectedType ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100 mb-3">
                      <Layers className="h-6 w-6 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Select a section type</p>
                    <p className="text-xs text-gray-400 mt-1">Choose from the list on the left to view and manage service categories</p>
                  </div>
                ) : catsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : activeTypeCategories.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100 mb-3">
                      <Plus className="h-6 w-6 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No service categories yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                      Add the first category for <span className="font-medium text-gray-600">{selectedType.name}</span>.
                      Each category groups related service items users can request.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dispatch({ type: 'OPEN_CAT_FORM', payload: undefined })}
                      className="mt-4 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Service Category
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeTypeCategories.map(cat => {
                      const catWithPriority = cat as ServiceCategory & {
                        default_priority?: { id: number; name: string; response_minutes: number; resolution_minutes: number } | null;
                        items?: ServiceItem[];
                      };
                      const items: ServiceItem[] = catWithPriority.items ?? cat.service_items ?? [];
                      return (
                        <div key={cat.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          {/* Category header */}
                          <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-medium text-sm text-gray-900">{cat.name}</h3>
                                {!cat.is_active && (
                                  <Badge variant="secondary" className="text-xs text-orange-600 bg-orange-50 border-orange-200">
                                    Inactive
                                  </Badge>
                                )}
                                {cat.location_details && (
                                  <Badge variant="secondary" className="text-xs">Location Required</Badge>
                                )}
                                {catWithPriority.default_priority && (
                                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
                                    <Clock className="h-3 w-3" />
                                    {catWithPriority.default_priority.name}
                                    <span className="text-gray-300 mx-0.5">·</span>
                                    {fmtMins(catWithPriority.default_priority.response_minutes)} response
                                  </span>
                                )}
                              </div>
                              {cat.description && (
                                <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dispatch({ type: 'OPEN_CAT_FORM', payload: cat })}
                                className="h-8 w-8 p-0 hover:bg-blue-50 text-gray-400 hover:text-blue-600"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dispatch({ type: 'SET_DELETE_TARGET', payload: { type: 'category', id: cat.id, name: cat.name } })}
                                className="h-8 w-8 p-0 hover:bg-red-50 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Service Items */}
                          <div className="mt-3 space-y-1.5">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Service Items</p>
                            {items.length > 0 ? (
                              items.map(item => (
                                <div key={item.id} className="flex items-start justify-between gap-3 p-2.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                    {item.description && (
                                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => dispatch({ type: 'OPEN_ITEM_FORM', payload: { item, categoryId: cat.id } })}
                                      className="h-7 w-7 p-0 hover:bg-blue-100 text-gray-400 hover:text-blue-600"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => dispatch({ type: 'SET_DELETE_TARGET', payload: { type: 'item', id: item.id, name: item.name } })}
                                      className="h-7 w-7 p-0 hover:bg-red-100 text-gray-400 hover:text-red-600"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400 italic py-1">No service items yet — add the specific requests users can raise under this category.</p>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => dispatch({ type: 'OPEN_ITEM_FORM', payload: { categoryId: cat.id } })}
                              className="w-full text-xs mt-2 gap-1.5 text-gray-600 hover:text-gray-900"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Service Item to {cat.name}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            Select a department above to get started.
          </div>
        )}

      </Card>

      {/* Section Type form */}
      <SectionTypeForm
        open={stFormOpen}
        onOpenChange={(open) => { if (!open) dispatch({ type: 'CLOSE_ST_FORM' }); }}
        departments={departments}
        activeDeptCode={activeDeptCode}
        editing={editingST}
        onSaved={() => { dispatch({ type: 'CLOSE_ST_FORM' }); fetchData(); }}
      />

      {/* Section Type delete confirmation */}
      <AlertDialog open={!!deletingST} onOpenChange={() => dispatch({ type: 'SET_DELETING_ST', payload: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingST?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This section type and all its service categories will be permanently deleted.
              Physical sections that reference it will also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteST} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category / Item forms — only mount when a section type is selected */}
      {selectedType && (
        <>
          <CategoryForm
            open={catFormOpen}
            onOpenChange={(open) => { if (!open) dispatch({ type: 'CLOSE_CAT_FORM' }); }}
            sectionTypeId={selectedType.id}
            sectionTypeName={selectedType.name}
            priorities={priorities}
            editing={editingCat}
            onSaved={() => { dispatch({ type: 'CLOSE_CAT_FORM' }); refreshCategories(); }}
          />
          <ItemForm
            open={itemFormOpen}
            onOpenChange={(open) => { if (!open) dispatch({ type: 'CLOSE_ITEM_FORM' }); }}
            categoryId={openItemCategoryId ?? undefined}
            categories={activeTypeCategories}
            editing={editingItem}
            onSaved={() => { dispatch({ type: 'CLOSE_ITEM_FORM' }); refreshCategories(); }}
          />
        </>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => dispatch({ type: 'SET_DELETE_TARGET', payload: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.type === 'category' ? 'Category' : 'Item'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900">"{deleteTarget?.name}"</span>?
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget?.type === 'category' ? handleDeleteCategory() : handleDeleteItem()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function fmtMins(m: number): string {
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h < 24) return rem === 0 ? `${h}h` : `${h}h ${rem}min`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh === 0 ? `${d}d` : `${d}d ${rh}h`;
}

// ─────────────────────────────────────────────────────────────────────────────

function SectionTypeForm({
  open,
  onOpenChange,
  departments,
  activeDeptCode,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
  activeDeptCode: string | null;
  editing: SectionType | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [deptId, setDeptId] = useState('');
  const [saving, setSaving] = useState(false);
  const [prevEditing, setPrevEditing] = useState(editing);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevEditing !== editing || prevOpen !== open) {
    setPrevEditing(editing);
    setPrevOpen(open);
    if (open) {
      if (editing) {
        setName(editing.name);
        setCode(editing.code);
        setDeptId(String(editing.department_id));
      } else {
        setName('');
        setCode('');
        const activeDept = departments.find(d => d.code === activeDeptCode);
        setDeptId(activeDept ? String(activeDept.id) : (departments[0] ? String(departments[0].id) : ''));
      }
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !code.trim() || (!editing && !deptId)) {
      toast.error('Name, code and department are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await sectionsService.updateSectionType(editing.id, {
          name: name.trim(),
          code: code.trim().toUpperCase(),
        });
        toast.success('Section type updated');
      } else {
        await sectionsService.createSectionType({
          department_id: Number(deptId),
          name: name.trim(),
          code: code.trim().toUpperCase(),
        });
        toast.success('Section type created');
      }
      onSaved();
    } catch {
      toast.error('Failed to save section type');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Section Type' : 'New Section Type'}</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Section types define the service areas within a department (e.g. "Networks", "Maintenance").
          </p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {!editing ? (
            <div className="space-y-1.5">
              <Label>Department *</Label>
              <Select value={deptId} onValueChange={setDeptId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name} <span className="text-gray-400 text-xs ml-1">({d.code})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="text-sm text-gray-500 bg-gray-50 rounded-md px-3 py-2">
              Department: <span className="font-medium text-gray-700">
                {departments.find(d => d.id === editing.department_id)?.name ?? editing.department_code}
              </span>
              <span className="text-gray-400 ml-1 text-xs">(cannot change)</span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Software Support" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label>Code *</Label>
              <Input
                value={code}
                onChange={e => setCode(e.target.value.slice(0, 10))}
                placeholder="e.g. SW"
                className="h-10 uppercase"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Section Type'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function CategoryForm({
  open,
  onOpenChange,
  sectionTypeId,
  sectionTypeName,
  priorities,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionTypeId: number;
  sectionTypeName: string;
  priorities: SLAPriority[];
  editing?: ServiceCategory | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [locationDetails, setLocationDetails] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [priorityId, setPriorityId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [prevEditing, setPrevEditing] = useState(editing);
  const [prevOpen, setPrevOpen] = useState(open);

  const selectedPriority = priorities.find(p => String(p.id) === priorityId);

  if (prevEditing !== editing || prevOpen !== open) {
    setPrevEditing(editing);
    setPrevOpen(open);
    if (open) {
      if (editing) {
        setName(editing.name);
        setDescription(editing.description || '');
        setLocationDetails(editing.location_details ?? false);
        setIsActive(editing.is_active ?? true);
        const ep = (editing as ServiceCategory & { default_priority?: { id: number } | null }).default_priority;
        setPriorityId(ep?.id ? String(ep.id) : (priorities[0] ? String(priorities[0].id) : ''));
      } else {
        setName('');
        setDescription('');
        setLocationDetails(false);
        setIsActive(true);
        setPriorityId(priorities.length > 0 ? String(priorities[0].id) : '');
      }
    }
  }

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Category name is required'); return; }
    if (!priorityId) { toast.error('Default priority is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await catalogueService.updateCategory(editing.id, {
          name: name.trim(),
          description: description.trim(),
          location_details: locationDetails,
          is_active: isActive,
          default_priority_id: Number(priorityId),
        } as Partial<ServiceCategory>);
        toast.success('Category updated');
      } else {
        await catalogueService.createCategory({
          section_type: sectionTypeId,
          name: name.trim(),
          description: description.trim(),
          location_details: locationDetails,
          is_active: isActive,
          default_priority_id: Number(priorityId),
        });
        toast.success('Category created');
      }
      onSaved();
    } catch (err) {
      toast.error('Failed to save category');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Service Category' : 'New Service Category'}</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Under section type: <span className="font-medium text-gray-900">{sectionTypeName}</span>
          </p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name" className="text-sm font-medium">Category Name *</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Plumbing Services"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-desc" className="text-sm font-medium">Description</Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does this category cover?"
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Bug 2 fix: default priority with live SLA preview */}
          <div className="space-y-2">
            <Label htmlFor="cat-priority" className="text-sm font-medium">Default Priority *</Label>
            <Select value={priorityId} onValueChange={setPriorityId}>
              <SelectTrigger id="cat-priority" className="h-10">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPriority && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-blue-50 border border-blue-100 text-xs text-blue-700">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Respond within <strong>{fmtMins(selectedPriority.response_minutes)}</strong></span>
                <span className="text-blue-300">·</span>
                <span>Resolve within <strong>{fmtMins(selectedPriority.resolution_minutes)}</strong></span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 border border-gray-200">
              <Label htmlFor="location-req" className="text-sm font-medium cursor-pointer flex-1 mb-0">
                Requires Location Details
              </Label>
              <input
                id="location-req"
                type="checkbox"
                checked={locationDetails}
                onChange={e => setLocationDetails(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 border border-gray-200">
              <Label htmlFor="cat-active" className="text-sm font-medium cursor-pointer flex-1 mb-0">Active</Label>
              <input
                id="cat-active"
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ItemForm({
  open,
  onOpenChange,
  categoryId,
  categories,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId?: number;
  categories: ServiceCategory[];
  editing?: ServiceItem | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prevEditing, setPrevEditing] = useState(editing);
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevCategoryId, setPrevCategoryId] = useState(categoryId);

  if (prevEditing !== editing || prevOpen !== open || prevCategoryId !== categoryId) {
    setPrevEditing(editing);
    setPrevOpen(open);
    setPrevCategoryId(categoryId);
    if (open) {
      if (editing) {
        setName(editing.name);
        setDescription(editing.description || '');
        // Bug 3 fix: editing.category is the correct FK field name
        setSelectedCatId(editing.category ? String(editing.category) : (categoryId ? String(categoryId) : ''));
        setIsActive(editing.is_active ?? true);
      } else {
        setName('');
        setDescription('');
        // Bug 4 fix: categoryId comes directly from the clicked category row
        setSelectedCatId(categoryId ? String(categoryId) : '');
        setIsActive(true);
      }
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !selectedCatId) { toast.error('Name and category are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        // Bug 3 fix: send category (not service_category_id) matching ServiceItem type
        await catalogueService.updateServiceItem(editing.id, {
          name: name.trim(),
          description: description.trim(),
          category: Number(selectedCatId),
          is_active: isActive,
        } as Partial<ServiceItem>);
        toast.success('Item updated');
      } else {
        // Bug 3 fix: send category_id matching createServiceItem signature
        await catalogueService.createServiceItem({
          category: Number(selectedCatId),
          name: name.trim(),
          description: description.trim(),
          is_active: isActive,
        });
        toast.success('Item created');
      }
      onSaved();
    } catch (err) {
      toast.error('Failed to save item');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Service Item' : 'New Service Item'}</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            A service item is a specific request users can raise (e.g. "WiFi not working", "Pipe burst").
          </p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="item-category" className="text-sm font-medium">Category *</Label>
            <Select value={selectedCatId} onValueChange={setSelectedCatId}>
              <SelectTrigger id="item-category" className="h-10">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-name" className="text-sm font-medium">Item Name *</Label>
            <Input
              id="item-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Pipe Installation"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-desc" className="text-sm font-medium">Description</Label>
            <Textarea
              id="item-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Service details..."
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="pt-1">
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 border border-gray-200">
              <Label htmlFor="item-active" className="text-sm font-medium cursor-pointer flex-1 mb-0">Active</Label>
              <input
                id="item-active"
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
