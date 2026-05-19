import { GenericQuickFilterButtons } from "@/components/Common/GenericQuickFilterButtons";
import { Filter, Inbox, AlertTriangle, Clock, CheckCircle, PlayCircle, ListTodo } from "lucide-react";
import type { QuickFilterConfig } from "@/components/Common/GenericQuickFilterButtons";

export type QuickFilterType = 'all' | 'open' | 'unassigned' | 'overdue' | 'in_progress' | 'resolved';

interface QuickFilterButtonsProps {
  activeFilter: QuickFilterType;
  onFilterChange: (filter: QuickFilterType) => void;
  counts?: {
    all?: number;
    open?: number;
    unassigned?: number;
    overdue?: number;
    in_progress?: number;
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
    id: 'open',
    label: 'Open',
    icon: Inbox,
    colorClass: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
  {
    id: 'unassigned',
    label: 'Unassigned',
    icon: Filter,
    colorClass: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  },
  {
    id: 'overdue',
    label: 'Overdue',
    icon: AlertTriangle,
    colorClass: 'bg-red-100 text-red-700 hover:bg-red-200',
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    icon: PlayCircle,
    colorClass: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  },
  {
    id: 'resolved',
    label: 'Resolved',
    icon: CheckCircle,
    colorClass: 'bg-green-100 text-green-700 hover:bg-green-200',
  },
];

export default function QuickFilterButtons({
  activeFilter,
  onFilterChange,
  counts = {},
}: QuickFilterButtonsProps) {
  return (
    <GenericQuickFilterButtons
      filters={FILTERS}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      counts={counts}
      headerIcon={Clock}
      headerLabel="Quick Filters:"
    />
  );
}
