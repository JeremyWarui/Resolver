export interface Technician {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'technician';
  sections: number[]; // Array of section IDs
}

export interface TechniciansResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Technician[];
}

export interface TechniciansParams {
  page?: number;
  page_size?: number;
  sections?: number; // Filter by section ID
  ordering?: string;
  search?: string;
}
