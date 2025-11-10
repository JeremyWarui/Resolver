import apiClient from '../client';
import type { Facility, FacilitiesResponse } from '@/types';

const facilitiesService = {
  // Get all facilities
  getFacilities: async (): Promise<FacilitiesResponse> => {
    const response = await apiClient.get('/facilities/');
    return response.data;
  },

  // Get single facility by ID
  getFacilityById: async (id: number): Promise<Facility> => {
    const response = await apiClient.get(`/facilities/${id}/`);
    return response.data;
  },

  // Create a new facility
  createFacility: async (data: { name: string; type?: string; status?: string; location?: string }): Promise<Facility> => {
    const response = await apiClient.post('/facilities/', data);
    return response.data;
  },

  // Update a facility
  updateFacility: async (id: number, data: Partial<Facility>): Promise<Facility> => {
    const response = await apiClient.patch(`/facilities/${id}/`, data);
    return response.data;
  },

  // Delete a facility
  deleteFacility: async (id: number): Promise<void> => {
    await apiClient.delete(`/facilities/${id}/`);
  },
};

export default facilitiesService;
