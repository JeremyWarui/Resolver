import { useState } from 'react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, User, Loader2, Star } from 'lucide-react';
import type { Ticket } from '@/types';
import { formatDate } from '@/utils/date';
import { getStatusBadgeVariant } from '@/components/Common/DataTable/utils/TicketDetailsUtils';
import { TicketComments } from '@/components/Common/DataTable/sidebar/TicketComments';
import useFacilities from '@/hooks/facilities/useFacilities';
import useSections from '@/hooks/sections/useSections';
import ticketsService from '@/api/services/ticketsService';
import useUserData from '@/hooks/users/useUserData';
import { useUsers } from '@/hooks/users';

export interface UserTicketDetailsSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
  currentUser?: string;
  onUpdate?: (updatedTicket: Ticket) => Promise<void>;
  viewOnly?: boolean; // New prop to disable editing entirely
}

export function UserTicketDetailsSidebar({
  isOpen,
  onOpenChange,
  ticket,
  currentUser: _currentUser, // Kept for backward compatibility but unused
  onUpdate,
  viewOnly = false,
}: UserTicketDetailsSidebarProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get current logged-in user data
  const { userData } = useUserData();
  
  // Check if the logged-in user is the one who raised this ticket
  const isTicketOwner = userData?.username === ticket.raised_by;
  
  // Edit form state
  const [editedTitle, setEditedTitle] = useState(ticket.title);
  const [editedDescription, setEditedDescription] = useState(ticket.description);
  const [editedSectionId, setEditedSectionId] = useState<number | null>(ticket.section_id || null);
  const [editedFacilityId, setEditedFacilityId] = useState<number | null>(ticket.facility_id || null);

  // Rating state
  const [rating, setRating] = useState(ticket.feedback?.rating || 0);
  const [ratingComment, setRatingComment] = useState(ticket.feedback?.comment || '');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Fetch facilities and sections
  const { facilities } = useFacilities();
  const { sections } = useSections();
  
  // Fetch users to get the full name of the person who raised the ticket
  const { users } = useUsers({ page_size: 100 });
  const raisedByUser = users.find(u => u.username === ticket.raised_by);
  const raisedByName = raisedByUser 
    ? `${raisedByUser.first_name} ${raisedByUser.last_name}`
    : ticket.raised_by;

  const isOpen_status = ticket.status === 'open';
  const isClosed = ticket.status === 'closed';
  const isResolved = ticket.status === 'resolved';

  const handleClose = () => {
    setMode('view');
    onOpenChange(false);
    // Reset form state to actual ticket values
    setEditedTitle(ticket.title);
    setEditedDescription(ticket.description);
    setEditedSectionId(ticket.section_id || null);
    setEditedFacilityId(ticket.facility_id || null);
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      const updatedTicket: Ticket = {
        ...ticket,
        title: editedTitle,
        description: editedDescription,
        section_id: editedSectionId!,
        facility_id: editedFacilityId!,
      };
      
      await onUpdate?.(updatedTicket);
      
      toast.success('Ticket updated successfully', {
        description: `${ticket.ticket_no} has been updated`,
      });
      setMode('view');
    } catch (error) {
      toast.error('Failed to update ticket', {
        description: 'Please try again or contact support',
      });
      console.error('Update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelTicket = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this ticket? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      const updatedTicket: Ticket = {
        ...ticket,
        status: 'closed',
      };
      
      await onUpdate?.(updatedTicket);
      
      toast.info('Ticket cancelled', {
        description: `${ticket.ticket_no} has been cancelled`,
      });
      setMode('view');
    } catch (error) {
      toast.error('Failed to cancel ticket');
      console.error('Cancel error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmittingRating(true);
    try {
      await ticketsService.addTicketFeedback(ticket.id, rating, ratingComment);
      
      toast.success('Thank you for your feedback!', {
        description: 'Your rating has been submitted',
      });
      
      // Refresh ticket data
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to submit rating');
      console.error('Rating error:', error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleConfirmClosure = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to close this ticket? This will mark it as completed.'
    );
    
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      const updatedTicket: Ticket = {
        ...ticket,
        status: 'closed',
      };
      
      await onUpdate?.(updatedTicket);
      
      toast.success('Ticket closed', {
        description: `${ticket.ticket_no} has been closed`,
      });
    } catch (error) {
      toast.error('Failed to close ticket');
      console.error('Close error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side='right'
        className='sm:!max-w-none sm:w-[450px] lg:w-[500px] xl:w-[600px] p-0 flex flex-col'
      >
        {/* HEADER */}
        <SheetHeader className='px-6 py-4 border-b bg-gray-50/50 space-y-3'>
          {/* Ticket ID + Status Badge */}
          <div className='flex items-center gap-3'>
            <SheetTitle className='text-base font-bold text-gray-900'>
              {ticket.ticket_no}
            </SheetTitle>
            <Badge
              variant='outline'
              className={getStatusBadgeVariant(ticket.status)}
            >
              {ticket.status.charAt(0).toUpperCase() +
                ticket.status.slice(1).replace('_', ' ')}
            </Badge>
          </div>

          {/* Title */}
          <h2 className='text-lg font-semibold text-gray-900 leading-tight'>
            {ticket.title}
          </h2>

          {/* Raised by + Date Created */}
          <div className='flex items-center gap-4 text-sm text-gray-600'>
            <div className='flex items-center gap-1.5'>
              <User className='h-4 w-4' />
              <span>Raised by: {isTicketOwner ? 'You' : raisedByName}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Calendar className='h-4 w-4' />
              <span>Date Created: {formatDate(ticket.created_at)}</span>
            </div>
          </div>

          {/* Hidden description for accessibility */}
          <SheetDescription className='sr-only'>
            Ticket details for {ticket.ticket_no} - {ticket.title}
          </SheetDescription>
        </SheetHeader>

        {/* CONTENT - Scrollable */}
        <ScrollArea className='flex-1'>
          <div className='px-6 py-4'>
            {isUpdating ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-16 w-3/4" />
              </div>
            ) : (
              <div className='space-y-6'>
                {/* DESCRIPTION SECTION */}
                <div className='space-y-2'>
                  <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                    Description
                  </h3>
                  {mode === 'edit' && isOpen_status ? (
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      rows={5}
                      className='w-full'
                      placeholder='Enter ticket description'
                    />
                  ) : (
                    <div className='bg-gray-50 rounded-lg p-4 border'>
                      <p className='text-sm text-gray-700 whitespace-pre-wrap leading-relaxed'>
                        {ticket.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* TICKET INFORMATION */}
                <div className='space-y-2'>
                  <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                    Ticket Information
                  </h3>
                  <div className='bg-white border rounded-lg divide-y'>
                    {/* Title (editable if open) */}
                    {mode === 'edit' && isOpen_status ? (
                      <div className='px-4 py-3'>
                        <div className='flex items-center gap-4'>
                          <label className='text-sm font-medium text-gray-600 min-w-[100px]'>
                            Title:
                          </label>
                          <div className='flex-1'>
                            <Input
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              placeholder='Enter ticket title'
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Section */}
                    <div className='px-4 py-3'>
                      <div className='flex items-center gap-4'>
                        <label className='text-sm font-medium text-gray-600 min-w-[100px]'>
                          Section:
                        </label>
                        <div className='flex-1'>
                          {mode === 'edit' && isOpen_status ? (
                            <Select
                              value={editedSectionId?.toString()}
                              onValueChange={(value) => setEditedSectionId(Number(value))}
                            >
                              <SelectTrigger className='w-full'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {sections.map((section) => (
                                  <SelectItem key={section.id} value={section.id.toString()}>
                                    {section.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className='text-sm text-gray-900'>{ticket.section}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Facility */}
                    <div className='px-4 py-3'>
                      <div className='flex items-center gap-4'>
                        <label className='text-sm font-medium text-gray-600 min-w-[100px]'>
                          Facility:
                        </label>
                        <div className='flex-1'>
                          {mode === 'edit' && isOpen_status ? (
                            <Select
                              value={editedFacilityId?.toString()}
                              onValueChange={(value) => setEditedFacilityId(Number(value))}
                            >
                              <SelectTrigger className='w-full'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {facilities.map((facility) => (
                                  <SelectItem key={facility.id} value={facility.id.toString()}>
                                    {facility.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className='text-sm text-gray-900'>{ticket.facility}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Assigned To - Read only */}
                    <div className='px-4 py-3'>
                      <div className='flex items-center gap-4'>
                        <label className='text-sm font-medium text-gray-600 min-w-[100px]'>
                          Assigned to:
                        </label>
                        <div className='flex-1'>
                          <span className='text-sm text-gray-900'>
                            {ticket.assigned_to_name
                              ? ticket.assigned_to_name
                              : (ticket.assigned_to 
                                ? `${ticket.assigned_to.first_name} ${ticket.assigned_to.last_name}` 
                                : 'Not assigned yet')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Raised By - Read only */}
                    <div className='px-4 py-3'>
                      <div className='flex items-center gap-4'>
                        <label className='text-sm font-medium text-gray-600 min-w-[100px]'>
                          Raised by:
                        </label>
                        <div className='flex-1'>
                          <span className='text-sm text-gray-900'>
                            {isTicketOwner ? 'You' : raisedByName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* View-only or not ticket owner message */}
                {!isClosed && (viewOnly || !isTicketOwner) && (
                  <div className='space-y-4'>
                    <div className='bg-gray-50 border border-gray-200 rounded-lg px-4 py-3'>
                      <p className='text-sm text-gray-600'>
                        {viewOnly 
                          ? 'You are viewing this ticket in read-only mode.'
                          : 'Only the ticket creator can edit or cancel this ticket.'
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* ACTIONS SECTION */}
                {!isClosed && !viewOnly && isTicketOwner && (
                  <div className='space-y-4'>
                    <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                      Actions
                    </h3>

                    {/* Open status - Edit and Cancel buttons */}
                    {isOpen_status && (
                      <div className='space-y-3'>
                        {mode === 'view' ? (
                          <>
                            <Button
                              onClick={() => {
                                setMode('edit');
                                // Reset to current values when entering edit mode
                                setEditedTitle(ticket.title);
                                setEditedDescription(ticket.description);
                                setEditedSectionId(ticket.section_id || null);
                                setEditedFacilityId(ticket.facility_id || null);
                              }}
                              className='w-full bg-blue-600 hover:bg-blue-700'
                            >
                              Edit Ticket
                            </Button>
                            <Button
                              onClick={handleCancelTicket}
                              disabled={isUpdating}
                              variant='outline'
                              className='w-full border-red-300 text-red-700 hover:bg-red-50'
                            >
                              {isUpdating ? 'Cancelling...' : 'Cancel Ticket'}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={handleSaveChanges}
                              disabled={isUpdating}
                              className='w-full bg-blue-600 hover:bg-blue-700'
                            >
                              {isUpdating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                              Save Changes
                            </Button>
                            <Button
                              onClick={() => {
                                setMode('view');
                                // Reset to actual ticket values when canceling
                                setEditedTitle(ticket.title);
                                setEditedDescription(ticket.description);
                                setEditedSectionId(ticket.section_id || null);
                                setEditedFacilityId(ticket.facility_id || null);
                              }}
                              variant='ghost'
                              className='w-full'
                            >
                              Cancel Edit
                            </Button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Assigned/In Progress/Pending - No actions, only view */}
                    {(ticket.status === 'assigned' || ticket.status === 'in_progress' || ticket.status === 'pending') && (
                      <div className='bg-blue-50 border border-blue-200 rounded-lg px-4 py-3'>
                        <p className='text-sm text-blue-800'>
                          Your ticket is being processed. You can add comments below to provide additional information.
                        </p>
                      </div>
                    )}

                    {/* Resolved - Rating section (only show if no feedback has been submitted) */}
                    {isResolved && !ticket.feedback && (
                      <div className='bg-white border rounded-lg p-4 space-y-4'>
                        <div>
                          <h4 className='text-sm font-semibold text-gray-900 mb-3'>Rate Service</h4>
                          <div className='space-y-2'>
                            <div className='flex items-center gap-4'>
                              <label className='text-sm font-medium text-gray-700 min-w-[100px]'>
                                Rating:
                              </label>
                              <div className='flex items-center gap-2'>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type='button'
                                    onClick={() => setRating(star)}
                                    className='focus:outline-none transition-colors hover:scale-110'
                                  >
                                    <Star
                                      className={`h-8 w-8 ${
                                        star <= rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300 hover:text-gray-400'
                                      }`}
                                    />
                                  </button>
                                ))}
                                {rating > 0 && (
                                  <span className='ml-2 text-sm font-medium text-gray-700'>
                                    {rating} / 5
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className='flex items-start gap-4'>
                            <label className='text-sm font-medium text-gray-700 min-w-[100px] pt-2'>
                              Comment:
                            </label>
                            <div className='flex-1'>
                              <Textarea
                                value={ratingComment}
                                onChange={(e) => setRatingComment(e.target.value)}
                                placeholder='Share your experience with the service (optional)...'
                                rows={4}
                                className='w-full'
                              />
                            </div>
                          </div>
                        </div>

                        <div className='flex gap-3 pt-2'>
                          <Button
                            onClick={handleSubmitRating}
                            disabled={isSubmittingRating || rating === 0}
                            className='flex-1 bg-green-600 hover:bg-green-700'
                          >
                            {isSubmittingRating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                            Submit Rating
                          </Button>
                          <Button
                            onClick={handleConfirmClosure}
                            disabled={isUpdating}
                            variant='outline'
                            className='flex-1'
                          >
                            {isUpdating ? 'Closing...' : 'Confirm Closure'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Resolved - Feedback already submitted (show brief confirmation only) */}
                    {isResolved && ticket.feedback && (
                      <div className='bg-green-50 border border-green-200 rounded-lg px-4 py-3'>
                        <p className='text-sm font-medium text-green-900'>
                          ✓ Thank you for your feedback! Your rating has been submitted.
                        </p>
                        <Button
                          onClick={handleConfirmClosure}
                          disabled={isUpdating}
                          variant='outline'
                          className='w-full mt-3'
                        >
                          {isUpdating ? 'Closing...' : 'Confirm Closure'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* COMMENTS SECTION */}
                <div className='pt-4 border-t'>
                  <TicketComments ticket={ticket} />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
