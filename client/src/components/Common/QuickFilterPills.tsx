import { Button } from '@/components/ui/button';
import type { ComponentType } from 'react';

export interface FilterPill {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  colorClass: string;
}

interface QuickFilterPillsProps {
  filters: readonly FilterPill[];
  activeFilter: string;
  onFilterChange: (id: string) => void;
  className?: string;
}

const QuickFilterPills = ({
  filters,
  activeFilter,
  onFilterChange,
  className = '',
}: QuickFilterPillsProps) => (
  <div className={`flex items-center gap-2 flex-wrap mb-4 ${className}`}>
    {filters.map(({ id, label, icon: Icon, colorClass }) => {
      const isActive = activeFilter === id;
      return (
        <Button
          key={id}
          variant={isActive ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(id)}
          className={`flex items-center gap-2 py-3 transition-all
            ${!isActive ? colorClass : ''}
            ${isActive ? 'bg-[#0078d4] hover:bg-[#106ebe] text-white' : ''}`}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Button>
      );
    })}
  </div>
);

export default QuickFilterPills;
