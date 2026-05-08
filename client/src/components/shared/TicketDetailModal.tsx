import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { X, MapPin, Calendar, User as UserIcon, AlertCircle, Clock, Building2 } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { TicketComments } from '@/components/Common/DataTable/sidebar/TicketComments';
import { ApproveRejectActions } from './ApproveRejectActions';
import { useCurrentUser } from '@/contexts/UserDataContext';
import ticketsService from '@/api/services/ticketsService';
import usersService from '@/api/services/usersService';
import { formatDate } from '@/utils/date';
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

// Valid next statuses per role (mirrors backend validators.py)
const NEXT_STATUSES: Record<string, Record<string, string[]>> = {
  technician: {
    open: ['in_progress', 'pending'],
    assigned: ['in_progress', 'pending'],
    in_progress: ['pending', 'resolved'],
    pending: ['in_progress', 'resolved'],
  },
  head_of_section: {
    assigned: ['in_progress', 'pending'],
    in_progress: ['pending', 'resolved'],
    pending: ['in_progress', 'resolved'],
    escalated: ['in_progress', 'pending', 'resolved'],
  },
  hod: {
    in_progress: ['pending', 'resolved'],
    pending: ['in_progress', 'resolved'],
    escalated: ['in_progress', 'resolved'],
  },
  admin: {
    open: ['assigned', 'in_progress', 'pending', 'resolved', 'closed'],
    assigned: ['in_progress', 'pending', 'resolved', 'closed'],
    in_progress: ['pending', 'resolved', 'closed'],
    pending: ['in_progress', 'resolved', 'closed'],
    resolved: ['closed'],
    escalated: ['in_progress', 'pending', 'resolved', 'closed'],
  },
};

