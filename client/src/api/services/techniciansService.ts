import apiClient from '../client';
import type { Technician } from '@/types';

export interface TechnicianFilters {
  campus_department_id?: number;
  section_ids?: string;   // comma-separated section IDs
  section_id?: number;
  campus_id?: number;
}

const techniciansService = {
  // Get active technicians — dedicated unpaginated endpoint.
  // Pass filters to scope to a campus department, section, or campus.
  getTechnicians: async (filters?: TechnicianFilters): Promise<Technician[]> => {
    const response = await apiClient.get('/technicians/', { params: filters });
    return response.data;
  },
};

export default techniciansService;
