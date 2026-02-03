import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSharedData } from '@/contexts/SharedDataContext';
import sectionsService from '@/api/services/sectionsService';
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

  // Prefill when editing
  useEffect(() => {
    if (section) {
      form.reset({ name: section.name || '', description: section.description || '' });
    }
  }, [section]);

  const onSubmit = async (values: CreateSectionFormValues) => {
    setIsSubmitting(true);
    try {
      if (section) {
        const res = await sectionsService.updateSection(section.id, values);
        if (res) {
          toast.success('Section updated');
          refetchSections(); // Update shared context cache
          onSuccess?.();
        } else {
          toast.error('Failed to update section');
        }
      } else {
        await sectionsService.createSection(values);
        toast.success('Section created');
        refetchSections(); // Update shared context cache
        form.reset();
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      const anyErr = err as any;
      if (anyErr?.response?.data && typeof anyErr.response.data === 'object') {
        const data = anyErr.response.data;
        Object.keys(data).forEach((key) => {
          const val = data[key];
          const message = Array.isArray(val) ? val.join(' ') : String(val);
          if (key === 'non_field_errors' || key === 'detail') {
            toast.error(message);
          } else {
            try { form.setError(key as any, { type: 'server', message }); } catch (e) { }
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>{section ? 'Edit Section' : 'New Section'}</DialogTitle>
          <DialogDescription>{section ? 'Update the section.' : 'Create a new maintenance section.'}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 px-2 py-4'>
            <FormField control={form.control} name='name' render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Section name (e.g., Electrical)' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='description' render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Short description (optional)' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => { onOpenChange(false); form.reset(); }} disabled={isSubmitting}>Cancel</Button>
              <Button type='submit' className='bg-blue-600 hover:bg-blue-700' disabled={isSubmitting}>{isSubmitting ? (section ? 'Saving...' : 'Creating...') : (section ? 'Save Changes' : 'Create Section')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SectionForm;
