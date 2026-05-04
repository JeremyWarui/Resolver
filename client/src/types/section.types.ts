export interface NestedRef {
  id: number;
  code: string;
  name: string;
}

export interface SectionHead {
  id: number;
  username: string;
  name: string;
}

export interface Section {
  id: number;
  name: string;
  code: string;
  description?: string;
  campus?: NestedRef;
  department?: NestedRef;
  section_head?: SectionHead | null;
  technicians?: string[];
  is_active?: boolean;
}

export interface SectionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Section[];
}
