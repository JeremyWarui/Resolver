import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, X } from 'lucide-react';
import { DETAILS_SHEET_CONFIG, type DetailSheetFieldType } from '@/constants/detailsSheetConfig';
import { useSharedData } from '@/contexts/SharedDataContext';
import useUpdateUser from '@/hooks/users/useUpdateUser';
import useTechnicians from '@/hooks/technicians/useTechnicians';
import { sectionsService } from '@/api/services/organizationsService';
import type { Technician, Section, Facility } from '@/types';

type Entity = Technician | Section | Facility;

interface UnifiedDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entity: Entity | null;
  entityType: 'technician' | 'section' | 'facility';
  onUpdated?: () => void;
}

export function UnifiedDetailsSheet({
  isOpen,
  onOpenChange,
  entity,
  entityType,
  onUpdated,
}: UnifiedDetailsSheetProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [sectionInputs, setSectionInputs] = useState<number[]>([0]);

  const { sections } = useSharedData();
  const { updateUser } = useUpdateUser();
  const config = DETAILS_SHEET_CONFIG[entityType];

  // For technician section display
  const techSections = entityType === 'technician' && entity ? (entity as Technician).sections || [] : [];
  const technicianSectionNames = techSections.map(id => {
    const s = sections.find(sec => sec.id === id);
    return s ? s.name : String(id);
  });

  // For section technicians display
  const { technicians, loading: techLoading } = useTechnicians(
    entityType === 'section' && entity ? { section_id: (entity as Section).id } : undefined
  );

  // Initialize edit state when entity changes
  useEffect(() => {
    if (entity) {
      const initialValues: Record<string, any> = {};
      config.editFields.forEach(field => {
        if (field.type === 'sections') {
          initialValues[field.name] = (entity as Technician).sections || [];
          setSectionInputs((entity as Technician).sections?.length ? (entity as Technician).sections || [0] : [0]);
        } else {
          initialValues[field.name] = (entity as any)[field.name] || '';
        }
      });
      setEditedValues(initialValues);
    }
  }, [entity, config]);

  if (!entity) return null;

  const handleClose = () => {
    setMode('view');
    onOpenChange(false);
    setEditedValues({});
  };

  const handleAddSection = () => {
    setSectionInputs(prev => [...prev, 0]);
  };

  const handleRemoveSection = (index: number) => {
    if (sectionInputs.length > 1) {
      setSectionInputs(prev => prev.filter((_, i) => i !== index));
      const currentSections = editedValues.sections || [];
      setEditedValues({
        ...editedValues,
        sections: currentSections.filter((_: any, i: number) => i !== index),
      });
    }
  };

  const handleSectionChange = (index: number, sectionId: string) => {
    const id = parseInt(sectionId);
    const currentSections = editedValues.sections || [];
    const newSections = [...currentSections];
    newSections[index] = id;
    setEditedValues({ ...editedValues, sections: newSections });
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      let payload: Record<string, any> = {};

      if (entityType === 'technician') {
        const filteredSections = (editedValues.sections || []).filter((id: number) => id && id > 0);
        payload = {
          email: editedValues.email,
          sections: filteredSections,
        };
        await updateUser(entity.id, payload);
      } else if (entityType === 'section') {
        payload = {
          name: editedValues.name,
          description: editedValues.description,
        };
        await sectionsService.updateSection(entity.id, payload);
      } else if (entityType === 'facility') {
        payload = {
          name: editedValues.name,
          type: editedValues.type,
          location: editedValues.location,
        };
        // TODO: implement facility update service
      }

      toast.success(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} updated successfully`);
      setMode('view');
      onUpdated?.();
    } catch (error: unknown) {
      console.error('Update error:', error);
      const err = error as { response?: { data?: Record<string, unknown> } };
      if (err?.response?.data) {
        const data = err.response.data;
        Object.keys(data).forEach((key) => {
          const val = data[key];
          const message = Array.isArray(val) ? val.join(' ') : String(val);
          toast.error(`${key}: ${message}`);
        });
      } else {
        toast.error(`Failed to update ${entityType}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Get title based on entity type
  const getTitle = () => {
    if (entityType === 'technician') {
      const tech = entity as Technician;
      return `${tech.first_name} ${tech.last_name}`;
    }
    return (entity as any)[config.titleField];
  };

  // Render field value in view mode
  const renderViewField = (fieldName: string, fieldType: DetailSheetFieldType) => {
    if (fieldType === 'sections') {
      return technicianSectionNames.join(', ') || 'None';
    }
    if (fieldType === 'related-list') {
      return null; // Handled separately below
    }
    return (entity as any)[fieldName] || '—';
  };

  // Render field input in edit mode
  const renderEditField = (field: any) => {
    if (field.type === 'text') {
      return (
        <Input
          value={editedValues[field.name] || ''}
          onChange={(e) => setEditedValues({ ...editedValues, [field.name]: e.target.value })}
          placeholder={field.placeholder}
          className="flex-1"
        />
      );
    }
    if (field.type === 'textarea') {
      return (
        <Textarea
          value={editedValues[field.name] || ''}
          onChange={(e) => setEditedValues({ ...editedValues, [field.name]: e.target.value })}
          placeholder={field.placeholder}
          rows={3}
        />
      );
    }
    if (field.type === 'select') {
      return (
        <Select
          value={(editedValues[field.name] || '').toString()}
          onValueChange={(value) => setEditedValues({ ...editedValues, [field.name]: value })}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt: any) => (
              <SelectItem key={opt.value} value={opt.value.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (field.type === 'sections') {
      return (
        <div className="space-y-2">
          {sectionInputs.map((_, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Select
                value={(editedValues.sections?.[idx] || '').toString()}
                onValueChange={(value) => handleSectionChange(idx, value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sectionInputs.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveSection(idx)}
                  className="px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSection}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className={`${config.sheetWidth} p-0 flex flex-col sm:!max-w-none`}
      >
        {/* HEADER */}
        <SheetHeader className="px-6 py-4 border-b bg-gray-50/50 space-y-3">
          <SheetTitle className="text-base font-bold text-gray-900">
            {getTitle()}
          </SheetTitle>
          <SheetDescription className="text-sm text-gray-600">
            {config.descriptionText}
          </SheetDescription>
        </SheetHeader>

        {/* CONTENT - Scrollable */}
        <ScrollArea className="flex-1">
          <div className="px-8 py-6">
            <div className="space-y-8">
              {/* PROFILE INFO */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Overview
                </h3>
                <div className="bg-white border rounded-lg divide-y">
                  {config.viewFields.map((field, idx) => (
                    <div key={idx} className="px-6 py-4">
                      {field.type === 'related-list' ? (
                        <>
                          <span className="text-sm font-medium text-gray-600 block mb-2">{field.label}</span>
                          {techLoading ? (
                            <div className="space-y-2">
                              {[1, 2].map(i => (
                                <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
                              ))}
                            </div>
                          ) : technicians.length > 0 ? (
                            <div className="space-y-1">
                              {technicians.map(t => (
                                <div key={t.id} className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-[#e5f2fc] flex items-center justify-center text-xs font-semibold text-[#0078d4] shrink-0">
                                    {(t.first_name || t.username).charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm text-gray-900">
                                    {t.first_name && t.last_name ? `${t.first_name} ${t.last_name}` : t.username}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No technicians assigned</span>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">{field.label}</span>
                          <span className="text-sm text-gray-900">{renderViewField(field.name, field.type)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* EDIT FORM - Only visible in edit mode */}
              {mode === 'edit' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Edit Details
                  </h3>
                  <div className="bg-white border rounded-lg divide-y">
                    {config.editFields.map((field, idx) => (
                      <div key={idx} className={field.type === 'sections' ? 'px-6 py-4' : 'px-6 py-4'}>
                        <div className={field.type === 'textarea' ? 'space-y-2' : 'flex items-center gap-4'}>
                          <label className="text-sm font-medium text-gray-700 min-w-30">
                            {field.label}:
                          </label>
                          {renderEditField(field)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Save Changes Button */}
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isUpdating}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              )}

              {/* Edit Button - Only in view mode */}
              {mode === 'view' && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => setMode('edit')}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Edit Details
                  </Button>
                </div>
              )}

              {/* Cancel Edit Button - Only in edit mode */}
              {mode === 'edit' && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setMode('view');
                      // Reset values
                      if (entity) {
                        const resetValues: Record<string, any> = {};
                        config.editFields.forEach(field => {
                          if (field.type === 'sections') {
                            resetValues[field.name] = (entity as Technician).sections || [];
                          } else {
                            resetValues[field.name] = (entity as any)[field.name] || '';
                          }
                        });
                        setEditedValues(resetValues);
                      }
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
