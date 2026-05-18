import apiClient from '../client';
import type { Campus, Department, Section, SectionType, CampusDepartment } from '../../types/organisationStructure';
import type { Facility, FacilityFloor, FacilityRoom } from '../../types/facility.types';

export const campusesService = {
  getCampuses: async (): Promise<Campus[]> => {
    const response = await apiClient.get<Campus[]>('/campuses/');
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).results || [];
  },
  getCampus: async (id: number): Promise<Campus> => {
    const response = await apiClient.get(`/campuses/${id}/`);
    return response.data;
  },
  createCampus: async (data: { name: string; code: string; location: string }): Promise<Campus> => {
    const response = await apiClient.post('/campuses/', data);
    return response.data;
  },
  updateCampus: async (id: number, data: Partial<Campus>): Promise<Campus> => {
    const response = await apiClient.patch(`/campuses/${id}/`, data);
    return response.data;
  },
  deleteCampus: async (id: number): Promise<void> => {
    await apiClient.delete(`/campuses/${id}/`);
  },
};

export const departmentsService = {
  getDepartments: async (params?: { campus?: number }): Promise<Department[]> => {
    const response = await apiClient.get<Department[]>('/departments/', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).results || [];
  },
  getDepartment: async (id: number): Promise<Department> => {
    const response = await apiClient.get(`/departments/${id}/`);
    return response.data;
  },
  getCampusDepartments: async (campusId: number): Promise<Department[]> => {
    const response = await apiClient.get<Department[]>('/departments/', { params: { campus: campusId } });
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).results || [];
  },
  createDepartment: async (data: { name: string; code: string; campus: number }): Promise<Department> => {
    const response = await apiClient.post('/departments/', data);
    return response.data;
  },
  updateDepartment: async (id: number, data: Partial<Department>): Promise<Department> => {
    const response = await apiClient.patch(`/departments/${id}/`, data);
    return response.data;
  },
  deleteDepartment: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}/`);
  },
};

export const campusDepartmentsService = {
  getCampusDepartments: async (): Promise<CampusDepartment[]> => {
    const response = await apiClient.get<CampusDepartment[]>('/campus-departments/');
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).results || [];
  },
  getCampusDepartment: async (id: number): Promise<CampusDepartment> => {
    const response = await apiClient.get(`/campus-departments/${id}/`);
    return response.data;
  },
  createCampusDepartment: async (data: { campus: number; department: number }): Promise<CampusDepartment> => {
    const response = await apiClient.post('/campus-departments/', data);
    return response.data;
  },
  updateCampusDepartment: async (id: number, data: Partial<CampusDepartment>): Promise<CampusDepartment> => {
    const response = await apiClient.patch(`/campus-departments/${id}/`, data);
    return response.data;
  },
  deleteCampusDepartment: async (id: number): Promise<void> => {
    await apiClient.delete(`/campus-departments/${id}/`);
  },
  assignHOD: async (id: number, headOfDepartmentId: number): Promise<CampusDepartment> => {
    const response = await apiClient.post(`/campus-departments/${id}/assign-hod/`, {
      head_of_department: headOfDepartmentId,
    });
    return response.data;
  },
};

export const sectionsService = {
  getSectionTypes: async (): Promise<SectionType[]> => {
    const response = await apiClient.get<SectionType[]>('/section-types/');
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).results || [];
  },
  getSections: async (params?: { department?: number }): Promise<Section[]> => {
    const response = await apiClient.get<Section[]>('/sections/', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).results || [];
  },
  getDepartmentSections: async (departmentId: number): Promise<Section[]> => {
    const response = await apiClient.get<Section[]>('/sections/', { params: { department: departmentId } });
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).results || [];
  },
  getSection: async (id: number): Promise<Section> => {
    const response = await apiClient.get(`/sections/${id}/`);
    return response.data;
  },
  createSection: async (data: { name: string; code?: string; campus_department: number; section_type: number }): Promise<Section> => {
    const response = await apiClient.post('/sections/', data);
    return response.data;
  },
  updateSection: async (id: number, data: Partial<Section>): Promise<Section> => {
    const response = await apiClient.patch(`/sections/${id}/`, data);
    return response.data;
  },
  deleteSection: async (id: number): Promise<void> => {
    await apiClient.delete(`/sections/${id}/`);
  },
  getSectionTechnicians: async (sectionId: number): Promise<any[]> => {
    const response = await apiClient.get(`/sections/${sectionId}/technicians/`);
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).results || [];
  },
  assignHOS: async (id: number, headOfSectionId: number): Promise<Section> => {
    const response = await apiClient.post(`/sections/${id}/assign-hos/`, {
      head_of_section: headOfSectionId,
    });
    return response.data;
  },
};

export const facilitiesService = {
  getFacilities: async (params?: { campus?: number }): Promise<Facility[]> => {
    const response = await apiClient.get<Facility[]>('/facilities/', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).results || [];
  },
  getFacility: async (id: number): Promise<Facility> => {
    const response = await apiClient.get(`/facilities/${id}/`);
    return response.data;
  },
  getCampusFacilities: async (campusId: number): Promise<Facility[]> => {
    const response = await apiClient.get<Facility[]>(`/campuses/${campusId}/facilities/`);
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).results || [];
  },
  createFacility: async (data: { name: string; campus: number; type?: string }): Promise<Facility> => {
    const response = await apiClient.post('/facilities/', data);
    return response.data;
  },
  updateFacility: async (id: number, data: Partial<Facility>): Promise<Facility> => {
    const response = await apiClient.patch(`/facilities/${id}/`, data);
    return response.data;
  },
  deleteFacility: async (id: number): Promise<void> => {
    await apiClient.delete(`/facilities/${id}/`);
  },
  getFacilityFloors: async (facilityId: number): Promise<FacilityFloor[]> => {
    const response = await apiClient.get<FacilityFloor[]>(`/facilities/${facilityId}/floors/`);
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).results || [];
  },
  getFloorRooms: async (floorId: number): Promise<FacilityRoom[]> => {
    const response = await apiClient.get<FacilityRoom[]>(`/floors/${floorId}/rooms/`);
    const data = response.data;
    return Array.isArray(data) ? data : (data as any).results || [];
  },
};

const organizationsService = {
  campuses: campusesService,
  departments: departmentsService,
  campusDepartments: campusDepartmentsService,
  sections: sectionsService,
  facilities: facilitiesService,
};

export type { Campus, Department, Section, SectionType, CampusDepartment };
export default organizationsService;
