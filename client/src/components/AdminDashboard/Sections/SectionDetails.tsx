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
import { Loader2 } from 'lucide-react';
import useTechnicians from '@/hooks/technicians/useTechnicians';
import sectionsService from '@/api/services/sectionsService';
import type { Section } from '@/types';

interface SectionDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section | null;
  onUpdated?: () => void;
}

export default function SectionDetails({ isOpen, onOpenChange, section, onUpdated }: SectionDetailsProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const { technicians } = useTechnicians({ page: 1, page_size: 100, sections: section?.id });

  // Sync edit state
  useEffect(() => {
    if (section) {
      setEditedName(section.name || '');
      setEditedDescription(section.description || '');
    }
  }, [section]);

  if (!section) return null;

  const techNames = technicians ? technicians.map(t => `${t.first_name} ${t.last_name}`) : [];

  const handleClose = () => {
    setMode('view');
    onOpenChange(false);
    // Reset
    if (section) {
      setEditedName(section.name || '');
      setEditedDescription(section.description || '');
    }
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      const payload = {
        name: editedName,
        description: editedDescription,
      };
      await sectionsService.updateSection(section.id, payload);
      toast.success('Section updated successfully');
      setMode('view');
      onUpdated?.();
    } catch (error: any) {
      console.error('Update error:', error);
      if (error?.response?.data) {
        const data = error.response.data;
        Object.keys(data).forEach((key) => {
          const val = data[key];
          const message = Array.isArray(val) ? val.join(' ') : String(val);
          toast.error(`${key}: ${message}`);
        });
      } else {
        toast.error('Failed to update section');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side='right'
        className='sm:!max-w-none sm:w-[450px] lg:w-[500px] xl:w-[600px] p-0 flex flex-col'
      >
        {/* HEADER */}
        <SheetHeader className='px-6 py-4 border-b bg-gray-50/50 space-y-3'>
          <SheetTitle className='text-base font-bold text-gray-900'>
            {section.name}
          </SheetTitle>
          <SheetDescription className='text-sm text-gray-600'>
            Section details and assigned technicians
          </SheetDescription>
        </SheetHeader>

        {/* CONTENT - Scrollable */}
        <ScrollArea className='flex-1'>
          <div className='px-8 py-6'>
            <div className='space-y-8'>
              {/* PROFILE INFO */}
              <div className='space-y-2'>
                <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                  Overview
                </h3>
                <div className='bg-white border rounded-lg divide-y'>
                  <div className='px-6 py-4 flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Name</span>
                    <span className='text-sm text-gray-900'>{section.name}</span>
                  </div>
                  <div className='px-6 py-4 flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Description</span>
                    <span className='text-sm text-gray-900'>{section.description || '—'}</span>
                  </div>
                  <div className='px-6 py-4 flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Technicians</span>
                    <span className='text-sm text-gray-900'>{techNames.length ? techNames.join(', ') : 'None'}</span>
                  </div>
                </div>
              </div>

              {/* EDIT FORM - Only visible in edit mode */}
              {mode === 'edit' && (
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                    Edit Section
                  </h3>
                  <div className='bg-white border rounded-lg divide-y'>
                    {/* Name */}
                    <div className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <label className='text-sm font-medium text-gray-700 min-w-[120px]'>Name:</label>
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder='Enter section name'
                          className='flex-1'
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <label className='text-sm font-medium text-gray-700 min-w-[120px]'>Description:</label>
                        <Textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          placeholder='Enter description'
                          rows={3}
                          className='flex-1'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isUpdating}
                    className='w-full bg-blue-600 hover:bg-blue-700'
                  >
                    {isUpdating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    Save Changes
                  </Button>
                </div>
              )}

              {/* Edit Button - Only in view mode */}
              {mode === 'view' && (
                <div className='flex justify-end'>
                  <Button
                    onClick={() => setMode('edit')}
                    className='gap-2 bg-blue-600 hover:bg-blue-700 text-white'
                  >
                    Edit Section
                  </Button>
                </div>
              )}

              {/* Cancel Edit Button - Only in edit mode */}
              {mode === 'edit' && (
                <div className='flex justify-end'>
                  <Button
                    onClick={() => {
                      setMode('view');
                      // Reset
                      if (section) {
                        setEditedName(section.name || '');
                        setEditedDescription(section.description || '');
                      }
                    }}
                    variant='ghost'
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