function getNextStatuses(role: string, currentStatus: string): string[] {
  return NEXT_STATUSES[role]?.[currentStatus] ?? [];
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground flex-shrink-0 mt-0.5">{icon}</span>
      <span className="text-muted-foreground w-20 flex-shrink-0">{label}</span>
      <span className="text-foreground break-words">{value}</span>
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
  const [newStatus, setNewStatus] = useState('');
  const [pendingReason, setPendingReason] = useState('');
  const [pendingComment, setPendingComment] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [sectionTechs, setSectionTechs] = useState<User[]>([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

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
    if (!isOpen) { setTicket(null); setNewStatus(''); setSectionTechs([]); setSelectedTechId(''); }
  }, [isOpen, ticketId, fetchTicket]);

  const role = userData?.role ?? 'user';
  const ASSIGN_ROLES = ['admin', 'hod', 'manager', 'head_of_section'];
  const TERMINAL_STATUSES = ['resolved', 'closed', 'rejected', 'pending_approval'];

  useEffect(() => {
    if (!ticket || !ASSIGN_ROLES.includes(role)) return;
    if (TERMINAL_STATUSES.includes(ticket.status)) { setSectionTechs([]); return; }
    usersService.getAssignableUsers({ section_id: ticket.section.id })
      .then(res => setSectionTechs(res.results ?? []))
      .catch(() => setSectionTechs([]));
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
      setNewStatus('');
      setPendingReason('');
      setPendingComment('');
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

  const handleApprovalSuccess = (updated: Ticket) => {
    setTicket(updated);
    onTicketUpdate?.(updated);
  };

  const nextStatuses = ticket ? getNextStatuses(role, ticket.status) : [];
  const canApproveReject =
    ticket?.status === 'pending_approval' &&
    ['hod', 'manager', 'admin'].includes(role);
  const canAssign =
    ticket != null &&
    ['admin', 'hod', 'manager', 'head_of_section'].includes(role) &&
    !['resolved', 'closed', 'rejected', 'pending_approval'].includes(ticket.status) &&
    sectionTechs.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {loading || !ticket ? (
                <Skeleton className="h-5 w-48" />
              ) : (
                <>
                  <DialogTitle className="text-base font-semibold">
                    {ticket.ticket_no}
                  </DialogTitle>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground truncate">{ticket.title}</span>
                  <Badge className={`text-xs border ${STATUS_BADGE[ticket.status] ?? STATUS_BADGE.open}`}>
                    {STATUS_LABELS[ticket.status] ?? ticket.status}
                  </Badge>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Three-column body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">

          {/* Column 1 — Ticket Details */}
          <ScrollArea className="flex-1 md:w-2/5">
            <div className="p-5 space-y-5">
              {loading || !ticket ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-5 w-full" />)}
                </div>
              ) : (
                <>
                  <Section label="Description">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {ticket.description || <span className="text-muted-foreground italic">No description</span>}
                    </p>
                  </Section>

                  <Section label="Details">
                    <dl className="space-y-2 text-sm">
                      <Row icon={<UserIcon className="h-3.5 w-3.5" />} label="Raised by" value={ticket.raised_by} />
                      {ticket.assigned_to && (
                        <Row icon={<UserIcon className="h-3.5 w-3.5" />} label="Assigned to" value={ticket.assigned_to.name || ticket.assigned_to.username || '—'} />
                      )}
                      {ticket.section && (
                        <Row icon={<Building2 className="h-3.5 w-3.5" />} label="Section" value={ticket.section.name} />
                      )}
                      {ticket.facility && (
                        <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Facility" value={ticket.facility.name} />
                      )}
                      {ticket.priority && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground w-20 flex-shrink-0">Priority</span>
                          <Badge className={`text-xs capitalize ${PRIORITY_BADGE[ticket.priority] ?? ''}`}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      )}
                      <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Created" value={formatDate(ticket.created_at)} />
                      {ticket.due_date && (
                        <Row icon={<Clock className="h-3.5 w-3.5" />} label="Due" value={formatDate(ticket.due_date)} />
                      )}
                      {ticket.resolved_at && (
                        <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Resolved" value={formatDate(ticket.resolved_at)} />
                      )}
                    </dl>
                  </Section>

                  {ticket.pending_reason && (
                    <Section label="Pending Info">
                      <p className="text-sm text-muted-foreground capitalize">{ticket.pending_reason.replace(/_/g, ' ')}</p>
                      {ticket.pending_comment && (
                        <p className="text-sm text-foreground mt-1">{ticket.pending_comment}</p>
                      )}
                    </Section>
                  )}

                  {ticket.escalation_level !== undefined && ticket.escalation_level > 0 && (
                    <Section label="Escalation">
                      <p className="text-sm text-orange-600">
                        Level {ticket.escalation_level}
                        {ticket.escalated_to && ` → ${ticket.escalated_to.name || ticket.escalated_to.username}`}
                      </p>
                    </Section>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Column 2 — Actions */}
          <ScrollArea className="md:w-1/4 flex-shrink-0">
            <div className="p-5 space-y-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</p>

              {loading || !ticket ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  {/* Status update */}
                  {nextStatuses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Update Status
                      </p>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          {nextStatuses.map(s => (
                            <SelectItem key={s} value={s}>
                              {STATUS_LABELS[s] ?? s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {newStatus === 'pending' && (
                        <div className="space-y-2 pt-1">
                          <Select value={pendingReason} onValueChange={setPendingReason}>
                            <SelectTrigger className="h-8 text-sm">
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
                            rows={2}
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
                    </div>
                  )}

                  {/* Assignment */}
                  {canAssign && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Assign To
                      </p>
                      <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select technician" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionTechs.map(t => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.first_name && t.last_name
                                ? `${t.first_name} ${t.last_name}`
                                : t.username}
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
                        {isAssigning ? 'Assigning…' : 'Assign'}
                      </Button>
                    </div>
                  )}

                  {/* Approve / Reject */}
                  {canApproveReject && (
                    <ApproveRejectActions
                      ticket={ticket}
                      onSuccess={handleApprovalSuccess}
                    />
                  )}

                  {/* Terminal state notice */}
                  {nextStatuses.length === 0 && !canApproveReject && !canAssign && (
                    <p className="text-xs text-muted-foreground italic">
                      No actions available for this ticket.
                    </p>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Column 3 — Comments */}
          <ScrollArea className="flex-1 md:w-2/5">
            <div className="p-5">
              {loading || !ticket ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : (
                <TicketComments ticket={ticket} />
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
