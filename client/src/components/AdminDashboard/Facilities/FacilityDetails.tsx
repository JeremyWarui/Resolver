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
import { Loader2 } from 'lucide-react';
import { useManageFacilities } from '@/hooks/facilities/useManageFacilities';
import type { Facility } from '@/types';

interface FacilityDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  facility: Facility | null;
  onUpdated?: () => void;
}

export default function FacilityDetails({ isOpen, onOpenChange, facility, onUpdated }: FacilityDetailsProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [editedName, setEditedName] = useState('');
  const [editedType, setEditedType] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [editedLocation, setEditedLocation] = useState('');

  const { updateFacility, loading: isUpdating } = useManageFacilities();

  // Sync edit state
  useEffect(() => {
    if (facility) {
      setEditedName(facility.name || '');
      setEditedType(facility.type || '');
      setEditedStatus(facility.status || '');
      setEditedLocation(facility.location || '');
    }
  }, [facility]);

  if (!facility) return null;

  const handleClose = () => {
    setMode('view');
    onOpenChange(false);
    // Reset
    if (facility) {
      setEditedName(facility.name || '');
      setEditedType(facility.type || '');
      setEditedStatus(facility.status || '');
      setEditedLocation(facility.location || '');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const payload = {
        name: editedName,
        type: editedType as any,
        status: editedStatus,
        location: editedLocation,
      };
      await updateFacility(facility.id, payload);
      toast.success('Facility updated successfully');
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
        toast.error('Failed to update facility');
      }
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
          <div className='flex items-center gap-3'>
            <SheetTitle className='text-base font-bold text-gray-900'>
              {facility.name}
            </SheetTitle>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              facility.status === 'active' ? 'bg-green-100 text-green-800' :
              facility.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {facility.status || 'Unknown'}
            </span>
          </div>
          <SheetDescription className='text-sm text-gray-600'>
            Facility details and metrics
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
                    <span className='text-sm text-gray-900'>{facility.name}</span>
                  </div>
                  <div className='px-6 py-4 flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Type</span>
                    <span className='text-sm text-gray-900'>{facility.type || '—'}</span>
                  </div>
                  <div className='px-6 py-4 flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      facility.status === 'active' ? 'bg-green-100 text-green-800' :
                      facility.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {facility.status || '—'}
                    </span>
                  </div>
                  <div className='px-6 py-4 flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-600'>Location</span>
                    <span className='text-sm text-gray-900'>{facility.location || '—'}</span>
                  </div>
                </div>
              </div>

              {/* EDIT FORM - Only visible in edit mode */}
              {mode === 'edit' && (
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                    Edit Facility
                  </h3>
                  <div className='bg-white border rounded-lg divide-y'>
                    {/* Name */}
                    <div className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <label className='text-sm font-medium text-gray-700 min-w-[120px]'>Name:</label>
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder='Enter facility name'
                          className='flex-1'
                        />
                      </div>
                    </div>

                    {/* Type */}
                    <div className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <label className='text-sm font-medium text-gray-700 min-w-[120px]'>Type:</label>
                        <Input
                          value={editedType}
                          onChange={(e) => setEditedType(e.target.value)}
                          placeholder='Enter facility type'
                          className='flex-1'
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <label className='text-sm font-medium text-gray-700 min-w-[120px]'>Status:</label>
                        <Select value={editedStatus} onValueChange={setEditedStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='active'>Active</SelectItem>
                            <SelectItem value='inactive'>Inactive</SelectItem>
                            <SelectItem value='maintenance'>Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Location */}
                    <div className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <label className='text-sm font-medium text-gray-700 min-w-[120px]'>Location:</label>
                        <Input
                          value={editedLocation}
                          onChange={(e) => setEditedLocation(e.target.value)}
                          placeholder='Enter location'
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
                    Edit Facility
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
                      if (facility) {
                        setEditedName(facility.name || '');
                        setEditedType(facility.type || '');
                        setEditedStatus(facility.status || '');
                        setEditedLocation(facility.location || '');
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
