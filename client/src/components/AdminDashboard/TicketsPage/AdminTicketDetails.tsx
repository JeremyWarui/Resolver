import { useState, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Loader2,
  CheckCircle,
  Calendar,
  MessageSquare,
  User,
  FileText,
  PencilRuler,
  Clock,
  UserPlus,
  AlertCircle,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';

// Define form schema for editing ticket
const ticketEditSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().optional(),
  priority: z.string(),
  section: z.string().optional(),
  facility: z.string().optional(),
  location: z.string().optional(),
});

// Define form schema for assigning a ticket
const assignTicketSchema = z.object({
  assignedTo: z.string().min(1, { message: 'Please select a technician.' }),
  note: z.string().optional(),
});

// Define form schema for status update
const statusUpdateSchema = z.object({
  status: z.enum(['open', 'assigned', 'in progress', 'pending', 'resolved']),
  note: z.string().optional(),
});

// Define form schema for comments
const commentSchema = z.object({
  note: z
    .string()
    .min(5, { message: 'Comment must be at least 5 characters.' }),
});

interface AdminTicketDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: any;
  onUpdate?: (updatedTicket: any) => Promise<void>;
  technicians?: any[];
  sections?: any[];
}

const AdminTicketDetails = ({
  isOpen,
  onOpenChange,
  ticket,
  onUpdate,
  technicians = [],
  sections = [],
}: AdminTicketDetailsProps) => {
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Create a ref for the printable content
  const printableRef = useRef(null);

  // Form for editing ticket details
  const editForm = useForm<z.infer<typeof ticketEditSchema>>({
    resolver: zodResolver(ticketEditSchema),
    defaultValues: {
      title: ticket?.title || '',
      description: ticket?.description || '',
      priority: ticket?.priority || 'low',
      section: ticket?.section || '',
      facility: ticket?.facility || '',
      location: ticket?.location || '',
    },
  });

  // Form for adding comments
  const commentForm = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      note: '',
    },
  });

  // Form for status updates
  const statusForm = useForm<z.infer<typeof statusUpdateSchema>>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: ticket?.status || 'open',
      note: '',
    },
  });

  // Form for assigning technician
  const assignForm = useForm<z.infer<typeof assignTicketSchema>>({
    resolver: zodResolver(assignTicketSchema),
    defaultValues: {
      assignedTo: ticket?.assignedTo || '',
      note: '',
    },
  });

  // Statuses
  const statuses = ['open', 'assigned', 'in progress', 'pending', 'resolved'];

  // Priorities
  const priorities = ['low', 'medium', 'high'];

  // Get ticket comments
  const ticketComments = ticket?.comments || [];

  // Setup print functionality
  const handlePrint = useReactToPrint({
    content: () => printableRef.current,
    documentTitle: `Ticket_${ticket.ticket_no}`,
    onAfterPrint: () => toast.success('Ticket printed successfully!'),
  });

  // Handle update form submission
  const onSubmitUpdate = async (values: z.infer<typeof ticketEditSchema>) => {
    setIsSubmitting(true);
    try {
      // Build the updated ticket
      const updatedTicket = {
        ...ticket,
        ...values,
        updatedAt: new Date().toISOString(),
      };

      if (onUpdate) {
        await onUpdate(updatedTicket);
      }

      toast.success('Ticket updated successfully');
      setActiveTab('details');
    } catch (error) {
      console.error('Failed to update ticket:', error);
      toast.error('Failed to update ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle comment form submission
  const onSubmitComment = async (values: z.infer<typeof commentSchema>) => {
    setIsSubmittingComment(true);
    try {
      // In a real app, you would call an API to save the comment
      console.log('Adding admin comment:', values.note);

      toast.success('Comment added successfully');

      // Reset form
      commentForm.reset({ note: '' });
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle status update submission
  const onSubmitStatusUpdate = async (
    values: z.infer<typeof statusUpdateSchema>
  ) => {
    setIsUpdatingStatus(true);
    try {
      // Build the update payload
      const updatedTicket = {
        ...ticket,
        status: values.status,
        updatedAt: new Date().toISOString(),
      };

      // Add the status update note to comments if provided
      if (values.note && values.note.trim()) {
        const statusComment = {
          id: Date.now(), // temp ID
          ticketId: ticket.id,
          text: `Status changed to ${values.status}${values.note ? ': ' + values.note : ''}`,
          technician: 'Admin', // or get from current user
          createdAt: new Date().toISOString(),
          type: 'status_change',
        };

        updatedTicket.comments = [...(ticket.comments || []), statusComment];
      }

      if (onUpdate) {
        await onUpdate(updatedTicket);
      }

      toast.success(`Ticket status updated to ${values.status}`);
      setActiveTab('details');

      // Reset form
      statusForm.reset({
        status: values.status,
        note: '',
      });
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      toast.error('Failed to update ticket status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle assign ticket submission
  const onSubmitAssign = async (values: z.infer<typeof assignTicketSchema>) => {
    setIsAssigning(true);
    try {
      // Build the update payload
      const updatedTicket = {
        ...ticket,
        assignedTo: values.assignedTo,
        status: ticket.status === 'open' ? 'assigned' : ticket.status,
        updatedAt: new Date().toISOString(),
      };

      // Add the assignment note to comments if provided
      if (values.note && values.note.trim()) {
        const assignComment = {
          id: Date.now(), // temp ID
          ticketId: ticket.id,
          text: `Ticket assigned to ${values.assignedTo}${values.note ? ': ' + values.note : ''}`,
          technician: 'Admin', // or get from current user
          createdAt: new Date().toISOString(),
          type: 'assignment',
        };

        updatedTicket.comments = [...(ticket.comments || []), assignComment];
      }

      if (onUpdate) {
        await onUpdate(updatedTicket);
      }

      toast.success(`Ticket assigned to ${values.assignedTo}`);
      setActiveTab('details');

      // Reset form but keep assignedTo value
      assignForm.setValue('note', '');
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      toast.error('Failed to assign ticket');
    } finally {
      setIsAssigning(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInMinutes = diffInMs / (1000 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} minute${Math.floor(diffInMinutes) !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} day${Math.floor(diffInDays) !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status: string) => {
    return status === 'open'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : status === 'assigned'
        ? 'bg-purple-100 text-purple-800 border-purple-200'
        : status === 'in progress'
          ? 'bg-orange-100 text-orange-800 border-orange-200'
          : status === 'pending'
            ? 'bg-gray-100 text-gray-800 border-gray-200'
            : 'bg-green-100 text-green-800 border-green-200';
  };

  // Get priority badge class
  const getPriorityBadgeClass = (priority: string) => {
    return priority === 'high'
      ? 'bg-red-100 text-red-800 border-red-200'
      : priority === 'medium'
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
        : 'bg-green-100 text-green-800 border-green-200';
  };

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className='h-4 w-4 text-blue-600 mr-2' />;
      case 'assigned':
        return <UserPlus className='h-4 w-4 text-purple-600 mr-2' />;
      case 'in progress':
        return <Clock className='h-4 w-4 text-orange-600 mr-2' />;
      case 'pending':
        return <Clock className='h-4 w-4 text-gray-600 mr-2' />;
      case 'resolved':
        return <CheckCircle className='h-4 w-4 text-green-600 mr-2' />;
      default:
        return null;
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='md:max-w-[800px] py-6 px-6'>
        <DialogHeader className='pb-2 border-b'>
          <DialogTitle className='flex items-center'>
            <span>Ticket {ticket.ticket_no}</span>
            <Badge
              variant='outline'
              className={`${getStatusBadgeClass(ticket.status)} ml-2`}
            >
              {ticket.status}
            </Badge>
            {/* <Badge
              variant='outline'
              className={`${getPriorityBadgeClass(ticket.priority)} ml-2`}
            >
              {ticket.priority} priority
            </Badge> */}
          </DialogTitle>
          <DialogDescription className='flex items-center space-x-1'>
            <Calendar className='h-3 w-3 mr-1' />
            <span>Created: {formatDate(ticket.createdAt)}</span>
            <span className='mx-2'>•</span>
            <User className='h-3 w-3 mr-1' />
            <span>Raised by: {ticket.raisedBy || 'Anonymous'}</span>
          </DialogDescription>
        </DialogHeader>

        <div className='mt-4'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid grid-cols-5 mb-4'>
              <TabsTrigger value='details' className='flex items-center'>
                <FileText className='h-4 w-4 mr-2' />
                View Details
              </TabsTrigger>
              <TabsTrigger value='edit' className='flex items-center'>
                <PencilRuler className='h-4 w-4 mr-2' />
                Edit Ticket
              </TabsTrigger>
              <TabsTrigger value='assign' className='flex items-center'>
                <UserPlus className='h-4 w-4 mr-2' />
                Assign Ticket
              </TabsTrigger>
              <TabsTrigger value='status' className='flex items-center'>
                <AlertCircle className='h-4 w-4 mr-2' />
                Update Status
              </TabsTrigger>
              <TabsTrigger value='comments' className='flex items-center'>
                <MessageSquare className='h-4 w-4 mr-2' />
                Comments
                {ticketComments.length > 0 ? ` (${ticketComments.length})` : ''}
              </TabsTrigger>
            </TabsList>

            <div className='min-h-[350px]'>
              {/* View Details Tab */}
              <TabsContent value='details' className='space-y-4'>
                <div className='space-y-4 p-4'>
                  <div>
                    <h3 className='text-lg font-medium'>Title</h3>
                    <p>{ticket.title}</p>
                  </div>

                  <div>
                    <h3 className='text-lg font-medium'>Description</h3>
                    <p className='whitespace-pre-wrap'>
                      {ticket.description || 'No description provided.'}
                    </p>
                  </div>

                  <hr />

                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <h3 className='text-md font-medium'>Section</h3>
                      <p className='text-sm'>
                        {ticket.sectionName || ticket.section}
                      </p>
                    </div>
                    <div>
                      <h3 className='text-md font-medium'>Facility</h3>
                      <p className='text-sm'>{ticket.facility || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className='text-md font-medium'>Location</h3>
                      <p className='text-sm'>{ticket.location || 'N/A'}</p>
                    </div>
                  </div>
                  <hr />
                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <h3 className='text-md font-medium'>Raised By</h3>
                      <p className='text-sm'>{ticket.raisedBy || 'N/A'}</p>
                    </div>

                    <div>
                      <h3 className='text-md font-medium'>Assigned To</h3>
                      <p className='text-sm'>
                        {ticket.assignedTo || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <hr />
                  {/* Display resolution if resolved */}
                  {ticket.status === 'resolved' && ticket.resolution && (
                    <div className='mt-4 border-t pt-4'>
                      <h3 className='text-lg font-medium text-green-700 flex items-center'>
                        <CheckCircle className='h-5 w-5 mr-2' />
                        Resolution
                      </h3>
                      <p className='text-sm bg-green-50 p-3 rounded border border-green-200 mt-2'>
                        {ticket.resolution}
                      </p>
                    </div>
                  )}

                  {/* Display pending reason if pending */}
                  {ticket.status === 'pending' && ticket.pendingReason && (
                    <div className='mt-4 border-t pt-4'>
                      <h3 className='text-lg font-medium text-gray-700 flex items-center'>
                        <Clock className='h-5 w-5 mr-2' />
                        Pending Reason
                      </h3>
                      <p className='text-sm bg-gray-50 p-3 rounded border border-gray-200 mt-2'>
                        {ticket.pendingReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className='flex justify-end'>
                  <Button
                    onClick={handlePrint}
                    className='flex items-center'
                    variant='outline'
                  >
                    <Printer className='mr-2 h-4 w-4' />
                    Print Ticket
                  </Button>
                </div>
              </TabsContent>

              {/* Edit Ticket Tab */}
              <TabsContent value='edit'>
                <Form {...editForm}>
                  <form
                    onSubmit={editForm.handleSubmit(onSubmitUpdate)}
                    className='space-y-4'
                  >
                    <div className='grid grid-cols-1 gap-4'>
                      <FormField
                        control={editForm.control}
                        name='title'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='font-bold'>Title</FormLabel>
                            <FormControl>
                              <Input placeholder='Ticket title' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name='description'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='font-bold'>
                              Description
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='Detailed description of the issue'
                                className='min-h-[100px]'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='grid grid-cols-3 gap-4'>
                      <FormField
                        control={editForm.control}
                        name='section'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='font-bold'>Section</FormLabel>
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
                                {sections.map((section) => (
                                  <SelectItem
                                    key={section.id}
                                    value={section.id}
                                  >
                                    {section.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name='facility'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='font-bold'>
                              Facility
                            </FormLabel>
                            <FormControl>
                              <Input placeholder='Facility name' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={editForm.control}
                        name='location'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='font-bold'>
                              Location
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Specific location'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <FormField
                        control={editForm.control}
                        name='priority'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Select priority' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {priorities.map((priority) => (
                                  <SelectItem key={priority} value={priority}>
                                    {priority.charAt(0).toUpperCase() +
                                      priority.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                     
                    </div> */}

                    <div className='flex justify-end mt-4'>
                      <Button type='submit' disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        Update Ticket
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              {/* Assign Ticket Tab - Now using dropdown instead of radio buttons */}
              <TabsContent value='assign'>
                <Form {...assignForm}>
                  <form
                    onSubmit={assignForm.handleSubmit(onSubmitAssign)}
                    className='space-y-4'
                  >
                    <FormField
                      control={assignForm.control}
                      name='assignedTo'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign to Technician</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select a technician' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {technicians.map((tech) => (
                                <SelectItem
                                  key={tech.id || tech.name}
                                  value={tech.name}
                                >
                                  <div className='flex items-center'>
                                    <User className='h-4 w-4 mr-2 text-muted-foreground' />
                                    {tech.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={assignForm.control}
                      name='note'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignment Note (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Add any notes about this assignment...'
                              className='min-h-[100px]'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='flex justify-end mt-4'>
                      <Button type='submit' disabled={isAssigning}>
                        {isAssigning && (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        Assign Ticket
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              {/* Status Update Tab - Now using dropdown instead of radio buttons */}
              <TabsContent value='status'>
                <Form {...statusForm}>
                  <form
                    onSubmit={statusForm.handleSubmit(onSubmitStatusUpdate)}
                    className='space-y-4'
                  >
                    <FormField
                      control={statusForm.control}
                      name='status'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Update Ticket Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Select a status' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  <div className='flex items-center'>
                                    {getStatusIcon(status)}
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1)}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={statusForm.control}
                      name='note'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Update Note (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Add any notes about this status change...'
                              className='min-h-[100px]'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='flex justify-end mt-4'>
                      <Button type='submit' disabled={isUpdatingStatus}>
                        {isUpdatingStatus && (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        Update Status
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value='comments' className='space-y-4'>
                <Form {...commentForm}>
                  <form
                    onSubmit={commentForm.handleSubmit(onSubmitComment)}
                    className='mb-6'
                  >
                    <FormField
                      control={commentForm.control}
                      name='note'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Add Admin Comment</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Enter a comment or notes about this ticket...'
                              className='min-h-[80px]'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <div className='flex justify-end mt-2'>
                            <Button
                              type='submit'
                              disabled={isSubmittingComment}
                            >
                              {isSubmittingComment && (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              )}
                              Add Comment
                            </Button>
                          </div>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>

                <div className='space-y-1'>
                  <h3 className='text-lg font-medium border-b pb-2'>
                    Comments History
                  </h3>

                  {ticketComments.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-6 bg-gray-50 rounded text-center'>
                      <MessageSquare className='h-10 w-10 text-gray-300 mb-2' />
                      <p className='text-gray-500 font-medium'>
                        No comments yet
                      </p>
                      <p className='text-sm text-gray-400 max-w-sm mt-1'>
                        When you or technicians add comments, they'll appear
                        here.
                      </p>
                    </div>
                  ) : (
                    <div className='border rounded-md bg-white overflow-y-auto max-h-[250px]'>
                      {ticketComments.map((comment, index) => (
                        <div
                          key={comment.id}
                          className={`py-3 px-4 ${index !== 0 ? 'border-t border-gray-200' : ''}`}
                        >
                          <div className='flex justify-between items-center mb-1'>
                            <span className='font-medium text-sm flex items-center'>
                              <User className='h-3 w-3 mr-1 text-blue-600' />
                              {comment.technician}
                            </span>
                            <span
                              className='text-xs text-gray-500'
                              title={formatDate(comment.createdAt)}
                            >
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className='text-sm pl-4'>{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className='mt-4 pt-3 border-t'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminTicketDetails;
