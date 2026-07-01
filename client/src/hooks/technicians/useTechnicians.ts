import type { Technician } from '@/types';

export interface TechnicianFilters {
  campus_department_id?: number;
  section_ids?: string;
  section_id?: number;
  campus_id?: number;
}

export const TECHNICIANS_KEY = ['technicians'] as const;

/**
 * ⚠️ DEPRECATED: useTechnicians hook
 * 
 * The /technicians/ endpoint does not exist on the backend.
 * Per CLAUDE.md §28 Reconciliation, user management endpoints have been removed.
 * 
 * This hook now returns an empty array. Components should:
 * - Use /sections/{id}/technicians/ for section-scoped technician lists
 * - Query role-assignments with role="technician" for global technician data (admin only)
 * - Use useSectionTechnicians(sectionId) for assignment pools
 * 
 * @deprecated
 */
export const useTechnicians = (_filters?: TechnicianFilters) => {
  console.warn(
    'useTechnicians hook is deprecated. The /technicians/ endpoint does not exist. ' +
    'Use /sections/{id}/technicians/ for section-scoped lists, or ' +
    'useSectionTechnicians(sectionId) for assignment pools. ' +
    'See CLAUDE.md §28 for details.'
  );

  return {
    technicians: [] as Technician[],
    loading: false,
    error: null,
    refetch: () => {},
  };
};

export default useTechnicians;
