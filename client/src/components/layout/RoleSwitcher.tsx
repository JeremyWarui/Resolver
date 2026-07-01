import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'User',
  technician: 'Technician',
  hos: 'Head of Section',
  hod: 'Head of Department',
  manager: 'Manager',
  admin: 'Admin',
};

// role_assignments comes from GET /auth/me/ — it may not be present on the cached User object.
// Cast to access it safely; the switcher is hidden when the field is absent or has only 1 entry.
type UserWithRoleAssignments = {
  role: UserRole;
  role_assignments?: Array<{ id: number; role: string; is_primary: boolean }>;
};

export function RoleSwitcher() {
  const user = useAuthStore((s) => s.user) as UserWithRoleAssignments | null;

  if (!user) return null;

  const assignments = user.role_assignments ?? [];

  if (assignments.length <= 1) return null;

  const otherRoles = assignments
    .filter((ra) => ra.role !== user.role)
    .map((ra) => ra.role as UserRole);

  function handleSwitch(role: UserRole) {
    toast.info('Role switch coming soon');
    void role;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          {ROLE_LABELS[user.role]}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {otherRoles.map((role) => (
          <DropdownMenuItem key={role} onClick={() => handleSwitch(role)}>
            {ROLE_LABELS[role]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
