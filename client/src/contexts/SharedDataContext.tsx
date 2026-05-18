import { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';
import useSections from '@/hooks/sections/useSections';
import useFacilities from '@/hooks/facilities/useFacilities';
import { useAdminAnalytics } from '@/hooks/analytics';
import { useUsers } from '@/hooks/users';
import useTechnicians from '@/hooks/technicians/useTechnicians';
import { useCurrentUser } from '@/contexts/UserDataContext';
import type { Section, Facility, Technician, User } from '@/types';
import type { AdminDashboardAnalytics } from '@/types/analytics.types';

/**
 * SharedDataContext
 *
 * Provides centralized access to reference data (sections, facilities, technicians, analytics)
 * across role dashboards. Data fetching is role-aware to avoid unnecessary API calls.
 *
 * Role-based fetch strategy:
 * - admin, manager, hod, head_of_section: fetch sections, facilities, users, adminAnalytics
 * - technician: fetch sections only
 * - user: fetch nothing (no org data needed)
 *
 * Benefits:
 * - Single source of truth for reference data
 * - Role-aware: only fetches what each role needs
 * - Reduces API calls by eliminating unnecessary fetches
 * - Instant page navigation (no loading spinners for cached data)
 */

interface SharedDataContextType {
  // Reference Data
  sections: Section[];
  facilities: Facility[];
  technicians: Technician[];
  users: User[];
  adminAnalytics: AdminDashboardAnalytics | null;
  currentUser: User | null;

  // Loading States
  sectionsLoading: boolean;
  facilitiesLoading: boolean;
  techniciansLoading: boolean;
  usersLoading: boolean;
  analyticsLoading: boolean;
  userLoading: boolean;

  // Combined Loading State (true if ANY data is loading)
  isLoading: boolean;

  // Refetch Methods (for cache invalidation)
  refetchSections: () => void;
  refetchFacilities: () => void;
  refetchTechnicians: () => void;
  refetchUsers: () => void;
  refetchAnalytics: () => void;
  refetchUser: () => void;
  refetchAll: () => void;
}

const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined);

interface SharedDataProviderProps {
  children: ReactNode;
}

/**
 * SharedDataProvider Component
 *
 * Role-aware provider that fetches data based on current user's role.
 * - admin/manager/hod/head_of_section: fetch full org data + analytics
 * - technician: fetch sections only
 * - user: fetch nothing
 */
export function SharedDataProvider({ children }: SharedDataProviderProps) {
  const { userData: currentUser, loading: userLoading } = useCurrentUser();
  const userRole = currentUser?.role;

  // Determine what data to fetch based on role
  const needsFullOrgData = userRole && ['admin', 'manager', 'hod', 'head_of_section'].includes(userRole);
  const needsSectionsOnly = userRole === 'technician';
  const skipAnalytics = !userRole || !['admin', 'manager'].includes(userRole);

  // Always call hooks (rules of hooks), role-based filtering happens below
  const {
    sections: sectionsData,
    loading: sectionsLoading,
    refetch: refetchSections,
  } = useSections();

  const {
    facilities: facilitiesData,
    loading: facilitiesLoading,
    refetch: refetchFacilities,
  } = useFacilities();

  const {
    users: usersData,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useUsers({ page_size: 500 });

  // Dedicated technicians endpoint — all active technicians with sections/campus/dept
  const {
    technicians: techniciansData,
    loading: techniciansLoading,
    refetch: refetchTechnicians,
  } = useTechnicians();

  const technicians = techniciansData;

  // Fetch admin analytics
  const {
    data: adminAnalyticsData,
    loading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useAdminAnalytics(skipAnalytics);

  // Role-aware data exposure: only provide data based on role
  // - admin/manager/hod/head_of_section: full access
  // - technician: sections only
  // - user: nothing (empty arrays/null)
  const sections = needsFullOrgData || needsSectionsOnly ? sectionsData : [];
  const facilities = needsFullOrgData ? facilitiesData : [];
  const users = needsFullOrgData ? usersData : [];
  const adminAnalytics = userRole && ['admin', 'manager'].includes(userRole) ? adminAnalyticsData : null;

  // Only count loading for data that's actually being used
  const relevantSectionsLoading = (needsFullOrgData || needsSectionsOnly) ? sectionsLoading : false;
  const relevantFacilitiesLoading = needsFullOrgData ? facilitiesLoading : false;
  const relevantUsersLoading = needsFullOrgData ? usersLoading : false;
  const relevantAnalyticsLoading = userRole && ['admin', 'manager'].includes(userRole) ? analyticsLoading : false;
  const relevantTechniciansLoading = needsFullOrgData ? techniciansLoading : false;

  const isLoading = userLoading || relevantSectionsLoading || relevantFacilitiesLoading || relevantUsersLoading || relevantAnalyticsLoading;

  // Refetch all data (useful after bulk operations)
  const refetchAll = useCallback(() => {
    if (needsFullOrgData || needsSectionsOnly) refetchSections();
    if (needsFullOrgData) refetchFacilities();
    if (needsFullOrgData) refetchUsers();
    if (userRole && ['admin', 'manager'].includes(userRole)) refetchAnalytics();
  }, [needsFullOrgData, needsSectionsOnly, userRole, refetchSections, refetchFacilities, refetchUsers, refetchAnalytics]);

  // Memoize the context value to prevent unnecessary re-renders
  const value: SharedDataContextType = useMemo(() => ({
    sections,
    facilities,
    technicians,
    users,
    adminAnalytics,
    currentUser,
    sectionsLoading: relevantSectionsLoading,
    facilitiesLoading: relevantFacilitiesLoading,
    techniciansLoading: relevantTechniciansLoading,
    usersLoading: relevantUsersLoading,
    analyticsLoading: relevantAnalyticsLoading,
    userLoading,
    isLoading,
    refetchSections,
    refetchFacilities,
    refetchTechnicians,
    refetchUsers,
    refetchAnalytics,
    refetchUser: () => {}, // User refetch handled elsewhere
    refetchAll,
  }), [
    sections,
    facilities,
    technicians,
    users,
    adminAnalytics,
    currentUser,
    relevantSectionsLoading,
    relevantFacilitiesLoading,
    relevantTechniciansLoading,
    relevantUsersLoading,
    relevantAnalyticsLoading,
    userLoading,
    isLoading,
    refetchSections,
    refetchFacilities,
    refetchTechnicians,
    refetchUsers,
    refetchAnalytics,
    refetchAll,
  ]);

  return (
    <SharedDataContext.Provider value={value}>
      {children}
    </SharedDataContext.Provider>
  );
}

/**
 * useSharedData Hook
 * 
 * Access shared reference data from any component within AdminLayout.
 * 
 * @example
 * // Get all shared data
 * const { sections, facilities, technicians, isLoading } = useSharedData();
 * 
 * @example
 * // Refetch after creating a new section
 * const { refetchSections } = useSharedData();
 * await createSection(data);
 * refetchSections();
 * 
 * @throws {Error} If used outside SharedDataProvider
 */
export function useSharedData(): SharedDataContextType {
  const context = useContext(SharedDataContext);
  
  if (context === undefined) {
    throw new Error('useSharedData must be used within SharedDataProvider');
  }
  
  return context;
}
