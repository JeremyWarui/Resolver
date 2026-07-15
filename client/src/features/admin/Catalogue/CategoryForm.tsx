import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import * as catalogueService from '@/lib/api/catalogue';
import type { SLAPriority } from '@/lib/api/sla';
import type { ServiceCategory } from '@/types/catalogue';
import type { CategoryWithPriority } from './types';
import { SlaPreview } from './SlaPreview';

// Mounted only while open — state initializes from props on mount.
export function CategoryForm({
  sectionTypeId,
  sectionTypeName,
  priorities,
  editing,
  onSaved,
  onClose,
}: {
  sectionTypeId: number;
  sectionTypeName: string;
  priorities: SLAPriority[];
  editing?: ServiceCategory | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [locationDetails, setLocationDetails] = useState(editing?.location_details ?? false);
  const [isActive, setIsActive] = useState(editing?.is_active ?? true);
  const [priorityId, setPriorityId] = useState<string>(() => {
    const editingPriority = (editing as CategoryWithPriority | null | undefined)?.default_priority;
    if (editingPriority?.id) return String(editingPriority.id);
    return priorities[0] ? String(priorities[0].id) : '';
  });
  const [saving, setSaving] = useState(false);

  const selectedPriority = priorities.find(p => String(p.id) === priorityId);

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
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
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
              <SlaPreview
                responseMinutes={selectedPriority.response_minutes}
                resolutionMinutes={selectedPriority.resolution_minutes}
              />
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
