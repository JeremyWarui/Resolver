import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface QuickFilterConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  colorClass?: string;
}

interface GenericQuickFilterButtonsProps<T extends string> {
  filters: QuickFilterConfig[];
  activeFilter: T;
  onFilterChange: (filter: T) => void;
  counts?: Partial<Record<T, number | undefined>>;
  headerIcon?: React.ComponentType<{ className?: string }>;
  headerLabel?: string;
  activeButtonClass?: string;
  showDescription?: boolean;
}

export function GenericQuickFilterButtons<T extends string>({
  filters,
  activeFilter,
  onFilterChange,
  counts = {},
  headerIcon: HeaderIcon,
  headerLabel = "Quick Filters:",
  activeButtonClass = "ring-2 ring-offset-1 ring-blue-500",
  showDescription = false,
}: GenericQuickFilterButtonsProps<T>) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      {HeaderIcon && (
        <div className="flex items-center gap-1 text-sm text-gray-600 mr-2">
          <HeaderIcon className="h-4 w-4" />
          <span className="font-medium">{headerLabel}</span>
        </div>
      )}
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        const count = counts[filter.id as T];

        return (
          <div key={filter.id} className={showDescription ? "flex flex-col" : ""}>
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter.id as T)}
              className={`flex items-center gap-2 py-3 transition-all ${
                isActive ? activeButtonClass : filter.colorClass || ""
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{filter.label}</span>
              {count !== undefined && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className="ml-1 px-1.5 py-0 h-5 text-xs"
                >
                  {count}
                </Badge>
              )}
            </Button>
            {showDescription && filter.description && (
              <span className="text-xs text-gray-500 mt-1">{filter.description}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
