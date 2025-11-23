import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import useCreateUser from '@/hooks/users/useCreateUser';
import useSections from '@/hooks/sections/useSections';
import useUpdateUser from '@/hooks/users/useUpdateUser';
import { createTechnicianSchema, type CreateTechnicianFormValues } from '@/utils/entityValidation';
import type { Technician } from '@/types';

interface TechnicianFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  technician?: Technician | null;
}

const TechnicianForm = ({ isOpen, onOpenChange, onSuccess, technician = null }: TechnicianFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectionInputs, setSectionInputs] = useState<number[]>([0]); // Array of section IDs, start with one empty input
  const { createUser } = useCreateUser();
  const { updateUser } = useUpdateUser();
  const { sections } = useSections();

  const form = useForm<CreateTechnicianFormValues>({
    resolver: zodResolver(createTechnicianSchema),
    defaultValues: { first_name: '', last_name: '', email: '', password: '', sections: [] },
  });

  // If editing, populate defaults
  useEffect(() => {
    if (technician) {
      const techSections = technician.sections || [];
      setSectionInputs(techSections.length > 0 ? techSections : [0]); // At least one input
      form.reset({
        first_name: technician.first_name || '',
        last_name: technician.last_name || '',
        email: technician.email || '',
        password: '',
        sections: techSections,
      });
    } else {
      // Reset for new technician
      setSectionInputs([0]);
      form.reset({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        sections: [],
      });
    }
  }, [technician, form]);

  // Handle adding a new section input
  const addSectionInput = () => {
    setSectionInputs(prev => [...prev, 0]);
  };

  // Handle removing a section input
  const removeSectionInput = (index: number) => {
    if (sectionInputs.length > 1) {
      setSectionInputs(prev => prev.filter((_, i) => i !== index));
      // Update form sections array
      const currentSections = form.getValues('sections') || [];
      const newSections = currentSections.filter((_, i) => i !== index);
      form.setValue('sections', newSections);
    }
  };

  // Handle section selection change
  const handleSectionChange = (index: number, sectionId: string) => {
    const id = parseInt(sectionId);
    const currentSections = form.getValues('sections') || [];
    const newSections = [...currentSections];
    newSections[index] = id;
    form.setValue('sections', newSections);
  };

  const onSubmit = async (values: CreateTechnicianFormValues) => {
    setIsSubmitting(true);
    try {
      // Filter out any zero/empty section IDs
      const filteredSections = (values.sections || []).filter(id => id && id > 0);

      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        ...(values.password ? { password: values.password } : {}),
        role: 'technician' as const,
        sections: filteredSections,
      };

      if (technician) {
        const res = await updateUser(technician.id, payload as any);
        if (res) {
          toast.success('Technician updated');
          onSuccess?.();
        } else {
          toast.error('Failed to update technician');
        }
      } else {
        await createUser(payload as any);
        toast.success('Technician created');
        form.reset();
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      const anyErr = err as any;
      if (anyErr?.response?.data && typeof anyErr.response.data === 'object') {
        const data = anyErr.response.data;
        let foundField = false;
        Object.keys(data).forEach((key) => {
          const val = data[key];
          const message = Array.isArray(val) ? val.join(' ') : String(val);
          if (key === 'non_field_errors' || key === 'detail') {
            toast.error(message);
          } else {
            try {
              form.setError(key as any, { type: 'server', message });
              foundField = true;
            } catch (e) {
              // ignore
            }
          }
        });
        if (!foundField) toast.error('Failed to save technician');
      } else {
        toast.error('Failed to save technician');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>New Technician</DialogTitle>
          <DialogDescription>Create a new technician account.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 px-2 py-4'>
            <FormField control={form.control} name='first_name' render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='last_name' render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='email' render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='password' render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type='password' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='sections' render={({ field }) => (
              <FormItem>
                <FormLabel>Sections</FormLabel>
                <div className='space-y-2'>
                  {sectionInputs.map((_, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <Select
                        value={field.value?.[index]?.toString() || ''}
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
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => { onOpenChange(false); form.reset(); }} disabled={isSubmitting}>Cancel</Button>
              <Button type='submit' className='bg-blue-600 hover:bg-blue-700' disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Technician'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TechnicianForm;
