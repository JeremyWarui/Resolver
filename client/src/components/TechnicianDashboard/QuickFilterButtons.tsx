import { GenericQuickFilterButtons } from "@/components/Common/GenericQuickFilterButtons";
import { Inbox, Wrench, PauseCircle, CheckCircle, ListTodo } from "lucide-react";
import type { QuickFilterConfig } from "@/components/Common/GenericQuickFilterButtons";

export type TechQuickFilterType = 'all' | 'assigned' | 'in_progress' | 'pending' | 'resolved';

interface TechQuickFilterButtonsProps {
  activeFilter: TechQuickFilterType;
  onFilterChange: (filter: TechQuickFilterType) => void;
  counts?: {
    all?: number;
    assigned?: number;
    in_progress?: number;
    pending?: number;
    resolved?: number;
  };
}

const FILTERS: QuickFilterConfig[] = [
  {
    id: 'all',
    label: 'All Tickets',
    icon: ListTodo,
    colorClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  },
  {
    id: 'assigned',
    label: 'New Work',
    icon: Inbox,
    description: 'Ready to start',
    colorClass: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
  {
    id: 'in_progress',
    label: 'Active Jobs',
    icon: Wrench,
    description: 'Working on it',
    colorClass: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  },
  {
    id: 'pending',
    label: 'On Hold',
    icon: PauseCircle,
    description: 'Need parts/help',
    colorClass: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  },
  {
    id: 'resolved',
    label: 'Finished',
    icon: CheckCircle,
    description: 'Work done',
    colorClass: 'bg-green-100 text-green-700 hover:bg-green-200',
  },
];

export default function TechQuickFilterButtons({
  activeFilter,
  onFilterChange,
  counts = {},
}: TechQuickFilterButtonsProps) {
  return (
    <GenericQuickFilterButtons
      filters={FILTERS}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      counts={counts}
      headerIcon={Wrench}
      headerLabel="Quick Filters:"
      showDescription={true}
      activeButtonClass="bg-[#0078d4] hover:bg-[#106ebe] text-white"
    />
  );
}
