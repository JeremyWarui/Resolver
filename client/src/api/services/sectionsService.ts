import apiClient from '../client';
import type { Section, SectionsResponse } from '@/types';

const sectionsService = {
  // Get all sections
  getSections: async (): Promise<SectionsResponse> => {
    const response = await apiClient.get('/sections/');
    return response.data;
  },

  // Get single section by ID
  getSectionById: async (id: number): Promise<Section> => {
    const response = await apiClient.get(`/sections/${id}/`);
    return response.data;
  },

  // Create a new section
  createSection: async (data: { name: string; description?: string }): Promise<Section> => {
    const response = await apiClient.post('/sections/', data);
    return response.data;
  },

  // Update a section
  updateSection: async (id: number, data: Partial<Section>): Promise<Section> => {
    const response = await apiClient.patch(`/sections/${id}/`, data);
    return response.data;
  },

  // Delete a section
  deleteSection: async (id: number): Promise<void> => {
    await apiClient.delete(`/sections/${id}/`);
  },
};

export default sectionsService;
