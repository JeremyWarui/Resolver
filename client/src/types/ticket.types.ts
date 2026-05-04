import type { NestedRef } from './section.types';

export interface AssignedUser {
  id: number;
  name: string;
  username?: string;
  role?: string;
}

export interface EscalationStatus {
  code: 'none' | 'section_head' | 'hod' | 'director' | 'unknown';
  label: string;
}

export interface OrganizationalPath {
  organization: NestedRef | null;
  campus: NestedRef | null;
  department: NestedRef | null;
  section: NestedRef;
}

export interface Comment {
  id: number;
  ticket: { id: number; ticket_no: string };
  text: string;
  author: string;
  created_at: string;
}

export interface Feedback {
  id: number;
  ticket: { id: number; ticket_no: string };
  rated_by: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_no: string;
  title: string;
  description: string;
  status: 'open' | 'assigned' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'critical';

  // Write-only IDs (sent on create/update)
  section_id?: number;
  facility_id?: number;
  assigned_to_id?: number | null;

  // Read-only nested objects
  section: NestedRef;
  facility: NestedRef;
  raised_by: string;
  assigned_to: AssignedUser | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;

  // Pending info
  pending_reason?: string | null;
  pending_comment?: string | null;

  // Escalation fields (present for section_head/hod/admin roles)
  escalation_level?: 0 | 1 | 2;
  escalation_status?: EscalationStatus;
  escalated_to?: AssignedUser | null;
  escalated_at?: string | null;
  escalation_reason?: string | null;
  next_escalation_due?: string | null;
  is_due_for_escalation?: boolean;
  organizational_path?: OrganizationalPath | null;

  // Nested data (detail view only)
  comments?: Comment[];
  feedback?: Feedback;
}

export interface TicketsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ticket[];
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  section_id: number;
  facility_id: number;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  section_id?: number;
  facility_id?: number;
  status?: Ticket['status'];
  assigned_to_id?: number | null;
  pending_reason?: string | null;
  pending_comment?: string | null;
}

export interface BulkStatusUpdatePayload {
  ticket_ids: number[];
  status: Ticket['status'];
}

export interface TicketsParams {
  page?: number;
  page_size?: number;
  status?: string;
  section?: number;
  assigned_to?: number;
  assigned_to__isnull?: boolean;
  raised_by?: number;
  ordering?: string;
  search?: string;
  is_overdue?: boolean;
}
