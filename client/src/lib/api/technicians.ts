import type { Technician, TechnicianDashboard } from '@/types';

export interface TechnicianFilters {
  campus_department_id?: number;
  section_ids?: string;
  section_id?: number;
  campus_id?: number;
}

/**
 * ⚠️ DEPRECATED: /technicians/ endpoint does not exist
 * 
 * Per CLAUDE.md §28 Reconciliation and backend URL analysis, the /technicians/ endpoint
 * is not registered. Use role-assignment endpoints or section-scoped technician lists instead.
 * 
 * For assignment pools: use /sections/{id}/technicians/
 * For technician data: query role-assignments with role='technician'
 * 
 * @deprecated
 */
export async function getTechnicians(
  _filters?: TechnicianFilters
): Promise<Technician[]> {
  throw new Error(
    'Technicians endpoint (/technicians/) does not exist. ' +
    'Use /sections/{id}/technicians/ for section-scoped technician lists, ' +
    'or query role-assignments with role="technician" for global technician data.'
  );
}

/**
 * ⚠️ DEPRECATED: /technicians/me/dashboard/ endpoint
 * Use the authenticated user's role-scoped dashboard endpoints instead:
 * - /analytics/technicians/me/ for technician-specific analytics
 * 
 * @deprecated
 */
export async function getTechnicianDashboard(): Promise<TechnicianDashboard> {
  throw new Error(
    'Technician dashboard endpoint (/technicians/me/dashboard/) does not exist. ' +
    'Use /analytics/technicians/me/ or the role-scoped dashboard endpoints.'
  );
}

const techniciansService = {
  getTechnicians,
  getTechnicianDashboard,
};

export default techniciansService;
