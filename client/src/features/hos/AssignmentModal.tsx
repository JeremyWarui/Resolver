// AssignmentModal — assign or reassign a ticket to a technician.
// Loads the section's technician pool via GET /sections/{id}/technicians/.
// Shows workload bar when activeTicketCounts is available.
// Calls PATCH /tickets/:id/ with assigned_to_id.

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { TechnicianPicker } from '@/components/shared/forms/TechnicianPicker';
import { assignTicket } from '@/lib/api/tickets';
import { useTicketInvalidate } from '@/hooks/tickets/useTicketDetail';
import { useSectionTechnicians } from '@/hooks/technicians/useSectionTechnicians';
import type { Ticket } from '@/types';

interface AssignmentModalProps {
  ticket: Ticket;
  open: boolean;
  onClose: () => void;
  onSuccess: (updated: Ticket) => void;
  mode?: 'assign' | 'reassign';
}

export function AssignmentModal({
  ticket,
  open,
  onClose,
  onSuccess,
  mode = 'assign',
}: AssignmentModalProps) {
  const [selectedTechId, setSelectedTechId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const invalidate = useTicketInvalidate();

  // Load only technicians from this ticket's section pool (R8 — section-scoped assignment)
  const { data: technicians = [], isLoading: loadingTechs } = useSectionTechnicians(
    open ? ticket.section.id : null,
  );

  function handleClose() {
    setSelectedTechId(null);
    setNote('');
    onClose();
  }

  async function handleSubmit() {
    if (!selectedTechId) return;
    setSubmitting(true);
    try {
      const updated = await assignTicket(ticket.id, selectedTechId);
      const techName = technicians.find((t) => t.id === selectedTechId);
      const displayName = techName
        ? (techName.first_name && techName.last_name
          ? `${techName.first_name} ${techName.last_name}`
          : techName.username)
        : `technician ${selectedTechId}`;
      toast.success(
        mode === 'reassign'
          ? `Ticket reassigned to ${displayName}`
          : `Ticket assigned to ${displayName}`
      );
      invalidate(ticket.id);
      setSelectedTechId(null);
      setNote('');
      onSuccess(updated);
    } catch {
      toast.error(mode === 'reassign' ? 'Failed to reassign ticket' : 'Failed to assign ticket');
    } finally {
      setSubmitting(false);
    }
  }

  const title = mode === 'reassign' ? 'Reassign ticket' : 'Assign ticket';
  const currentAssignee = ticket.assigned_to;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current assignee (for reassign mode) */}
          {currentAssignee && (
            <div className="text-sm text-muted-foreground">
              Currently assigned to{' '}
              <span className="font-medium text-foreground">
                {currentAssignee.name || currentAssignee.username}
              </span>
            </div>
          )}

          {/* Technician picker */}
          <div className="space-y-1.5">
            <Label>
              {mode === 'reassign' ? 'New technician' : 'Technician'}{' '}
              <span className="text-destructive">*</span>
            </Label>
            {loadingTechs ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <TechnicianPicker
                value={selectedTechId}
                onValueChange={(v) => setSelectedTechId(v)}
                technicians={technicians}
                includeUnassigned={false}
                placeholder={
                  technicians.length === 0
                    ? 'No technicians available for this section'
                    : 'Select a technician'
                }
              />
            )}
            {!loadingTechs && technicians.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                No assignable technicians found for section "{ticket.section.name}".
              </p>
            )}
          </div>

          {/* Optional note */}
          <div className="space-y-1.5">
            <Label>
              Note
              <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any context or instructions for the technician…"
              rows={3}
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedTechId || submitting}
          >
            {submitting
              ? mode === 'reassign' ? 'Reassigning…' : 'Assigning…'
              : mode === 'reassign' ? 'Reassign' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
