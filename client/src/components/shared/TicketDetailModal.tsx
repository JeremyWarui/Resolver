import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { AlertCircle, Star, ArrowUpCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TicketComments } from '@/components/Common/DataTable/sidebar/TicketComments';
import { ApproveRejectActions } from './ApproveRejectActions';
import { useCurrentUser } from '@/contexts/UserDataContext';
import ticketsService from '@/api/services/ticketsService';
import usersService from '@/api/services/usersService';
import { formatDate } from '@/utils/date';
import { formatSectionDisplay } from '@/utils/formatSection';
import type { Ticket, User } from '@/types';

interface TicketDetailModalProps {
  ticketId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketUpdate?: (ticket: Ticket) => void;
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  pending: 'Pending',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  resolved: 'Resolved',
  closed: 'Closed',
};

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  assigned: 'bg-purple-100 text-purple-800 border-purple-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pending: 'bg-orange-100 text-orange-800 border-orange-200',
  pending_approval: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
};

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

// Valid next statuses per role — intersection of valid_transitions × role_permissions from backend validators.py
// "escalated" target is omitted here; it has its own dedicated Escalate button below.
const NEXT_STATUSES: Record<string, Record<string, string[]>> = {
  technician: {
    open: ['assigned', 'pending'],
    assigned: ['in_progress', 'pending'],
    in_progress: ['pending', 'resolved'],
    pending: ['in_progress', 'resolved'],
    escalated: ['in_progress', 'pending', 'resolved'],
  },
  head_of_section: {
    open: ['pending'],
    assigned: ['in_progress', 'pending'],
    in_progress: ['pending', 'resolved'],
    pending: ['in_progress', 'resolved'],
    escalated: ['in_progress', 'pending', 'resolved'],
  },
  hod: {
    in_progress: ['pending', 'resolved'],
    pending: ['in_progress', 'resolved'],
    escalated: ['in_progress', 'pending', 'resolved'],
  },
  admin: {
    open: ['assigned', 'pending'],
    assigned: ['in_progress', 'pending'],
    in_progress: ['pending', 'resolved'],
    pending: ['in_progress', 'resolved'],
    resolved: ['closed'],
    escalated: ['in_progress', 'pending', 'resolved'],
  },
};

function getNextStatuses(role: string, currentStatus: string): string[] {
  return NEXT_STATUSES[role]?.[currentStatus] ?? [];
}

function ColHeading({ title }: { title: string }) {
  return (
    <div className="px-5 py-3 border-b bg-gray-50/50 flex-shrink-0">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    </div>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide">{label}</p>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right">{children}</span>
    </div>
  );
}

function ActionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      {children}
    </div>
  );
}

