// RatingModal — user rates a resolved ticket and chooses to close or reopen.
// Wraps the shared RatingWidget component.
// On 'close': submits feedback then closes the ticket.
// On 'reopen': reopens the ticket without submitting feedback.
// Both actions call onSuccess with the updated ticket.

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RatingWidget } from '@/components/shared/ticket/RatingWidget';
import { addFeedback, closeTicket, updateTicket } from '@/lib/api/tickets';
import { useTicketInvalidate } from '@/hooks/tickets/useTicketDetail';
import type { Ticket } from '@/types';
import type { RatingSubmitPayload } from '@/components/shared/ticket/RatingWidget';

interface RatingModalProps {
  ticket: Ticket;
  open: boolean;
  onClose: () => void;
  onSuccess: (updated: Ticket) => void;
}

export function RatingModal({ ticket, open, onClose, onSuccess }: RatingModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const invalidate = useTicketInvalidate();

  async function handleSubmit({ rating, comment, action }: RatingSubmitPayload) {
    setSubmitting(true);
    try {
      if (action === 'close') {
        await addFeedback(ticket.id, rating, comment);
        const updated = await closeTicket(ticket.id);
        toast.success('Feedback submitted. Ticket closed.');
        invalidate(ticket.id);
        onSuccess(updated);
      } else {
        // Reopen — no feedback needed
        const updated = await updateTicket(ticket.id, { status: 'open' });
        toast.info('Ticket reopened.');
        invalidate(ticket.id);
        onSuccess(updated);
      }
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Rate resolution</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <RatingWidget onSubmit={handleSubmit} submitting={submitting} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
