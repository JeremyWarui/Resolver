export interface Facility {
  id: number;
  name: string;
  type?: 'building' | 'ict' | 'laundry' | 'kitchen' | 'residential' | null;
  status?: string;
  location?: string | null;
}

export interface FacilitiesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Facility[];
}
