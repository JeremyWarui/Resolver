import { useState, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Loader2,
  CheckCircle,
  Clock,
  Calendar,
  MessageSquare,
  User,
  PlayCircle,
  ClipboardList,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

// Define form schema for comments
const commentsSchema = z.object({
  note: z
    .string()
    .min(5, { message: 'Comment must be at least 5 characters.' }),
});

// Define form schema for status update
const statusUpdateSchema = z.object({
  status: z.enum(['in progress', 'pending', 'resolved']),
  reason: z.string().optional(),
  resolution: z.string().optional(),
});

interface TechTicketDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: any;
  onUpdate?: (updatedTicket: any) => Promise<void>;
}

// Sample activity timeline data
const sampleActivities = [
  {
    id: 1,
    ticketId: 5,
    type: 'status_change',
    from: 'open',
    to: 'in progress',
    timestamp: '2025-04-22T09:30:00Z',
    user: 'Lisa Johnson',
  },
  {
    id: 2,
    ticketId: 5,
    type: 'note_added',
    timestamp: '2025-04-22T16:45:00Z',
    user: 'Lisa Johnson',
  },
  {
    id: 3,
    ticketId: 5,
    type: 'note_added',
    timestamp: '2025-04-23T10:30:00Z',
    user: 'Lisa Johnson',
  },
];

