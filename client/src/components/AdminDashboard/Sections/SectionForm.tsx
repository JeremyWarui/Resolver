import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormDialog } from '@/components/Common/FormDialog';
import { useSharedData } from '@/contexts/SharedDataContext';
import { sectionsService } from '@/api/services/organizationsService';
import { createSectionSchema, type CreateSectionFormValues } from '@/utils/entityValidation';

interface SectionFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  section?: { id: number; name: string; description?: string } | null;
}

const SectionForm = ({ isOpen, onOpenChange, onSuccess, section = null }: SectionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refetchSections } = useSharedData();

  const form = useForm<CreateSectionFormValues>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (section) {
      form.reset({ name: section.name || '', description: section.description || '' });
    }
  }, [section, form]);

  const onSubmit = async (values: CreateSectionFormValues) => {
    setIsSubmitting(true);
    try {
      if (section) {
        const res = await sectionsService.updateSection(section.id, values);
        if (res) {
          toast.success('Section updated');
          refetchSections();
          onSuccess?.();
          onOpenChange(false);
        } else {
          toast.error('Failed to update section');
        }
      } else {
        await sectionsService.createSection(values);
        toast.success('Section created');
        refetchSections();
        form.reset();
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (err) {
      console.error(err);
      const anyErr = err as { response?: { data?: Record<string, unknown> } };
      if (anyErr?.response?.data && typeof anyErr.response.data === 'object') {
        const data = anyErr.response.data;
        Object.keys(data).forEach((key) => {
          const val = data[key];
          const message = Array.isArray(val) ? val.join(' ') : String(val);
          if (key === 'non_field_errors' || key === 'detail') {
            toast.error(message);
          } else {
            try { form.setError(key as keyof CreateSectionFormValues, { type: 'server', message }); } catch { /* ignore */ }
          }
        });
      } else {
        toast.error('Failed to save section');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={section ? 'Edit Section' : 'New Section'}
      description={section ? 'Update the section.' : 'Create a new maintenance section.'}
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitLabel={section ? 'Save Changes' : 'Create Section'}
      size="md"
    >
      <FormField control={form.control} name="name" render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Section name (e.g., Electrical)" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="description" render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Short description (optional)" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </FormDialog>
  );
};

export default SectionForm;
