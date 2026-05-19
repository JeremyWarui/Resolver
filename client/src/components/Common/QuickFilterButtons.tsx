import type { UserRole } from '@/types';
import { GenericQuickFilterButtons } from '@/components/Common/GenericQuickFilterButtons';
import { QUICK_FILTER_CONFIG } from '@/constants/quickFilterConfig';
import { Wrench, Clock } from 'lucide-react';

// Export filter type IDs for type safety
export type AdminQuickFilterType = 'all' | 'open' | 'unassigned' | 'overdue' | 'in_progress' | 'resolved';
export type TechQuickFilterType = 'all' | 'assigned' | 'in_progress' | 'pending' | 'resolved';

interface QuickFilterButtonsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts?: Record<string, number>;
  role: UserRole;
}

export function QuickFilterButtons({
  activeFilter,
  onFilterChange,
  counts = {},
  role,
}: QuickFilterButtonsProps) {
  const filters = QUICK_FILTER_CONFIG[role];

  // Return null if no filters configured for this role
  if (!filters || filters.length === 0) {
    return null;
  }

  // Technician filters include descriptions
  const showDescription = role === 'technician';
  // Technician uses Wrench icon, admin uses Clock icon
  const headerIcon = role === 'technician' ? Wrench : Clock;

  return (
    <GenericQuickFilterButtons
      filters={filters}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      counts={counts}
      headerIcon={headerIcon}
      headerLabel="Quick Filters:"
      showDescription={showDescription}
      activeButtonClass="bg-[#0078d4] hover:bg-[#106ebe] text-white"
    />
  );
}
