import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// Import REST API hooks
import useFacilities from '@/hooks/facilities/useFacilities';
import useTickets from '@/hooks/tickets/useTickets';
import useCreateTicket from '@/hooks/tickets/useCreateTicket';
import { createTicketSchema, type CreateTicketFormValues } from '@/utils/ticketValidation';


interface CreateTicketProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Optional callback after successful creation
}

const CreateTicket = ({ isOpen, onOpenChange, onSuccess }: CreateTicketProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch facilities using the REST API hook
  const { facilities, loading: facilitiesLoading } = useFacilities();

  // Get sections from the tickets hook (since it returns sections)
  const { sections, loading: sectionsLoading } = useTickets({
    page_size: 1, // Just need minimal data to get sections
  });

  // Setup create ticket hook
  const { createTicket } = useCreateTicket();

  // Initialize form with default values
  const form = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      section_id: '',
      facility_id: '',
    },
  });

  // Handle form submission
  async function onSubmit(values: CreateTicketFormValues) {
    setIsSubmitting(true);
    console.log('Form submission started with values:', values);

    try {
      console.log('Attempting to create ticket...');
      // DEMO: Always use user id 2 as the creator (raised_by)
      const result = await createTicket({
        ...values,
        section_id: Number(values.section_id),
        facility_id: Number(values.facility_id),
      });
      console.log('Create ticket result:', result);

      // Show success message using Sonner toast
      toast.success('Ticket Created', {
        description: `Ticket ${result.ticket_no || 'was'} successfully created.`,
      });

      // Reset form after successful submission
      form.reset();
      onOpenChange(false); // Close modal on success
      
      // Call onSuccess callback if provided (for refetching ticket list)
      onSuccess?.();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Error', {
        description: 'Failed to create ticket. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>New Ticket</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new maintenance ticket.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            {/* Title */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Brief description of the issue'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Provide details about the issue'
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Section */}
            <FormField
              control={form.control}
              name='section_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={sectionsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select the appropriate section' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={String(section.id)}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Facility */}
            <FormField
              control={form.control}
              name='facility_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={facilitiesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a facility' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {facilities.map((facility) => (
                        <SelectItem key={facility.id} value={String(facility.id)}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='bg-blue-600 hover:bg-blue-700'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Submitting...
                  </>
                ) : (
                  'Submit Ticket'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicket;
