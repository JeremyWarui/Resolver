export type UserRole =
  | 'user'
  | 'technician'
  | 'head_of_section'
  | 'hod'
  | 'manager'
  | 'admin';

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  campus_name: string | null;
  sections: number[];
  section_names?: string[];
  primary_campus_id: number | null;
  primary_campus_display: string | null;
  primary_department_id: number | null;
  primary_department_display: string | null;
  primary_department_name?: string | null;
  can_assign_tickets: boolean;
  can_escalate_tickets: boolean;
  can_view_analytics: boolean;
}

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: UserRole;
  sections?: number[];
  primary_department_id?: number | null;
}

export interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

// ============================================
// USER DASHBOARD TYPES
// ============================================

export interface UserAnalytics {
  total: number;
  open: number;
  closed: number;
  pending: number;
  pending_approval: number;
  escalated: number;
  rejected: number;
  avg_resolution_hours: number;
}

export interface UserSummary {
  id: number;
  username: string;
  name: string;
}

export interface RecentTicket {
  id: number;
  ticket_no: string;
  title: string;
  status: string;
  priority?: string;
  campus: string;
  department?: string;
  section?: string;
  assigned_to?: {
    id: number;
    name: string;
  } | null;
  service_item?: string | null;
  created_at: string;
  updated_at: string;
  due_date?: string | null;
  is_overdue?: boolean;
}

export interface FeedbackOpportunity {
  id: number;
  ticket_no: string;
  title: string;
  resolved_at: string;
  section_name?: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface UserDashboard {
  user: UserSummary;
  summary: UserAnalytics;
  recent_tickets: RecentTicket[];
  feedback_needed: FeedbackOpportunity[];
  status_distribution: StatusDistribution[];
}
