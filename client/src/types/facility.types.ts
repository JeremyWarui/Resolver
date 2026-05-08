export interface Facility {
  id: number;
  name: string;
  type?: 'building' | 'ict' | 'laundry' | 'kitchen' | 'residential' | null;
  status?: string;
  location?: string | null;
  floors_count?: number;
}

export interface FacilityFloor {
  id: number;
  facility: number;
  facility_name: string;
  name: string;
  order: number;
  rooms_count: number;
}

export interface FacilityRoom {
  id: number;
  floor: number;
  floor_name: string;
  name: string;
  code: string;
}

export interface LocationSelection {
  facility: number | null;
  floor: number | null;
  room: number | null;
  location_detail: string;
}

export interface FacilitiesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Facility[];
}
