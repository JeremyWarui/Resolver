/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { switchRoleApi } from '@/lib/api/auth';
import { getPermissions } from './permissions';
import type { PermissionMap, UserScope } from '@/types';
import type { UserRole } from '@/types';

interface RoleContextValue {
  role: UserRole | null;
  permissions: PermissionMap | null;
  scope: UserScope | null;
  isRole: (...roles: UserRole[]) => boolean;
}

const RoleContext = createContext<RoleContextValue>({
  role: null,
  permissions: null,
  scope: null,
  isRole: () => false,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // useAuthStore is populated by useUserData after a successful profile fetch.
  // On first render (before fetch completes) user will be null → role/permissions null.
  const user = useAuthStore((s) => s.user);

  const value = useMemo<RoleContextValue>(() => {
    if (!user) {
      return { role: null, permissions: null, scope: null, isRole: () => false };
    }

    const role = user.role;
    const permissions = getPermissions(role);
    const scope: UserScope = {
      userId: user.id,
      role,
      campusId: user.primary_campus_id ?? null,
      departmentId: user.primary_department_id ?? null,
      sectionIds: user.sections ?? [],
    };

    return {
      role,
      permissions,
      scope,
      isRole: (...roles) => roles.includes(role),
    };
  }, [user]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRoleContext(): RoleContextValue {
  return useContext(RoleContext);
}

export function usePermissions(): PermissionMap {
  const { permissions } = useRoleContext();
  return (
    permissions ?? {
      canCreateTicket: false,
      canAssignTicket: false,
      canReassignTicket: false,
      canUpdateTicketStatus: false,
      canEscalate: false,
      canCloseTicket: false,
      canReopenTicket: false,
      canRateTicket: false,
      canViewDeptQueue: false,
      canViewOrgAnalytics: false,
      canViewSLATracking: false,
      canExportReports: false,
      canConfigureSystem: false,
      canManageUsers: false,
    }
  );
}

export function useScope(): UserScope | null {
  return useRoleContext().scope;
}

// useSwitchRole — calls POST /auth/switch-role/ to get a new scoped JWT, then updates the store.
// useWsChannels automatically reconnects when scope.role changes after setUser.
// campus_name / primary_*_display are refreshed by useUserData on next mount — the switch-role
// response doesn't carry those display variants, but it does carry home_campus_name,
// primary_department_name, and section_name directly, so those are set here right away.
export function useSwitchRole(): { switchRole: (roleAssignmentId: number) => Promise<void> } {
  const setUser = useAuthStore((s) => s.setUser);

  const switchRole = useCallback(
    async (roleAssignmentId: number) => {
      try {
        const flat = await switchRoleApi(roleAssignmentId);
        setUser(
          {
            id: flat.user_id,
            username: flat.username,
            email: flat.email,
            first_name: flat.first_name,
            last_name: flat.last_name,
            role: flat.role,
            campus_name: null,
            sections: flat.sections,
            section_names: [],
            section_name: flat.section_name,
            primary_campus_id: flat.primary_campus_id,
            primary_campus_display: null,
            primary_department_id: flat.primary_department_id,
            primary_department_display: null,
            primary_department_name: flat.primary_department_name,
            home_campus_id: null,
            home_campus_name: flat.home_campus_name,
          },
          flat.token
        );
      } catch {
        toast.error('Failed to switch role');
      }
    },
    [setUser]
  );

  return { switchRole };
}
