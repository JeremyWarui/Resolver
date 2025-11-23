import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useManageFacilities from '@/hooks/facilities/useManageFacilities';
import { createFacilitySchema, type CreateFacilityFormValues } from '@/utils/entityValidation';

interface FacilityFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const facilityTypes = [
  'Office', 'Housing', 'Industrial', 'Mixed Use', 'Conference', 'Technical', 'Parking', 'Food Service', 'Reception', 'Landscape'
];

const FacilityForm = ({ isOpen, onOpenChange, onSuccess }: FacilityFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createFacility } = useManageFacilities();

  const form = useForm<CreateFacilityFormValues>({
    resolver: zodResolver(createFacilitySchema),
    defaultValues: { name: '', type: '', status: 'active', location: '' },
  });

  const onSubmit = async (values: CreateFacilityFormValues) => {
    setIsSubmitting(true);
    try {
      await createFacility(values);
      toast.success('Facility created');
      form.reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create facility');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>New Facility</DialogTitle>
          <DialogDescription>Provide facility details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 px-2 py-4'>
            <FormField control={form.control} name='name' render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Facility name' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='type' render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {facilityTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='location' render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Location (optional)' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => { onOpenChange(false); form.reset(); }} disabled={isSubmitting}>Cancel</Button>
              <Button type='submit' className='bg-blue-600 hover:bg-blue-700' disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Facility'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FacilityForm;
