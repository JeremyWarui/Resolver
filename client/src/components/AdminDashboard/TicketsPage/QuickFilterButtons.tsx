import { Button } from "@/components/ui/button";
import { 
  Filter, 
  Inbox, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  PlayCircle,
  ListTodo
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function QuickFilterButtons({ 
  activeFilter, 
  onFilterChange, 
  counts = {} 
}: QuickFilterButtonsProps) {
  
  const filters = [
    { 
      id: 'all' as QuickFilterType, 
      label: 'All Tickets', 
      icon: ListTodo, 
      count: counts.all,
      variant: 'default' as const,
      colorClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    },
    { 
      id: 'open' as QuickFilterType, 
      label: 'Open', 
      icon: Inbox, 
      count: counts.open,
      variant: 'default' as const,
      colorClass: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    { 
      id: 'unassigned' as QuickFilterType, 
      label: 'Unassigned', 
      icon: Filter, 
      count: counts.unassigned,
      variant: 'default' as const,
      colorClass: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    },
    { 
      id: 'overdue' as QuickFilterType, 
      label: 'Overdue', 
      icon: AlertTriangle, 
      count: counts.overdue,
      variant: 'destructive' as const,
      colorClass: 'bg-red-100 text-red-700 hover:bg-red-200'
    },
    { 
      id: 'in_progress' as QuickFilterType, 
      label: 'In Progress', 
      icon: PlayCircle, 
      count: counts.in_progress,
      variant: 'default' as const,
      colorClass: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    },
    { 
      id: 'resolved' as QuickFilterType, 
      label: 'Resolved', 
      icon: CheckCircle, 
      count: counts.resolved,
      variant: 'default' as const,
      colorClass: 'bg-green-100 text-green-700 hover:bg-green-200'
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <div className="flex items-center gap-1 text-sm text-gray-600 mr-2">
        <Clock className="h-4 w-4" />
        <span className="font-medium">Quick Filters:</span>
      </div>
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        
        return (
          <Button
            key={filter.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-2 py-3 transition-all ${
              isActive 
                ? 'ring-2 ring-offset-1 ring-blue-500' 
                : filter.colorClass
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{filter.label}</span>
            {filter.count !== undefined && (
              <Badge 
                variant={isActive ? "secondary" : "outline"}
                className="ml-1 px-1.5 py-0 h-5 text-xs"
              >
                {filter.count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
