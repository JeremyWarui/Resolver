import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Import REST API hooks
import useFacilities from '@/hooks/facilities/useFacilities';
import useTickets from '@/hooks/tickets/useTickets';
import useCreateTicket from '@/hooks/tickets/useCreateTicket';


// Define form schema using Zod
const formSchema = z.object({
  title: z.string().min(5, {
    message: 'Title must be at least 5 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  section_id: z.string({
    required_error: 'Please select a section.',
  }),
  facility_id: z.string({
    required_error: 'Please select a facility.',
  }),
});

const CreateTicket = () => {
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      section_id: '',
      facility_id: '',
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log('Form submission started with values:', values);

    try {
      console.log('Attempting to create ticket...');
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
    <div className='flex-1 overflow-y-auto p-4 bg-gray-50'>
      <div className='flex items-center space-x-2'>
        <p className='text-sm text-gray-600'>
          Fill out the form below to raise a new ticket.
        </p>
      </div>
      <div className='mt-4'>
        <Card className='w-full py-6 '>
          <CardHeader>
            <CardTitle className='pb-4'>Create New Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className=' grid grid-cols-2 gap-8 space-y-6'
              >
                <div className='flex flex-col space-y-8'>
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
                        <FormDescription>
                          A short title that describes the issue.
                        </FormDescription>
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
                            className='min-h-[120px]'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description of the problem.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='flex flex-col gap-2.5 space-y-6'>
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
                        <FormDescription>
                          The Section responsible for handling this issue.
                        </FormDescription>
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
                        <FormDescription>
                          The building or facility where the issue is located.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit button */}
                <Button
                  type='submit'
                  className='w-full md:w-auto bg-[#0078d4] hover:bg-[#106ebe]'
                  disabled={isSubmitting} // Re-enable this to prevent multiple submissions
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
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTicket;
