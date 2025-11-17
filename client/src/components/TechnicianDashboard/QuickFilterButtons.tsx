import { Button } from "@/components/ui/button";
import { 
  Inbox, 
  Wrench, 
  PauseCircle, 
  CheckCircle,
  ListTodo
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function TechQuickFilterButtons({ 
  activeFilter, 
  onFilterChange, 
  counts = {} 
}: TechQuickFilterButtonsProps) {
  
  const filters = [
    { 
      id: 'all' as TechQuickFilterType, 
      label: 'All Tickets', 
      icon: ListTodo, 
      count: counts.all,
      colorClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    },
    { 
      id: 'assigned' as TechQuickFilterType, 
      label: 'New Work', 
      icon: Inbox, 
      count: counts.assigned,
      colorClass: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      description: 'Ready to start'
    },
    { 
      id: 'in_progress' as TechQuickFilterType, 
      label: 'Active Jobs', 
      icon: Wrench, 
      count: counts.in_progress,
      colorClass: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      description: 'Working on it'
    },
    { 
      id: 'pending' as TechQuickFilterType, 
      label: 'On Hold', 
      icon: PauseCircle, 
      count: counts.pending,
      colorClass: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      description: 'Need parts/help'
    },
    { 
      id: 'resolved' as TechQuickFilterType, 
      label: 'Finished', 
      icon: CheckCircle, 
      count: counts.resolved,
      colorClass: 'bg-green-100 text-green-700 hover:bg-green-200',
      description: 'Work done'
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <div className="flex items-center gap-1 text-sm text-gray-600 mr-2">
        <Wrench className="h-4 w-4" />
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
            className={`
              flex items-center gap-2 transition-all
              ${!isActive && filter.colorClass}
              ${isActive ? 'bg-[#0078d4] hover:bg-[#106ebe] text-white' : ''}
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{filter.label}</span>
            {typeof filter.count === 'number' && (
              <Badge 
                variant={isActive ? "secondary" : "outline"}
                className={`
                  ml-1 px-1.5 py-0 h-5 min-w-[20px] text-xs font-semibold
                  ${isActive ? 'bg-white/20 text-white border-white/30' : ''}
                `}
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
