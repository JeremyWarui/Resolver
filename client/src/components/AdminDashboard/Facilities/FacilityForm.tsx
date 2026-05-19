import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormDialog } from '@/components/Common/FormDialog';
import useManageFacilities from '@/hooks/facilities/useManageFacilities';
import { createFacilitySchema, type CreateFacilityFormValues } from '@/utils/entityValidation';

interface FacilityFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const FACILITY_TYPES = ['Office', 'Housing', 'Industrial', 'Mixed Use', 'Conference', 'Technical', 'Parking', 'Food Service', 'Reception', 'Landscape'];

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
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create facility');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="New Facility"
      description="Provide facility details."
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Create Facility"
      size="lg"
    >
      <FormField control={form.control} name="name" render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Facility name" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="type" render={({ field }) => (
        <FormItem>
          <FormLabel>Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {FACILITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="location" render={({ field }) => (
        <FormItem>
          <FormLabel>Location</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Location (optional)" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </FormDialog>
  );
};

export default FacilityForm;
