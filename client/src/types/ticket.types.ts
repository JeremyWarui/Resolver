// User interface for nested assigned_to
export interface AssignedUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'admin' | 'technician' | 'manager';
  sections: number[];
}

// Comment interface
export interface Comment {
  id: number;
  ticket: {
    id: number;
    ticket_no: string;
  };
  text: string;
  author: string; // username as string
  created_at: string;
}

// Feedback interface
export interface Feedback {
  id: number;
  ticket: {
    id: number;
    ticket_no: string;
  };
  rated_by: string; // username as string
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
  section_id?: number; // write-only
  section: string; // read-only: section name
  facility_id?: number; // write-only
  facility: string; // read-only: facility name
  raised_by: string; // read-only: username
  assigned_to_id?: number | null; // write-only
  assigned_to: AssignedUser | null; // read-only: full user object
  created_at: string;
  updated_at: string;
  resolved_at?: string | null; // read-only: automatically set when status changes to resolved/closed
  pending_reason?: string | null; // Reason provided when ticket is marked as pending
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
  status?: 'open' | 'assigned' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  assigned_to_id?: number | null;
  pending_reason?: string | null;
}

export interface TicketsParams {
  page?: number;
  page_size?: number;
  status?: string;
  section?: number;
  assigned_to?: number;
  assigned_to__isnull?: boolean; // For filtering unassigned tickets
  raised_by?: number;
  ordering?: string;
  search?: string;
  is_overdue?: boolean; // For filtering overdue tickets (backend implementation needed)
}
