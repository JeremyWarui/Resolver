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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, X } from 'lucide-react';
import { useSharedData } from '@/contexts/SharedDataContext';
import useUpdateUser from '@/hooks/users/useUpdateUser';
import type { Technician } from '@/types';

interface TechnicianDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  technician: Technician | null;
  onUpdated?: () => void;
}

export default function TechnicianDetails({ isOpen, onOpenChange, technician, onUpdated }: TechnicianDetailsProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedSections, setEditedSections] = useState<number[]>([]);
  const [sectionInputs, setSectionInputs] = useState<number[]>([0]); // Array of section IDs for inputs

  const { sections } = useSharedData();
  const { updateUser } = useUpdateUser();

  // Sync edit state when technician changes or mode changes
  useEffect(() => {
    if (technician) {
      setEditedEmail(technician.email || '');
      const techSections = technician.sections || [];
      setEditedSections(techSections);
      setSectionInputs(techSections.length > 0 ? techSections : [0]); // At least one input
    }
  }, [technician]);

  // Handle adding a new section input
  const addSectionInput = () => {
    setSectionInputs(prev => [...prev, 0]);
  };

  // Handle removing a section input
  const removeSectionInput = (index: number) => {
    if (sectionInputs.length > 1) {
      setSectionInputs(prev => prev.filter((_, i) => i !== index));
      // Update editedSections array
      const newSections = editedSections.filter((_, i) => i !== index);
      setEditedSections(newSections);
    }
  };

  // Handle section selection change
  const handleSectionChange = (index: number, sectionId: string) => {
    const id = parseInt(sectionId);
    const newSections = [...editedSections];
    newSections[index] = id;
    setEditedSections(newSections);
  };

  if (!technician) return null;

  const sectionNames = (technician.sections || []).map(id => sections.find(s => s.id === id)?.name || String(id));

  const handleClose = () => {
    setMode('view');
    onOpenChange(false);
    // Reset to current values
    if (technician) {
      setEditedEmail(technician.email || '');
      setEditedSections(technician.sections || []);
    }
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      // Filter out any zero/empty section IDs
      const filteredSections = editedSections.filter(id => id && id > 0);

      const payload = {
        email: editedEmail,
        sections: filteredSections,
      };
      await updateUser(technician.id, payload);
      toast.success('Technician updated successfully');
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
        toast.error('Failed to update technician');
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
            {technician.first_name} {technician.last_name}
          </SheetTitle>
          <SheetDescription className='text-sm text-gray-600'>
            Technician profile and assignments
          </SheetDescription>
        </SheetHeader>

        {/* CONTENT - Scrollable */}
        <ScrollArea className='flex-1'>
          <div className='px-8 py-6'>
            <div className='space-y-8'>
              {/* PROFILE INFO */}
              <div className='space-y-2'>
                <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                  Profile Info
                </h3>
                <div className='bg-white border rounded-lg divide-y'>
                  <div className='px-6 py-4 flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Name</span>
                    <span className='text-sm text-gray-900'>{technician.first_name} {technician.last_name}</span>
                  </div>
                  <div className='px-6 py-4 flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Username</span>
                    <span className='text-sm text-gray-900'>{technician.username}</span>
                  </div>
                  <div className='px-6 py-4 flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Email</span>
                    <span className='text-sm text-gray-900'>{technician.email}</span>
                  </div>
                  <div className='px-4 py-3 flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Sections</span>
                    <span className='text-sm text-gray-900'>{sectionNames.join(', ') || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* EDIT FORM - Only visible in edit mode */}
              {mode === 'edit' && (
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                    Edit Profile
                  </h3>
                  <div className='bg-white border rounded-lg divide-y'>
                    {/* Email */}
                    <div className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <label className='text-sm font-medium text-gray-700 min-w-[120px]'>Email:</label>
                        <Input
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          placeholder='Enter email'
                          className='flex-1'
                        />
                      </div>
                    </div>

                    {/* Sections */}
                    <div className='px-6 py-4'>
                      <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-700'>Sections:</label>
                        {sectionInputs.map((_, index) => (
                          <div key={index} className='flex items-center gap-2'>
                            <Select
                              value={editedSections[index]?.toString() || ''}
                              onValueChange={(value) => handleSectionChange(index, value)}
                            >
                              <SelectTrigger className='flex-1'>
                                <SelectValue placeholder='Select a section' />
                              </SelectTrigger>
                              <SelectContent>
                                {sections.map((section) => (
                                  <SelectItem key={section.id} value={section.id.toString()}>
                                    {section.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {sectionInputs.length > 1 && (
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => removeSectionInput(index)}
                                className='px-2'
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={addSectionInput}
                          className='w-full'
                        >
                          <Plus className='h-4 w-4 mr-2' />
                          Add Section
                        </Button>
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
                    Edit Profile
                  </Button>
                </div>
              )}

              {/* Cancel Edit Button - Only in edit mode */}
              {mode === 'edit' && (
                <div className='flex justify-end'>
                  <Button
                    onClick={() => {
                      setMode('view');
                      // Reset to current values
                      if (technician) {
                        setEditedEmail(technician.email || '');
                        setEditedSections(technician.sections || []);
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
