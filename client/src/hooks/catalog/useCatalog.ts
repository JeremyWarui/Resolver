import { useQuery } from '@tanstack/react-query';
import {
  getCatalog,
  getFacilityTypes,
  getFacilitiesByCampusAndType,
  type CatalogCategory,
  type FacilityTypeRef,
} from '@/lib/api/catalogue';

export function useCatalog(campusId: number | null | undefined) {
  return useQuery<CatalogCategory[]>({
    queryKey: ['catalog', campusId],
    queryFn: () => getCatalog(campusId!),
    enabled: campusId != null,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFacilityTypes() {
  return useQuery<FacilityTypeRef[]>({
    queryKey: ['facility-types'],
    queryFn: getFacilityTypes,
    staleTime: 10 * 60 * 1000,
  });
}

export function useFacilitiesForType(
  campusId: number | null | undefined,
  facilityTypeCode: string | null | undefined
) {
  return useQuery<{ id: number; name: string; code: string }[]>({
    queryKey: ['facilities-by-type', campusId, facilityTypeCode],
    queryFn: () => getFacilitiesByCampusAndType(campusId!, facilityTypeCode!),
    enabled: campusId != null && facilityTypeCode != null,
    staleTime: 5 * 60 * 1000,
  });
}
