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
import { Calendar, User, Loader2, Star } from 'lucide-react';
import type { Ticket } from '@/types';
import { formatDate } from '@/utils/date';
import { getStatusBadgeVariant } from '@/components/Common/DataTable/utils/TicketDetailsUtils';
import { TicketComments } from '@/components/Common/DataTable/sidebar/TicketComments';
import ticketsService from '@/api/services/ticketsService';
import useUserData from '@/hooks/users/useUserData';
import { useUsers } from '@/hooks/users';

export interface UserTicketDetailsSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
  currentUser?: string;
  onUpdate?: (updatedTicket: Ticket) => Promise<void>;
  viewOnly?: boolean;
}

export function UserTicketDetailsSidebar({
  isOpen,
  onOpenChange,
  ticket,
  onUpdate,
  viewOnly = false,
}: UserTicketDetailsSidebarProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [rating, setRating] = useState(ticket.feedback?.rating || 0);
  const [ratingComment, setRatingComment] = useState(ticket.feedback?.comment || '');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const { userData } = useUserData();
  const isTicketOwner = userData?.username === ticket.raised_by;

  const { users } = useUsers({ page_size: 100 });
  const raisedByUser = users.find(u => u.username === ticket.raised_by);
  const raisedByName = raisedByUser
    ? [raisedByUser.first_name, raisedByUser.last_name].filter(Boolean).join(' ') || raisedByUser.username
    : ticket.raised_by;

  const isClosed = ticket.status === 'closed';
  const isResolved = ticket.status === 'resolved';

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirmClosure = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to close this ticket? This will mark it as completed.'
    );
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      await onUpdate?.({ ...ticket, status: 'closed' });
      toast.success('Ticket closed successfully');
    } catch {
      toast.error('Failed to close ticket');
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
      toast.success('Rating submitted — thank you!');
      onOpenChange(false);
    } catch {
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
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
          <div className='flex items-center gap-3'>
            <SheetTitle className='text-base font-bold text-gray-900'>
              {ticket.ticket_no}
            </SheetTitle>
            <Badge variant='outline' className={getStatusBadgeVariant(ticket.status)}>
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
            </Badge>
          </div>

          <h2 className='text-lg font-semibold text-gray-900 leading-tight'>
            {ticket.title}
          </h2>

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

          <SheetDescription className='sr-only'>
            Ticket details for {ticket.ticket_no} - {ticket.title}
          </SheetDescription>
        </SheetHeader>

        {/* CONTENT */}
        <ScrollArea className='flex-1'>
          <div className='px-6 py-4'>
            {isUpdating ? (
              <div className='space-y-4'>
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-32 w-full' />
                <Skeleton className='h-24 w-full' />
              </div>
            ) : (
              <div className='space-y-6'>
                {/* DESCRIPTION */}
                <div className='space-y-2'>
                  <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                    Description
                  </h3>
                  <div className='bg-gray-50 rounded-lg p-4 border'>
                    <p className='text-sm text-gray-700 whitespace-pre-wrap leading-relaxed'>
                      {ticket.description}
                    </p>
                  </div>
                </div>

                {/* TICKET INFORMATION */}
                <div className='space-y-2'>
                  <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                    Ticket Information
                  </h3>
                  <div className='bg-white border rounded-lg divide-y'>
                    <div className='px-4 py-3 flex items-center gap-4'>
                      <label className='text-sm font-medium text-gray-600 min-w-[100px]'>Section:</label>
                      <span className='text-sm text-gray-900'>{ticket.section?.name ?? '—'}</span>
                    </div>
                    <div className='px-4 py-3 flex items-center gap-4'>
                      <label className='text-sm font-medium text-gray-600 min-w-[100px]'>Facility:</label>
                      <span className='text-sm text-gray-900'>{ticket.facility?.name ?? '—'}</span>
                    </div>
                    <div className='px-4 py-3 flex items-center gap-4'>
                      <label className='text-sm font-medium text-gray-600 min-w-[100px]'>Assigned to:</label>
                      <span className='text-sm text-gray-900'>
                        {ticket.assigned_to?.name ?? 'Not assigned yet'}
                      </span>
                    </div>
                    <div className='px-4 py-3 flex items-center gap-4'>
                      <label className='text-sm font-medium text-gray-600 min-w-[100px]'>Raised by:</label>
                      <span className='text-sm text-gray-900'>
                        {isTicketOwner ? 'You' : raisedByName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS — My Tickets only, resolved tickets only */}
                {!viewOnly && !isClosed && isResolved && (
                  <div className='space-y-4'>
                    <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                      Actions
                    </h3>

                    <Button
                      onClick={handleConfirmClosure}
                      disabled={isUpdating}
                      className='w-full bg-gray-700 hover:bg-gray-800 text-white'
                    >
                      {isUpdating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                      Confirm &amp; Close
                    </Button>

                    {!ticket.feedback && (
                      <div className='space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4'>
                        <p className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                          Rate this ticket
                        </p>
                        <div className='flex items-center gap-2'>
                          {[1, 2, 3, 4, 5].map(star => (
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
                        <Textarea
                          value={ratingComment}
                          onChange={e => setRatingComment(e.target.value)}
                          placeholder='Share your experience (optional)...'
                          rows={3}
                          className='w-full'
                        />
                        <Button
                          onClick={handleSubmitRating}
                          disabled={isSubmittingRating || rating === 0}
                          className='w-full bg-[#0078d4] hover:bg-[#106ebe]'
                        >
                          {isSubmittingRating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                          Submit Rating
                        </Button>
                      </div>
                    )}

                    {ticket.feedback && (
                      <div className='bg-green-50 border border-green-200 rounded-lg px-4 py-3'>
                        <p className='text-sm font-medium text-green-900'>
                          ✓ Thank you for your feedback! Your rating has been submitted.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* COMMENTS */}
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
