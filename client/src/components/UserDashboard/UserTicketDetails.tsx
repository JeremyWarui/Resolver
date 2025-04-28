import { useState } from 'react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

// Define sections
const sectionOptions = [
  'HVAC',
  'IT',
  'Plumbing',
  'Electrical',
  'Structural',
  'Mechanical',
  'Kitchen',
  'Grounds',
  'Security',
];

// Form schema for ticket editing
const ticketFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters.' }),
  section: z.string().min(1, { message: 'Please select a section.' }),
  facility: z.string().min(1, { message: 'Please enter a facility.' }),
});

interface TicketDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: any; // Type this better based on your ticket structure
  onUpdate?: (updatedTicket: any) => Promise<void>;
  technicians?: { id: string; name: string }[];
}

export default function TicketDetailDialog({
  isOpen,
  onOpenChange,
  ticket,
  onUpdate,
  technicians = [],
}: TicketDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<z.infer<typeof ticketFormSchema>>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: ticket?.title || '',
      description: ticket?.description || '',
      section: ticket?.section || '',
      facility: ticket?.facility || '',
    },
  });

  // Update form values when ticket changes
  useState(() => {
    if (ticket) {
      form.reset({
        title: ticket.title || '',
        description: ticket.description || '',
        section: ticket.section || '',
        facility: ticket.facility || '',
      });
    }
  }, [ticket, form]);

  // Function to handle form submission
  const onSubmit = async (values: z.infer<typeof ticketFormSchema>) => {
    if (!onUpdate) return;

    setIsSubmitting(true);
    try {
      await onUpdate({
        ...ticket,
        ...values,
      });
      setIsEditing(false);
      // Success notification could be added here
    } catch (error) {
      console.error('Failed to update ticket:', error);
      // Error notification could be added here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset({
      title: ticket?.title || '',
      description: ticket?.description || '',
      section: ticket?.section || '',
      facility: ticket?.facility || '',
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='md:max-w-[700px] py-12 px-8'>
        <DialogHeader>
          <DialogTitle>
            Ticket - {ticket.ticket_no}
            <Badge
              variant='outline'
              className={
                ticket.status === 'open'
                  ? 'bg-blue-100 text-blue-800 border-blue-200 ml-2'
                  : ticket.status === 'assigned'
                    ? 'bg-purple-100 text-purple-800 border-purple-200 ml-2'
                    : ticket.status === 'in progress'
                      ? 'bg-orange-100 text-orange-800 border-orange-200 ml-2'
                      : ticket.status === 'pending'
                        ? 'bg-gray-100 text-gray-800 border-gray-200 ml-2'
                        : 'bg-green-100 text-green-800 border-green-200 ml-2'
              }
            >
              {ticket.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            • Created At {formatDate(ticket.createdAt)}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <hr />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='section'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select section' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sectionOptions.map((section) => (
                            <SelectItem key={section} value={section}>
                              {section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='facility'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facility</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className='pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <>
            <div className='space-y-4'>
              <div>
                <h4 className='mt-3 text-lg'>Title</h4>
                <p className='mt-1 text-md'>{ticket.title}</p>
              </div>

              <div>
                <h4 className='text-lg'>Description</h4>
                <p className='mt-1 text-md whitespace-pre-wrap'>
                  {ticket.description || 'N/A'}
                </p>
              </div>
              <hr />
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h4 className='text-md'>Section</h4>
                  <p className='mt-1 text-sm'>
                    {ticket.sectionName || ticket.section}
                  </p>
                </div>

                <div>
                  <h4 className='text-md'>Facility</h4>
                  <p className='mt-1 text-sm'>{ticket.facility || 'N/A'}</p>
                </div>
              </div>

              <hr />
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h4 className='text-md'>Raised By</h4>
                  <p className='mt-1 text-sm'>{ticket.raisedBy || 'N/A'}</p>
                </div>

                <div>
                  <h4 className='text-md'>Assigned To</h4>
                  <p className='mt-1 text-sm'>
                    {ticket.assignedTo || 'Not assigned'}
                  </p>
                </div>
              </div>

              <hr />
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h4 className='text-md'>Created</h4>
                  <p className='mt-1 text-sm'>{formatDate(ticket.createdAt)}</p>
                </div>

                <div>
                  <h4 className='text-md'>Last Updated</h4>
                  <p className='mt-1 text-sm'>{formatDate(ticket.updatedAt)}</p>
                </div>
              </div>
            </div>

            <hr />
            <DialogFooter>
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {ticket.raisedBy === 'John Doe' && onUpdate && (
                <Button onClick={() => setIsEditing(true)}>Edit Ticket</Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
