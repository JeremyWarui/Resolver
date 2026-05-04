export type UserRole =
  | 'user'
  | 'technician'
  | 'section_head'
  | 'hod'
  | 'director'
  | 'admin';

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  sections: number[];
  primary_campus_id: number | null;
  primary_campus_display: string | null;
  primary_department_id: number | null;
  primary_department_display: string | null;
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
}

export interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}
