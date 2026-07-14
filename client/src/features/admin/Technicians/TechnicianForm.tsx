import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { FormDialog } from '@/components/shared/forms/FormDialog';
import useCreateUser from '@/hooks/users/useCreateUser';
import { useSections } from '@/hooks/sections/useSections';
import { useDepartments } from '@/hooks/useDepartments';
import useUpdateUser from '@/hooks/users/useUpdateUser';
import { createTechnicianSchema, type CreateTechnicianFormValues } from '@/utils/entityValidation';
import { sectionsService } from '@/lib/api/organizations';
import type { Technician, CreateUserPayload, User } from '@/types';

interface TechnicianFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  technician?: Technician | null;
}

const TechnicianForm = ({ isOpen, onOpenChange, onSuccess, technician = null }: TechnicianFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectionInputs, setSectionInputs] = useState<number[]>([0]);
  const [campusFilter, setCampusFilter] = useState<string>('__all__');
  const [departmentFilter, setDepartmentFilter] = useState<string>('__all__');
  const [departmentSections, setDepartmentSections] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingDepartmentSections, setLoadingDepartmentSections] = useState(false);
  const { createUser } = useCreateUser();
  const { updateUser } = useUpdateUser();
  const { sections } = useSections();
  const selectedCampusId = campusFilter !== '__all__' ? Number(campusFilter) : undefined;
  const { data: departments } = useDepartments(selectedCampusId);
  const departmentOptions = Array.isArray(departments) ? departments : [];

  // Unique campuses derived from sections
  const campuses = useMemo(() => {
    const map = new Map<number, { id: number; code: string; name: string }>();
    sections.forEach(s => {
      if (s.campus?.id) map.set(s.campus.id, { id: s.campus.id, code: s.campus.code, name: s.campus.name });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [sections]);

  const [prevDeptFilter, setPrevDeptFilter] = useState(departmentFilter);

  if (prevDeptFilter !== departmentFilter) {
    setPrevDeptFilter(departmentFilter);
    const deptId = departmentFilter !== '__all__' ? Number(departmentFilter) : null;
    if (!deptId || Number.isNaN(deptId)) {
      setDepartmentSections([]);
      setSectionInputs([0]);
    } else {
      setLoadingDepartmentSections(true);
    }
  }

  useEffect(() => {
    const departmentId = departmentFilter !== '__all__' ? Number(departmentFilter) : null;
    if (!departmentId || Number.isNaN(departmentId)) return;

    let active = true;

    sectionsService.getDepartmentSections(departmentId)
      .then((sections) => {
        if (!active) return;
        setDepartmentSections(sections);
        setSectionInputs(prev => (prev.length > 0 ? prev : [0]));
      })
      .catch(() => {
        if (!active) return;
        setDepartmentSections([]);
      })
      .finally(() => {
        if (active) setLoadingDepartmentSections(false);
      });

    return () => {
      active = false;
    };
  }, [departmentFilter]);

  const form = useForm<CreateTechnicianFormValues>({
    resolver: zodResolver(createTechnicianSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      sections: [],
      primary_department_id: null,
    },
  });

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevTechnicianId, setPrevTechnicianId] = useState(technician?.id);

  if (prevIsOpen !== isOpen || prevTechnicianId !== technician?.id) {
    setPrevIsOpen(isOpen);
    setPrevTechnicianId(technician?.id);
    if (isOpen) {
      if (technician) {
        const techSections = technician.sections || [];
        setSectionInputs(techSections.length > 0 ? techSections : [0]);
        setCampusFilter(technician.primary_campus_id ? String(technician.primary_campus_id) : '__all__');
        setDepartmentFilter(technician.primary_department_id ? String(technician.primary_department_id) : '__all__');
        form.reset({
          first_name: technician.first_name || '',
          last_name: technician.last_name || '',
          email: technician.email || '',
          password: '',
          sections: techSections,
          primary_department_id: technician.primary_department_id ?? null,
        });
      } else {
        setSectionInputs([0]);
        setCampusFilter('__all__');
        setDepartmentFilter('__all__');
        setDepartmentSections([]);
        form.reset({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          sections: [],
          primary_department_id: null,
        });
      }
    }
  }

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

      if (technician) {
        const updatePayload: Partial<User> & { password?: string } = {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          role: 'technician',
          sections: filteredSections,
          primary_department_id: values.primary_department_id ?? null,
        };
        if (values.password) {
          updatePayload.password = values.password;
        }
        const res = await updateUser(technician.id, updatePayload);
        if (res) {
          toast.success('Technician updated');
          onSuccess?.();
          onOpenChange(false);
        } else {
          toast.error('Failed to update technician');
        }
      } else {
        const campusId = sections.find(s => filteredSections.includes(s.id))?.campus?.id;
        if (!campusId) {
          toast.error('Select at least one section so the campus can be determined');
          setIsSubmitting(false);
          return;
        }
        const createPayload: CreateUserPayload = {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          password: values.password,
          role: 'technician',
          sections: filteredSections,
          primary_department_id: values.primary_department_id ?? null,
          campus_id: campusId,
        };
        await createUser(createPayload);
        toast.success('Technician created');
        form.reset();
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (err) {
      console.error(err);
      const anyErr = err as { response?: { data?: Record<string, unknown> } };
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
              form.setError(key as keyof CreateTechnicianFormValues, { type: 'server', message });
              foundField = true;
            } catch { /* ignore */ }
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
    <FormDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={technician ? 'Edit Technician' : 'New Technician'}
      description={technician ? 'Update technician details.' : 'Create a new technician account.'}
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitLabel={technician ? 'Save Changes' : 'Create Technician'}
      size="lg"
    >
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
            <PasswordInput {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormItem>
        <FormLabel>Campus</FormLabel>
        <Select
          value={campusFilter}
          onValueChange={val => {
            setCampusFilter(val);
            setDepartmentFilter('__all__');
            setDepartmentSections([]);
            form.setValue('primary_department_id', null);
            form.setValue('sections', []);
            setSectionInputs([0]);
            const validIds = sections
              .filter(s => val === '__all__' || String(s.campus?.id) === val)
              .map(s => s.id);
            const current = form.getValues('sections') || [];
            const kept = current.filter(id => validIds.includes(id));
            if (kept.length > 0) {
              form.setValue('sections', kept);
              setSectionInputs(kept.length > 0 ? kept : [0]);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='All campuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='__all__'>All campuses</SelectItem>
            {campuses.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name} ({c.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>

      <FormField control={form.control} name='primary_department_id' render={({ field }) => (
        <FormItem>
          <FormLabel>Department</FormLabel>
          <Select
            value={field.value != null ? String(field.value) : '__none__'}
            onValueChange={(value) => {
              const next = value === '__none__' ? null : Number(value);
              field.onChange(next);
              setDepartmentFilter(value === '__none__' ? '__all__' : value);
              setSectionInputs([0]);
              form.setValue('sections', []);
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder='Select department' />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value='__none__'>No department</SelectItem>
              {departmentOptions.map((department) => (
                <SelectItem key={department.id} value={String(department.id)}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name='sections' render={({ field }) => (
        <FormItem>
          <FormLabel>Sections</FormLabel>
          <div className='space-y-2'>
            {departmentFilter === '__all__' ? (
              <p className='text-sm text-muted-foreground'>Select a department first to see its sections.</p>
            ) : loadingDepartmentSections ? (
              <p className='text-sm text-muted-foreground'>Loading sections...</p>
            ) : departmentSections.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No sections found for this department.</p>
            ) : null}
            {sectionInputs.map((_, index) => (
              <div key={index} className='flex items-center gap-2'>
                <Select
                  value={field.value?.[index]?.toString() || ''}
                  onValueChange={(value) => handleSectionChange(index, value)}
                  disabled={departmentFilter === '__all__' || loadingDepartmentSections || departmentSections.length === 0}
                >
                  <SelectTrigger className='flex-1'>
                    <SelectValue placeholder='Select a section' />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentSections.map((section) => (
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
    </FormDialog>
  );
};

export default TechnicianForm;
