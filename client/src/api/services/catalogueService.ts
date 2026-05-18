import apiClient from '../client'
import type { ServiceCategory, ServiceItem } from '../../types/catalogue'

// ── Read ──────────────────────────────────────────────────────────────────────

export const getCategoriesBySectionType = (sectionTypeId: number) =>
  apiClient.get<ServiceCategory[]>(`/section-types/${sectionTypeId}/categories/`)

export const getCategoriesByDepartment = (departmentId: number) =>
  apiClient.get<ServiceCategory[]>(`/service-catalogue/service-categories/`, {
    params: { section_type__department: departmentId, is_active: true },
  })

export const getAllCategories = (params?: { section_type?: number; is_active?: boolean }) =>
  apiClient.get<ServiceCategory[]>(`/service-catalogue/service-categories/`, { params })

export const getServiceItemsByCategory = (categoryId: number) =>
  apiClient.get<ServiceItem[]>(`/service-catalogue/service-items/`, {
    params: { category: categoryId },
  })

export const getAllServiceItems = (params?: { category?: number; is_active?: boolean }) =>
  apiClient.get<ServiceItem[]>(`/service-catalogue/service-items/`, { params })

export const getServiceItemDetail = (itemId: number) =>
  apiClient.get<ServiceItem>(`/service-catalogue/service-items/${itemId}/`)

// ── Service Categories CRUD ───────────────────────────────────────────────────

export const createCategory = (data: {
  section_type_id: number
  name: string
  description?: string
  icon?: string
  order?: number
  is_active?: boolean
}) => apiClient.post<ServiceCategory>(`/service-catalogue/service-categories/`, data)

export const updateCategory = (id: number, data: Partial<ServiceCategory>) =>
  apiClient.patch<ServiceCategory>(`/service-catalogue/service-categories/${id}/`, data)

export const deleteCategory = (id: number) =>
  apiClient.delete(`/service-catalogue/service-categories/${id}/`)

// ── Service Items CRUD ────────────────────────────────────────────────────────

export const createServiceItem = (data: {
  category_id: number
  name: string
  description?: string
  default_priority?: ServiceItem['default_priority']
  sla_hours?: number | null
  requires_approval?: boolean
  order?: number
  is_active?: boolean
}) => apiClient.post<ServiceItem>(`/service-catalogue/service-items/`, data)

export const updateServiceItem = (id: number, data: Partial<ServiceItem>) =>
  apiClient.patch<ServiceItem>(`/service-catalogue/service-items/${id}/`, data)

export const deleteServiceItem = (id: number) =>
  apiClient.delete(`/service-catalogue/service-items/${id}/`)
