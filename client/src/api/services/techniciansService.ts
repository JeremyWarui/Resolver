import apiClient from '../client';
import type { Technician, TechniciansResponse, TechniciansParams } from '@/types';

const techniciansService = {
  // Get all technicians with filters and pagination
  getTechnicians: async (params?: TechniciansParams): Promise<TechniciansResponse> => {
    const response = await apiClient.get('/users/', { 
      params: {
        ...params,
        role: 'technician', // Always filter for technicians only
      }
    });
    return response.data;
  },

  // Get single technician by ID
  getTechnicianById: async (id: number): Promise<Technician> => {
    const response = await apiClient.get(`/users/${id}/`);
    return response.data;
  },

  // Update technician
  updateTechnician: async (id: number, data: Partial<Technician>): Promise<Technician> => {
    const response = await apiClient.patch(`/users/${id}/`, data);
    return response.data;
  },
};

export default techniciansService;