const TechTicketDetails = ({
  isOpen,
  onOpenChange,
  ticket,
  onUpdate,
}: TechTicketDetailsProps) => {
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Initialize the comments form
  const commentsForm = useForm<z.infer<typeof commentsSchema>>({
    resolver: zodResolver(commentsSchema),
    defaultValues: {
      note: '',
    },
  });

  // Initialize the status update form
  const statusForm = useForm<z.infer<typeof statusUpdateSchema>>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: ticket?.status || 'in progress',
      reason: '',
      resolution: '',
    },
  });

  // Get ticket comments directly from the ticket object
  const ticketComments = useMemo(
    () => ticket?.comments || [],
    [ticket?.comments]
  );

  // Filter activities for this specific ticket
  const ticketActivities = sampleActivities.filter(
    (activity) => activity.ticketId === ticket?.id
  );

  // Combine comments and activities for the timeline view, sorted by timestamp
  const timelineItems = useMemo(() => {
    const combined = [
      ...ticketComments.map((comment) => ({
        id: `comment-${comment.id}`,
        timestamp: comment.createdAt,
        type: 'comment',
        user: comment.technician,
        content: comment.text,
      })),
      ...ticketActivities.map((activity) => ({
        id: `activity-${activity.id}`,
        timestamp: activity.timestamp,
        type: activity.type,
        user: activity.user,
        from: activity.from,
        to: activity.to,
      })),
    ];

    // Sort by timestamp, newest first
    return combined.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [ticketComments, ticketActivities]);

  // Handle form submission for comments
  const onSubmitComment = async (values: z.infer<typeof commentsSchema>) => {
    setIsSubmittingNote(true);
    try {
      // In a real app, you would call an API to save the note
      console.log('Adding comment:', values.note);

      // Show success message
      toast.success('Comment added successfully');

      // Reset form
      commentsForm.reset({ note: '' });
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Handle form submission for status update
  const onSubmitStatusUpdate = async (
    values: z.infer<typeof statusUpdateSchema>
  ) => {
    setIsUpdatingStatus(true);
    try {
      // Build the update payload
      const updatePayload = {
        ...ticket,
        status: values.status,
      };

      // Add reason if status is pending
      if (values.status === 'pending' && values.reason) {
        updatePayload.pendingReason = values.reason;
      }

      // Add resolution if status is resolved
      if (values.status === 'resolved' && values.resolution) {
        updatePayload.resolution = values.resolution;
      }

      // In a real app, this would call the update API
      if (onUpdate) {
        await onUpdate(updatePayload);
      }

      // Show success message
      toast.success(`Ticket status updated to ${values.status}`);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      toast.error('Failed to update ticket status');
    } finally {
      setIsUpdatingStatus(false);
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
      : status === 'in progress'
        ? 'bg-orange-100 text-orange-800 border-orange-200'
        : status === 'pending'
          ? 'bg-gray-100 text-gray-800 border-gray-200'
          : 'bg-green-100 text-green-800 border-green-200';
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
            <Badge
              variant='outline'
              className='bg-purple-100 text-purple-800 border-purple-200 ml-2'
            >
              {ticket.priority} priority
            </Badge>
          </DialogTitle>
          <DialogDescription className='flex items-center space-x-1'>
            <Calendar className='h-3 w-3 mr-1' />
            <span>Created: {formatDate(ticket.createdAt)}</span>
            <span className='mx-2'>•</span>
            <User className='h-3 w-3 mr-1' />
            <span>Raised by: {ticket.raisedBy}</span>
          </DialogDescription>
        </DialogHeader>

        <div className='mt-4'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid grid-cols-3 mb-4'>
              <TabsTrigger value='details' className='flex items-center'>
                <FileText className='h-4 w-4 mr-2' />
                Details
              </TabsTrigger>
              <TabsTrigger value='comments' className='flex items-center'>
                <MessageSquare className='h-4 w-4 mr-2' />
                Comments{' '}
                {ticketComments.length > 0 ? `(${ticketComments.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value='update' className='flex items-center'>
                <ClipboardList className='h-4 w-4 mr-2' />
                Update Status
              </TabsTrigger>
            </TabsList>

            <div className='min-h-[350px]'>
              {/* Ticket Details Tab */}
              <TabsContent value='details' className='space-y-4'>
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
                    <p className='text-sm'>{ticket.section}</p>
                  </div>
                  <div>
                    <h3 className='text-md font-medium'>Facility</h3>
                    <p className='text-sm'>{ticket.facilityName}</p>
                  </div>
                  <div>
                    <h3 className='text-md font-medium'>Location</h3>
                    <p className='text-sm'>{ticket.location}</p>
                  </div>
                </div>

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
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value='comments' className='space-y-2'>
                <Form {...commentsForm}>
                  <form
                    onSubmit={commentsForm.handleSubmit(onSubmitComment)}
                    className='mb-6'
                  >
                    <FormField
                      control={commentsForm.control}
                      name='note'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Add Comment</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Enter details about work performed, findings, or next steps...'
                              className='min-h-[80px]'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <div className='flex justify-end mt-2'>
                            <Button type='submit' disabled={isSubmittingNote}>
                              {isSubmittingNote && (
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

                <div className="space-y-1">
                  <h3 className="text-lg font-medium border-b pb-2">Comments History</h3>
                  
                  {ticketComments.length === 0 ? (
                    <div className="flex flex-col items-start justify-center py-2 bg-gray-50 rounded text-center">
                      <MessageSquare className="h-5 w-10 text-gray-300 mb-1" />
                      <p className="text-gray-500 font-medium">No comments yet</p>
                      <p className="text-sm text-gray-400 max-w-sm mt-1">
                        When you or other technicians add comments, they'll appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-md bg-white overflow-y-auto max-h-[120px] scrollbar-thin">
                      {ticketComments.map((comment, index) => (
                        <div 
                          key={comment.id} 
                          className={`py-3 px-4 ${index !== 0 ? 'border-t border-gray-200' : ''}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm flex items-center">
                              <User className="h-3 w-3 mr-1 text-blue-600" />
                              {comment.technician}
                            </span>
                            <span className="text-xs text-gray-500" title={formatDate(comment.createdAt)}>
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm pl-4">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              {/* Update Status Tab */}
              <TabsContent value='update' className='space-y-4'>
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
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Update the status of this ticket' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='in progress'>
                                  <div className='flex items-center'>
                                    <PlayCircle className='mr-2 h-4 w-4 text-orange-600' />
                                    <span>In Progress</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value='pending'>
                                  <div className='flex items-center'>
                                    <Clock className='mr-2 h-4 w-4 text-gray-600' />
                                    <span>Pending</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value='resolved'>
                                  <div className='flex items-center'>
                                    <CheckCircle className='mr-2 h-4 w-4 text-green-600' />
                                    <span>Resolved</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <p className='text-xs text-gray-500 mt-1'>
                            Change the status to reflect the current state of
                            this ticket
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Conditional fields based on status */}
                    {statusForm.watch('status') === 'pending' && (
                      <FormField
                        control={statusForm.control}
                        name='reason'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason for Pending</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='Explain why this ticket is being put on hold...'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {statusForm.watch('status') === 'resolved' && (
                      <FormField
                        control={statusForm.control}
                        name='resolution'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resolution Details</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='Describe how the issue was resolved...'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className='pt-4 flex justify-end'>
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
            </div>
          </Tabs>
        </div>

        <DialogFooter className='mt-2 pt-3 border-t'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TechTicketDetails;
