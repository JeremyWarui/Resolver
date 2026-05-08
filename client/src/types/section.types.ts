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
  code: string | null;
  description?: string;
  campus?: NestedRef | null;
  campus_name?: string | null;
  department?: number | NestedRef | null;
  department_name?: string | null;
  section_type?: unknown | null;
  section_type_detail?: unknown | null;
  sla_hours?: number | null;
  effective_sla_hours?: number;
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
