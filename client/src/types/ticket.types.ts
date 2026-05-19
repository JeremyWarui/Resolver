import type { NestedRef } from './section.types';

export interface AssignedUser {
  id: number;
  name: string;
  username?: string;
  role?: string;
}

export interface EscalationStatus {
  code: 'none' | 'head_of_section' | 'hod' | 'manager' | 'unknown';
  label: string;
}

export interface OrganizationalPath {
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
  status: 'open' | 'assigned' | 'in_progress' | 'pending' | 'pending_approval' | 'approved' | 'rejected' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'critical';

  // Write-only IDs (sent on create/update)
  section_id?: number;
  facility_id?: number;
  assigned_to_id?: number | null;

  // Read-only nested objects
  section: NestedRef;
  facility: NestedRef;
  raised_by: string;    // full name (e.g. "Alex Mugo"), falls back to username if no name set
  raised_by_id: number; // user ID — use this for ownership checks, not raised_by
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

  // Location fields
  floor?: number | null;
  floor_name?: string | null;
  room?: number | null;
  room_name?: string | null;
  location_detail?: string;

  // Scheduling
  due_date?: string | null;

  // Available technicians (only for roles that can assign)
  available_technicians?: Array<{ id: number; username: string; full_name: string }>;

  // Nested data (detail view only)
  comments?: Comment[];
  feedback?: Feedback;
  service_item?: {
    id: number;
    name: string;
    category_name: string;
    requires_approval: boolean;
  } | null;
  form_data?: Record<string, unknown> | null;
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
  facility_id?: number | null;
  floor_id?: number | null;
  room_id?: number | null;
  location_detail?: string;
  service_item_id?: number | null;
  form_data?: Record<string, unknown> | null;
}

export interface CreateTicketCataloguePayload {
  department_id: number;
  service_item_id: number;
  title: string;
  description: string;
  facility_id?: number | null;
  location_detail?: string;
  form_data?: Record<string, unknown> | null;
}

export interface CreateTicketCatalogueResponse {
  ticket: Ticket;
  campus_department: { id: number; campus: { code: string; name: string }; department: { code: string; name: string } };
  section: { id: number; name: string; code: string };
  eligible_technicians: { id: number; username: string; full_name: string }[];
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

export interface ApproveTicketPayload {
  notes?: string;
}

export interface RejectTicketPayload {
  reason: string;
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
