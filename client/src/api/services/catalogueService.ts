import apiClient from '../client'
import type { ServiceCategory, ServiceItem } from '../../types/catalogue'

export const getCategoriesBySectionType = (sectionTypeId: number) =>
  apiClient.get<ServiceCategory[]>(`/section-types/${sectionTypeId}/categories/`)

export const getServiceItemsByCategory = (categoryId: number) =>
  apiClient.get<ServiceItem[]>(`/categories/${categoryId}/items/`)

export const getServiceItemDetail = (itemId: number) =>
  apiClient.get<ServiceItem>(`/service-items/${itemId}/`)
