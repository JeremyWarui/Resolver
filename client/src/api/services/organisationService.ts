import apiClient from '../client'
import type { Campus, Department, Section, DepartmentType, SectionType } from '../../types/organisation'
import type { Facility, FacilityFloor, FacilityRoom } from '../../types/facility.types'

export const getCampuses = () =>
  apiClient.get<Campus[]>('/campuses/')

export const getCampusDepartments = (campusId: number) =>
  apiClient.get<Department[]>(`/campuses/${campusId}/departments/`)

export const getCampusFacilities = (campusId: number) =>
  apiClient.get<Facility[]>(`/campuses/${campusId}/facilities/`)

export const getDepartmentTypes = () =>
  apiClient.get<DepartmentType[]>('/service-catalogue/department-types/')

export const getSectionTypes = () =>
  apiClient.get<SectionType[]>('/section-types/')

export const getDepartments = (params?: { campus?: number }) =>
  apiClient.get<Department[]>('/departments/', { params })

export const getDepartmentSections = (departmentId: number) =>
  apiClient.get<Section[]>(`/departments/${departmentId}/sections/`)

export const getSections = (params?: { department?: number }) =>
  apiClient.get<Section[]>('/sections/', { params })

export const getSectionTechnicians = (sectionId: number) =>
  apiClient.get(`/sections/${sectionId}/technicians/`)

export const getFacilities = (params?: { campus?: number }) =>
  apiClient.get<Facility[]>('/facilities/', { params })

export const getFacilityFloors = (facilityId: number) =>
  apiClient.get<FacilityFloor[]>(`/facilities/${facilityId}/floors/`)

export const getFloorRooms = (floorId: number) =>
  apiClient.get<FacilityRoom[]>(`/floors/${floorId}/rooms/`)
