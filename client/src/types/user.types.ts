export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'admin' | 'technician' | 'manager';
  sections: number[]; // Array of section IDs
  password?: string; // write-only
}

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin' | 'technician' | 'manager';
  sections?: number[];
}

export interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}
