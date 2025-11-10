export interface Section {
  id: number;
  name: string;
  description?: string;
  technicians?: string[]; // Array of usernames (read-only from StringRelatedField)
}

export interface SectionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Section[];
}