export function TicketDetailModal({
  ticketId,
  isOpen,
  onOpenChange,
  onTicketUpdate,
}: TicketDetailModalProps) {
  const { userData } = useCurrentUser();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);

  // Status update
  const [newStatus, setNewStatus] = useState('');
  const [pendingReason, setPendingReason] = useState('');
  const [pendingComment, setPendingComment] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Assign
  const [sectionTechs, setSectionTechs] = useState<User[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [techsError, setTechsError] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Escalate
  const [escalateReason, setEscalateReason] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);

  // Close
  const [closeNotes, setCloseNotes] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // Feedback
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const data = await ticketsService.getTicketById(ticketId);
      setTicket(data);
      setNewStatus('');
      setSelectedTechId('');
    } catch {
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (isOpen && ticketId) fetchTicket();
    if (!isOpen) {
      setTicket(null);
      setNewStatus(''); setSectionTechs([]); setSelectedTechId('');
      setLoadingTechs(false); setTechsError(false);
      setEscalateReason(''); setCloseNotes('');
      setFeedbackRating(0); setFeedbackComment('');
    }
  }, [isOpen, ticketId, fetchTicket]);

  const role = userData?.role ?? 'user';
  const ASSIGN_ROLES = ['admin', 'hod', 'manager', 'head_of_section'];
  const TERMINAL_STATUSES = ['resolved', 'closed', 'rejected', 'pending_approval'];

  useEffect(() => {
    if (!ticket || !ASSIGN_ROLES.includes(role)) return;
    if (TERMINAL_STATUSES.includes(ticket.status)) {
      setSectionTechs([]); setLoadingTechs(false); setTechsError(false);
      return;
    }
    setLoadingTechs(true);
    setTechsError(false);
    usersService.getAssignableUsers({ section_id: ticket.section.id })
      .then(res => {
        setSectionTechs(Array.isArray(res) ? res : (res.results ?? []));
      })
      .catch((err) => {
        console.error('Failed to fetch assignable technicians', err);
        setTechsError(true);
        setSectionTechs([]);
      })
      .finally(() => setLoadingTechs(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket?.id, ticket?.section?.id, role]);

  const handleStatusUpdate = async () => {
    if (!ticket || !newStatus) return;
    if (newStatus === 'pending' && (!pendingReason || !pendingComment)) {
      toast.error('Pending reason and comment are required');
      return;
    }
    setIsUpdatingStatus(true);
    try {
      const updated = await ticketsService.updateTicket(ticket.id, {
        status: newStatus as Ticket['status'],
        pending_reason: newStatus === 'pending' ? pendingReason : null,
        pending_comment: newStatus === 'pending' ? pendingComment : null,
      });
      setTicket(updated);
      setNewStatus(''); setPendingReason(''); setPendingComment('');
      onTicketUpdate?.(updated);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssign = async () => {
    if (!ticket || !selectedTechId) return;
    setIsAssigning(true);
    try {
      const updated = await ticketsService.updateTicket(ticket.id, {
        assigned_to_id: Number(selectedTechId),
      });
      setTicket(updated);
      setSelectedTechId('');
      onTicketUpdate?.(updated);
      toast.success('Ticket assigned');
    } catch {
      toast.error('Failed to assign ticket');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleEscalate = async () => {
    if (!ticket) return;
    setIsEscalating(true);
    try {
      const updated = await ticketsService.escalateTicket(ticket.id, escalateReason || undefined);
      setTicket(updated);
      setEscalateReason('');
      onTicketUpdate?.(updated);
      toast.success(`Ticket escalated to ${escalateTargetLabel}`);
    } catch {
      toast.error('Failed to escalate ticket');
    } finally {
      setIsEscalating(false);
    }
  };

  const handleClose = async () => {
    if (!ticket) return;
    setIsClosing(true);
    try {
      const updated = await ticketsService.closeTicket(ticket.id, closeNotes || undefined);
      setTicket(updated);
      setCloseNotes('');
      onTicketUpdate?.(updated);
      toast.success('Ticket closed');
    } catch {
      toast.error('Failed to close ticket');
    } finally {
      setIsClosing(false);
    }
  };

  const handleFeedback = async () => {
    if (!ticket || feedbackRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      await ticketsService.addTicketFeedback(ticket.id, feedbackRating, feedbackComment || undefined);
      // Refetch to get updated feedback on the ticket
      const updated = await ticketsService.getTicketById(ticket.id);
      setTicket(updated);
      setFeedbackRating(0); setFeedbackComment('');
      onTicketUpdate?.(updated);
      toast.success('Feedback submitted');
    } catch {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleApprovalSuccess = (updated: Ticket) => {
    setTicket(updated);
    onTicketUpdate?.(updated);
  };

  const nextStatuses = ticket ? getNextStatuses(role, ticket.status) : [];
  const isRaiser = ticket?.raised_by_id === userData?.id;

  const canApproveReject =
    ticket?.status === 'pending_approval' &&
    ['hod', 'manager', 'admin'].includes(role);

  const canAssign =
    ticket != null &&
    ASSIGN_ROLES.includes(role) &&
    !TERMINAL_STATUSES.includes(ticket.status);

  const canEscalate =
    ticket != null &&
    role !== 'manager' && // Managers cannot escalate (backend CanEscalateTickets excludes them)
    ['technician', 'head_of_section', 'hod', 'admin'].includes(role) &&
    !['resolved', 'closed', 'rejected'].includes(ticket.status) &&
    (ticket.escalation_level ?? 0) < 2;

  // admin already has resolved→closed in their status dropdown; user + manager use the dedicated endpoint
  const canClose =
    ticket?.status === 'resolved' &&
    ((role === 'user' && isRaiser) || role === 'manager');

  const canGiveFeedback =
    ticket?.status === 'resolved' &&
    role === 'user' &&
    isRaiser &&
    !ticket.feedback;

  const escalateTargetLabel = (ticket?.escalation_level ?? 0) === 0 ? 'Section Head' : 'Head of Department';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/*
        Override shadcn's hardcoded sm:max-w-lg with our responsive width.
        tailwind-merge resolves the max-w conflict; our classes win as they
        appear later in the cn() call inside DialogContent.
        No fixed height — the modal auto-sizes to whichever column is tallest,
        capped by max-h on each column.
      */}
      <DialogContent
        className="w-[80vw] max-w-[80vw] sm:max-w-[80vw] min-w-160 flex flex-col p-0 gap-0"
        aria-describedby={undefined}
      >
        {/* Header — shadcn renders its own close button (absolute top-4 right-4) */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-8">
            {loading || !ticket ? (
              <>
                <DialogTitle className="sr-only">Loading ticket</DialogTitle>
                <Skeleton className="h-5 w-48" />
              </>
            ) : (
              <>
                <DialogTitle className="text-base font-semibold shrink-0">
                  {ticket.ticket_no}
                </DialogTitle>
                <span className="text-muted-foreground shrink-0">·</span>
                <span className="text-sm text-muted-foreground truncate">{ticket.title}</span>
                <Badge className={`text-xs border shrink-0 ${STATUS_BADGE[ticket.status] ?? STATUS_BADGE.open}`}>
                  {STATUS_LABELS[ticket.status] ?? ticket.status}
                </Badge>
              </>
            )}
          </div>
        </DialogHeader>

        {/* Three equal columns — sticky headings, independently scrollable bodies */}
        <div className="flex divide-x">

          {/* ── Column 1: Ticket Details ── */}
          <div className="flex-1 flex flex-col min-h-[68vh] max-h-[72vh]">
            <ColHeading title="Ticket Details" />
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-5">
                {loading || !ticket ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : (
                  <>
                    {/* Description */}
                    <div className="space-y-2">
                      <SectionHeading label="Description" />
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {ticket.description || <span className="italic text-gray-400">No description provided.</span>}
                        </p>
                      </div>
                    </div>

                    {/* Service Request Section */}
                    {ticket.service_item && (
                      <div className="space-y-2">
                        <SectionHeading label="Service Request" />
                        <div className="bg-white border rounded-lg divide-y">
                          <DetailRow label="Category">{ticket.service_item.category_name}</DetailRow>
                          <DetailRow label="Service">
                            <div className="flex items-center gap-2">
                              <span>{ticket.service_item.name}</span>
                              {ticket.service_item.requires_approval && (
                                <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                  Requires Approval
                                </Badge>
                              )}
                            </div>
                          </DetailRow>
                        </div>
                      </div>
                    )}

                    {/* Request Details Section */}
                    {ticket.form_data && Object.keys(ticket.form_data).length > 0 && (
                      <div className="space-y-2">
                        <SectionHeading label="Request Details" />
                        <div className="bg-white border rounded-lg divide-y">
                          {Object.entries(ticket.form_data).map(([key, value]) => (
                            <DetailRow key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}>
                              {Array.isArray(value) ? (
                                value.join(', ')
                              ) : value === null || value === undefined ? (
                                <span className="text-gray-400 italic">—</span>
                              ) : (
                                String(value)
                              )}
                            </DetailRow>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Info table */}
                    <div className="space-y-2">
                      <SectionHeading label="Ticket Information" />
                      <div className="bg-white border rounded-lg divide-y">
                        <DetailRow label="Raised by">{ticket.raised_by}</DetailRow>
                        <DetailRow label="Section">{formatSectionDisplay(ticket.section)}</DetailRow>
                        {ticket.facility && (
                          <DetailRow label="Facility">{ticket.facility.name}</DetailRow>
                        )}
                        <DetailRow label="Assigned to">
                          {ticket.assigned_to
                            ? (ticket.assigned_to.name || ticket.assigned_to.username)
                            : <span className="text-gray-400 italic">Unassigned</span>}
                        </DetailRow>
                        {ticket.priority && (
                          <DetailRow label="Priority">
                            <Badge className={`text-xs capitalize ${PRIORITY_BADGE[ticket.priority] ?? ''}`}>
                              {ticket.priority}
                            </Badge>
                          </DetailRow>
                        )}
                        <DetailRow label="Created">{formatDate(ticket.created_at)}</DetailRow>
                        {ticket.due_date && (
                          <DetailRow label="Due">{formatDate(ticket.due_date)}</DetailRow>
                        )}
                        {ticket.resolved_at && (
                          <DetailRow label="Resolved">{formatDate(ticket.resolved_at)}</DetailRow>
                        )}
                        {ticket.escalation_level !== undefined && ticket.escalation_level > 0 && (
                          <DetailRow label="Escalation">
                            <span className="text-orange-600 font-medium">
                              Level {ticket.escalation_level}
                              {ticket.escalated_to && ` → ${ticket.escalated_to.name || ticket.escalated_to.username}`}
                            </span>
                          </DetailRow>
                        )}
                      </div>
                    </div>

                    {/* Pending info */}
                    {ticket.pending_reason && (
                      <div className="rounded-lg border-l-4 border-orange-400 bg-orange-50 px-4 py-3 space-y-1">
                        <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Pending Reason</p>
                        <p className="text-sm text-gray-700 capitalize">{ticket.pending_reason.replace(/_/g, ' ')}</p>
                        {ticket.pending_comment && (
                          <p className="text-sm text-gray-700 mt-1">{ticket.pending_comment}</p>
                        )}
                      </div>
                    )}

                    {/* Feedback (read-only) */}
                    {ticket.feedback && (
                      <div className="space-y-2">
                        <SectionHeading label="User Feedback" />
                        <div className="bg-white border rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star
                                key={n}
                                className={`h-5 w-5 ${n <= ticket.feedback!.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-2">by {ticket.feedback.rated_by}</span>
                          </div>
                          {ticket.feedback.comment && (
                            <p className="text-sm text-gray-700 leading-relaxed">{ticket.feedback.comment}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Column 2: Actions ── */}
          <div className="flex-1 flex flex-col min-h-[68vh] max-h-[72vh]">
            <ColHeading title="Actions" />
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-4">
                {loading || !ticket ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
                  </div>
                ) : (
                  <>
                    {/* ── Update Status ── */}
                    {nextStatuses.length > 0 && (
                      <ActionCard>
                        <SectionHeading label="Update Status" />
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select new status" />
                          </SelectTrigger>
                          <SelectContent>
                            {nextStatuses.map(s => (
                              <SelectItem key={s} value={s}>{STATUS_LABELS[s] ?? s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {newStatus === 'pending' && (
                          <div className="space-y-2 pt-1">
                            <Select value={pendingReason} onValueChange={setPendingReason}>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Pending reason *" />
                              </SelectTrigger>
                              <SelectContent>
                                {['material_shortage', 'awaiting_procurement', 'awaiting_approval', 'vendor_dependency', 'access_issue', 'other'].map(r => (
                                  <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Textarea
                              placeholder="Comment (required) *"
                              value={pendingComment}
                              onChange={e => setPendingComment(e.target.value)}
                              rows={3}
                              className="text-sm"
                            />
                          </div>
                        )}
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={handleStatusUpdate}
                          disabled={!newStatus || isUpdatingStatus}
                        >
                          {isUpdatingStatus ? 'Updating…' : 'Update Status'}
                        </Button>
                      </ActionCard>
                    )}

                    {/* ── Assign To ── */}
                    {canAssign && (
                      <ActionCard>
                        <SectionHeading label={
                          ticket.status === 'open' && !ticket.assigned_to
                            ? 'Assign Technician'
                            : ticket.assigned_to
                              ? 'Reassign Technician'
                              : 'Technician/Officer'
                        } />
                        {ticket.assigned_to && (
                          <p className="text-xs text-gray-500">
                            Currently assigned: <span className="font-medium text-gray-800">{ticket.assigned_to.name || ticket.assigned_to.username}</span>
                          </p>
                        )}
                        {ticket.status === 'open' && !ticket.assigned_to && (
                          <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                            Assigning a technician will also move the status to <span className="font-medium">Assigned</span>.
                          </p>
                        )}
                        {loadingTechs ? (
                          <div className="space-y-2">
                            <Skeleton className="h-9 w-full rounded-md" />
                            <Skeleton className="h-8 w-full rounded-md" />
                          </div>
                        ) : techsError ? (
                          <p className="text-xs text-red-500 italic">Failed to load technicians. Check console for details.</p>
                        ) : sectionTechs.length === 0 ? (
                          !ticket.assigned_to && (
                            <p className="text-xs text-gray-400 italic">No technicians assigned to this section.</p>
                          )
                        ) : (
                          <>
                            <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder={ticket.assigned_to ? 'Select a different technician' : 'Select technician'} />
                              </SelectTrigger>
                              <SelectContent>
                                {sectionTechs.map(t => (
                                  <SelectItem key={t.id} value={String(t.id)}>
                                    <div className="flex flex-col py-0.5">
                                      <span>{t.first_name && t.last_name ? `${t.first_name} ${t.last_name}` : t.username}</span>
                                      {(t.first_name || t.last_name) && (
                                        <span className="text-xs text-gray-400">@{t.username}</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={handleAssign}
                              disabled={!selectedTechId || isAssigning}
                            >
                              {isAssigning
                                ? 'Assigning…'
                                : ticket.status === 'open' && !ticket.assigned_to
                                  ? 'Assign Ticket'
                                  : 'Reassign'}
                            </Button>
                          </>
                        )}
                      </ActionCard>
                    )}

                    {/* ── Approve / Reject ── */}
                    {canApproveReject && (
                      <ActionCard>
                        <ApproveRejectActions ticket={ticket} onSuccess={handleApprovalSuccess} />
                      </ActionCard>
                    )}

                    {/* ── Escalate ── */}
                    {canEscalate && (
                      <ActionCard>
                        <div className="flex items-center gap-1.5">
                          <ArrowUpCircle className="h-4 w-4 text-orange-500" />
                          <SectionHeading label="Escalate Ticket" />
                        </div>
                        <p className="text-xs text-gray-500">
                          Escalate to{' '}
                          <span className="font-medium text-gray-700">{escalateTargetLabel}</span>
                          {(ticket.escalation_level ?? 0) > 0 && (
                            <span className="ml-1 text-orange-600">(level {ticket.escalation_level} → {ticket.escalation_level! + 1})</span>
                          )}
                        </p>
                        <Textarea
                          placeholder="Reason for escalation (optional)"
                          value={escalateReason}
                          onChange={e => setEscalateReason(e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                          onClick={handleEscalate}
                          disabled={isEscalating}
                        >
                          <ArrowUpCircle className="h-3.5 w-3.5 mr-1.5" />
                          {isEscalating ? 'Escalating…' : `Escalate to ${escalateTargetLabel}`}
                        </Button>
                      </ActionCard>
                    )}

                    {/* ── Close Ticket ── */}
                    {canClose && (
                      <ActionCard>
                        <div className="flex items-center gap-1.5">
                          <XCircle className="h-4 w-4 text-gray-500" />
                          <SectionHeading label="Close Ticket" />
                        </div>
                        <p className="text-xs text-gray-500">Mark this resolved ticket as closed.</p>
                        <Textarea
                          placeholder="Closure notes (optional)"
                          value={closeNotes}
                          onChange={e => setCloseNotes(e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={handleClose}
                          disabled={isClosing}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />
                          {isClosing ? 'Closing…' : 'Close Ticket'}
                        </Button>
                      </ActionCard>
                    )}

                    {/* ── Rate Resolution ── */}
                    {canGiveFeedback && (
                      <ActionCard>
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <SectionHeading label="Rate Resolution" />
                        </div>
                        <p className="text-xs text-gray-500">How satisfied are you with how this was resolved?</p>
                        <div className="flex gap-1 pt-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} type="button" onClick={() => setFeedbackRating(n)} className="focus:outline-none">
                              <Star className={`h-7 w-7 transition-colors ${n <= feedbackRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          placeholder="Additional comments (optional)"
                          value={feedbackComment}
                          onChange={e => setFeedbackComment(e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={handleFeedback}
                          disabled={feedbackRating === 0 || isSubmittingFeedback}
                        >
                          {isSubmittingFeedback ? 'Submitting…' : 'Submit Feedback'}
                        </Button>
                      </ActionCard>
                    )}

                    {/* ── No actions ── */}
                    {nextStatuses.length === 0 && !canApproveReject && !canAssign &&
                     !canEscalate && !canClose && !canGiveFeedback && (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-2">
                        <AlertCircle className="h-8 w-8 opacity-30" />
                        <p className="text-sm italic">No actions available for this ticket.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Column 3: Comments ── */}
          <div className="flex-1 flex flex-col min-h-[68vh] max-h-[72vh]">
            <ColHeading title="Comments" />
            <div className="flex-1 overflow-y-auto">
              <div className="p-5">
                {loading || !ticket ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                  </div>
                ) : (
                  <TicketComments ticket={ticket} />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
