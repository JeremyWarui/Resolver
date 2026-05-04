import apiClient from '../client';

export interface Organization {
  id: number;
  name: string;
  code: string;
  organization_type: string;
  headquarters: string;
}

export interface Campus {
  id: number;
  name: string;
  code: string;
  location: string;
  organization: { id: number; code: string; name: string };
  organization_id?: number;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  campus: { id: number; code: string; name: string };
  campus_id?: number;
  head_of_department: { id: number; username: string; name: string } | null;
  is_active: boolean;
}

const organizationsService = {
  getOrganizations: async (): Promise<{ count: number; results: Organization[] }> => {
    const response = await apiClient.get('/organizations/');
    return response.data;
  },
  getOrganization: async (id: number): Promise<Organization> => {
    const response = await apiClient.get(`/organizations/${id}/`);
    return response.data;
  },
  createOrganization: async (data: Partial<Organization>): Promise<Organization> => {
    const response = await apiClient.post('/organizations/', data);
    return response.data;
  },
  updateOrganization: async (id: number, data: Partial<Organization>): Promise<Organization> => {
    const response = await apiClient.patch(`/organizations/${id}/`, data);
    return response.data;
  },
  deleteOrganization: async (id: number): Promise<void> => {
    await apiClient.delete(`/organizations/${id}/`);
  },
};

export const campusesService = {
  getCampuses: async (): Promise<{ count: number; results: Campus[] }> => {
    const response = await apiClient.get('/campuses/');
    return response.data;
  },
  getCampus: async (id: number): Promise<Campus> => {
    const response = await apiClient.get(`/campuses/${id}/`);
    return response.data;
  },
  createCampus: async (data: { name: string; code: string; location: string; organization_id: number }): Promise<Campus> => {
    const response = await apiClient.post('/campuses/', data);
    return response.data;
  },
  updateCampus: async (id: number, data: Partial<Campus & { organization_id: number }>): Promise<Campus> => {
    const response = await apiClient.patch(`/campuses/${id}/`, data);
    return response.data;
  },
  deleteCampus: async (id: number): Promise<void> => {
    await apiClient.delete(`/campuses/${id}/`);
  },
};

export const departmentsService = {
  getDepartments: async (): Promise<{ count: number; results: Department[] }> => {
    const response = await apiClient.get('/departments/');
    return response.data;
  },
  getDepartment: async (id: number): Promise<Department> => {
    const response = await apiClient.get(`/departments/${id}/`);
    return response.data;
  },
  createDepartment: async (data: { name: string; code: string; campus_id: number }): Promise<Department> => {
    const response = await apiClient.post('/departments/', data);
    return response.data;
  },
  updateDepartment: async (id: number, data: Partial<Department & { campus_id: number }>): Promise<Department> => {
    const response = await apiClient.patch(`/departments/${id}/`, data);
    return response.data;
  },
  deleteDepartment: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}/`);
  },
};

export default organizationsService;
