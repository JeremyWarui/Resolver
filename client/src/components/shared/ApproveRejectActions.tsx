import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import ticketsService from '@/api/services/ticketsService';
import type { Ticket } from '@/types';

interface ApproveRejectActionsProps {
  ticket: Ticket;
  onSuccess: (updatedTicket: Ticket) => void;
}

export function ApproveRejectActions({ ticket, onSuccess }: ApproveRejectActionsProps) {
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (ticket.status !== 'pending_approval') return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const updated = await ticketsService.approveTicket(ticket.id, { notes: approveNotes });
      toast.success(`Ticket ${ticket.ticket_no} approved`);
      setShowApproveDialog(false);
      setApproveNotes('');
      onSuccess(updated);
    } catch {
      toast.error('Failed to approve ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await ticketsService.rejectTicket(ticket.id, { reason: rejectReason });
      toast.success(`Ticket ${ticket.ticket_no} rejected`);
      setShowRejectDialog(false);
      setRejectReason('');
      onSuccess(updated);
    } catch {
      toast.error('Failed to reject ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Approval Required
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setShowApproveDialog(true)}
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1 gap-1.5"
            onClick={() => setShowRejectDialog(true)}
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Ticket</DialogTitle>
            <DialogDescription>
              Approve <span className="font-medium">{ticket.ticket_no}</span> — {ticket.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="approve-notes">Notes (optional)</Label>
            <Textarea
              id="approve-notes"
              placeholder="Add any notes for the requester..."
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Confirm Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Ticket</DialogTitle>
            <DialogDescription>
              Reject <span className="font-medium">{ticket.ticket_no}</span> — {ticket.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Explain why this request is being rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="gap-1.5"
              onClick={handleReject}
              disabled={isSubmitting || !rejectReason.trim()}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
