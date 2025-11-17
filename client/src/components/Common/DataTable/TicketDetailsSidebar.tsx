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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, User, Loader2 } from 'lucide-react';
import type { Ticket } from '@/types';
import { formatDate } from '@/utils/date';
import { getStatusBadgeVariant } from './utils/TicketDetailsUtils';
import { TicketComments } from './sidebar/TicketComments';
import { TechnicianSelect } from '@/components/Common/TechnicianSelect';

export interface TicketDetailsSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket;
  technicians?: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
  }[];
  currentUser?: string;
  role?: 'admin' | 'user' | 'technician';
  onUpdate?: (updatedTicket: Ticket) => Promise<void>;
}

export function TicketDetailsSidebar({
  isOpen,
  onOpenChange,
  ticket,
  technicians = [],
  role = 'user',
  onUpdate,
}: TicketDetailsSidebarProps) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Pending reason state for technicians
  const [showPendingForm, setShowPendingForm] = useState(false);
  const [pendingReason, setPendingReason] = useState('');
  
  // Edit form state - sync with current ticket values
  const [editedStatus, setEditedStatus] = useState(ticket.status);
  const [editedAssignedToId, setEditedAssignedToId] = useState<number | null>(
    ticket.assigned_to?.id || null
  );

  const isClosed = ticket.status === 'closed';

  // Get dynamic button text and style based on ticket status
  const getAdminActionButton = () => {
    switch (ticket.status) {
      case 'open':
        return {
          text: 'Assign Ticket',
          description: 'Assign this ticket to a technician'
        };
      case 'assigned':
      case 'in_progress':
      case 'pending':
        return {
          text: 'Update Ticket',
          description: 'Update ticket status'
        };
      case 'resolved':
        return {
          text: 'Close Ticket',
          description: 'Review and close this ticket'
        };
      default:
        return {
          text: 'Edit Ticket',
          description: 'Edit ticket details'
        };
    }
  };

  const handleClose = () => {
    setMode('view');
    onOpenChange(false);
    // Reset form state to actual ticket values
    setEditedStatus(ticket.status);
    setEditedAssignedToId(ticket.assigned_to?.id || null);
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      const updatedTicket: Ticket = {
        ...ticket,
        status: editedStatus,
        assigned_to_id: editedAssignedToId,
      };
      
      await onUpdate?.(updatedTicket);
      
      toast.success('Ticket updated successfully', {
        description: `${ticket.ticket_no} has been updated`,
      });
      setMode('view');
      // Sync state with saved values
      setEditedStatus(editedStatus);
      setEditedAssignedToId(editedAssignedToId);
    } catch (error) {
      toast.error('Failed to update ticket', {
        description: 'Please try again or contact support',
      });
      console.error('Update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Get available status transitions for admin based on current ticket status
  const getAvailableStatusOptions = (): Ticket['status'][] => {
    switch (ticket.status) {
      case 'open':
        return ['open', 'in_progress', 'pending', 'closed'];
      case 'assigned':
        return ['assigned', 'in_progress'];
      case 'in_progress':
        return ['in_progress', 'resolved', 'pending'];
      case 'resolved':
        return ['resolved', 'closed', 'open'];
      case 'pending':
        return ['pending', 'in_progress'];
      case 'closed':
        return ['closed'];
      default:
        return ['open', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'];
    }
  };

  // Determine if we should show "Assigned to" field based on status
  const shouldShowAssignedToField = () => {
    return ticket.status === 'open' || ticket.status === 'pending';
  };

  // Technician quick actions
  const handleTechnicianAction = async (newStatus: Ticket['status'], reason?: string) => {
    setIsUpdating(true);
    try {
      const updatedTicket: Ticket = {
        ...ticket,
        status: newStatus,
        // Include pending_reason when marking as pending
        ...(newStatus === 'pending' && reason ? { pending_reason: reason } : {}),
      };
      
      await onUpdate?.(updatedTicket);
      
      // Friendly messages for technician actions
      if (newStatus === 'in_progress' && ticket.status === 'assigned') {
        toast.success(`Started work on #${ticket.ticket_no}`, {
          description: "Good luck with this ticket!",
        });
      } else if (newStatus === 'in_progress' && ticket.status === 'pending') {
        toast.success(`Resumed work on #${ticket.ticket_no}`, {
          description: "Let's finish this!",
        });
      } else if (newStatus === 'pending') {
        toast.info(`Ticket #${ticket.ticket_no} marked as pending`, {
          description: reason || "Waiting for parts or assistance",
        });
      } else if (newStatus === 'resolved') {
        toast.success(`✅ Great job! Ticket #${ticket.ticket_no} is complete`, {
          description: "Work marked as finished",
        });
      }
      
      setMode('view');
      setShowPendingForm(false);
      setPendingReason('');
    } catch (error) {
      toast.error('Failed to update ticket status');
      console.error('Status update error:', error);
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
              <span>Raised by: {ticket.raised_by}</span>
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
                {/* DESCRIPTION SECTION - Always read-only */}
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
                    {/* Section */}
                    <div className='px-4 py-3 flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Section</span>
                      <span className='text-sm text-gray-900'>{ticket.section}</span>
                    </div>
                    
                    {/* Facility */}
                    <div className='px-4 py-3 flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Facility</span>
                      <span className='text-sm text-gray-900'>{ticket.facility}</span>
                    </div>
                    
                    {/* Raised By */}
                    <div className='px-4 py-3 flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Raised by</span>
                      <span className='text-sm text-gray-900'>{ticket.raised_by}</span>
                    </div>
                    
                    {/* Date Created */}
                    <div className='px-4 py-3 flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Date created</span>
                      <span className='text-sm text-gray-900'>{formatDate(ticket.created_at)}</span>
                    </div>
                    
                    {/* Updated At */}
                    {ticket.updated_at && (
                      <div className='px-4 py-3 flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-600'>Updated At</span>
                        <span className='text-sm text-gray-900'>{formatDate(ticket.updated_at)}</span>
                      </div>
                    )}
                    
                    {/* Status */}
                    <div className='px-4 py-3 flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-600'>Status</span>
                      <Badge
                        variant='outline'
                        className={getStatusBadgeVariant(ticket.status)}
                      >
                        {ticket.status.charAt(0).toUpperCase() +
                          ticket.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Pending Reason - Show only when status is pending and reason exists */}
                    {ticket.status === 'pending' && ticket.pending_reason && (
                      <div className='px-4 py-3 border-l-4 border-orange-500 bg-orange-50'>
                        <span className='text-sm font-medium text-orange-700 block mb-1'>
                          Pending Reason
                        </span>
                        <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                          {ticket.pending_reason}
                        </p>
                      </div>
                    )}

                    {/* Assigned To (for admin and technician) */}
                    {(role === 'admin' || role === 'technician') && (
                      <div className='px-4 py-3 flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-600'>Assigned to</span>
                        <span className='text-sm text-gray-900'>
                          {ticket.assigned_to 
                            ? `${ticket.assigned_to.first_name} ${ticket.assigned_to.last_name}` 
                            : 'Unassigned'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIONS SECTION - Only visible if not closed and in edit mode */}
                {!isClosed && mode === 'edit' && role === 'admin' && (
                  <div className='space-y-4'>
                    <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                      Actions
                    </h3>
                    
                    <div className='bg-white border rounded-lg divide-y'>
                      {/* Assign To - Only show for open and pending tickets */}
                      {shouldShowAssignedToField() && (
                        <div className='px-4 py-3'>
                          <div className='flex items-center gap-4'>
                            <label className='text-sm font-medium text-gray-700 min-w-[120px]'>
                              Assigned to:
                            </label>
                            <div className='flex-1'>
                              <TechnicianSelect
                                value={editedAssignedToId}
                                onValueChange={setEditedAssignedToId}
                                technicians={technicians}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Update Status - Always show with conditional options */}
                      <div className='px-4 py-3'>
                        <div className='flex items-center gap-4'>
                          <label className='text-sm font-medium text-gray-700 min-w-[120px]'>
                            Update status:
                          </label>
                          <div className='flex-1'>
                            <Select
                              value={editedStatus}
                              onValueChange={(value) => setEditedStatus(value as Ticket['status'])}
                            >
                              <SelectTrigger className='w-full'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableStatusOptions().map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save Changes Button */}
                    <Button
                      onClick={handleSaveChanges}
                      disabled={isUpdating}
                      className='w-full bg-blue-600 hover:bg-blue-700'
                    >
                      {isUpdating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                      Save Changes
                    </Button>
                  </div>
                )}

                {/* TECHNICIAN ACTIONS - Workflow buttons */}
                {role === 'technician' && !isClosed && mode === 'view' && (
                  <div className='space-y-4'>
                    <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>
                      Actions
                    </h3>

                    <div className='space-y-3'>
                      {ticket.status === 'assigned' && (
                        <Button
                          onClick={() => handleTechnicianAction('in_progress')}
                          disabled={isUpdating}
                          className='w-full bg-blue-600 hover:bg-blue-700'
                        >
                          {isUpdating ? 'Updating...' : 'Start Work'}
                        </Button>
                      )}

                      {ticket.status === 'in_progress' && (
                        <>
                          {!showPendingForm ? (
                            <div className='grid grid-cols-2 gap-3'>
                              <Button
                                onClick={() => setShowPendingForm(true)}
                                disabled={isUpdating}
                                variant='outline'
                                className='border-orange-300 text-orange-700 hover:bg-orange-50'
                              >
                                Mark Pending
                              </Button>
                              <Button
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    'Are you sure the work is complete?\n\nThis will notify the admin and user that the ticket is resolved.'
                                  );
                                  if (confirmed) {
                                    handleTechnicianAction('resolved');
                                  }
                                }}
                                disabled={isUpdating}
                                className='bg-green-600 hover:bg-green-700'
                              >
                                {isUpdating ? 'Updating...' : 'Confirm Resolved'}
                              </Button>
                            </div>
                          ) : (
                            <div className='space-y-3 bg-orange-50 border border-orange-200 rounded-lg p-4'>
                              <div>
                                <label className='text-sm font-medium text-gray-900 block mb-2'>
                                  Reason for Pending <span className='text-red-500'>*</span>
                                </label>
                                <Textarea
                                  value={pendingReason}
                                  onChange={(e) => setPendingReason(e.target.value)}
                                  placeholder='e.g., Waiting for parts, need approval, requires additional tools...'
                                  rows={3}
                                  className='bg-white'
                                />
                                <p className='text-xs text-gray-600 mt-1'>
                                  This will be saved to the ticket and visible to all users
                                </p>
                              </div>
                              <div className='flex gap-2'>
                                <Button
                                  onClick={() => {
                                    if (!pendingReason.trim()) {
                                      toast.error('Please provide a reason for marking this ticket as pending');
                                      return;
                                    }
                                    handleTechnicianAction('pending', pendingReason);
                                  }}
                                  disabled={isUpdating || !pendingReason.trim()}
                                  className='flex-1 bg-orange-600 hover:bg-orange-700'
                                >
                                  {isUpdating ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Submitting...</> : 'Submit & Mark Pending'}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setShowPendingForm(false);
                                    setPendingReason('');
                                  }}
                                  disabled={isUpdating}
                                  variant='ghost'
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {ticket.status === 'pending' && (
                        <Button
                          onClick={() => handleTechnicianAction('in_progress')}
                          disabled={isUpdating}
                          variant='outline'
                          className='w-full border-purple-300 text-purple-700 hover:bg-purple-50'
                        >
                          {isUpdating ? 'Updating...' : 'Resume Work'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit Button for Admin (when in view mode) */}
                {role === 'admin' && !isClosed && mode === 'view' && (
                  <div className='flex justify-end'>
                    <Button
                      onClick={() => {
                        setMode('edit');
                        // Reset to current ticket values when entering edit mode
                        setEditedStatus(ticket.status);
                        setEditedAssignedToId(ticket.assigned_to?.id || null);
                      }}
                      className='gap-2 bg-blue-600 hover:bg-blue-700 text-white'
                      title={getAdminActionButton().description}
                    >
                      {getAdminActionButton().text}
                    </Button>
                  </div>
                )}

                {/* Cancel Edit Button for Admin (when in edit mode) */}
                {role === 'admin' && mode === 'edit' && (
                  <div className='flex justify-end'>
                    <Button
                      onClick={() => {
                        setMode('view');
                        // Reset to actual ticket values when canceling
                        setEditedStatus(ticket.status);
                        setEditedAssignedToId(ticket.assigned_to?.id || null);
                      }}
                      variant='ghost'
                    >
                      Cancel
                    </Button>
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
