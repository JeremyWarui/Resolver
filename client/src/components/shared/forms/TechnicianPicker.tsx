// TechnicianPicker — enhanced technician selector with workload indicator.
// Extends TechnicianSelect with an optional active ticket count per technician.
// When activeTicketCounts is provided, a workload bar renders below each name.

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Technician } from '@/types';

interface TechnicianPickerProps {
  value: number | null | undefined;
  onValueChange: (value: number | null) => void;
  technicians: Technician[];
  activeTicketCounts?: Record<number, number>; // technicianId → count
  maxWorkload?: number;                         // denominator for workload bar (default 10)
  disabled?: boolean;
  placeholder?: string;
  includeUnassigned?: boolean;
  className?: string;
}

function WorkloadBar({ count, max }: { count: number; max: number }) {
  const pct = Math.min((count / max) * 100, 100);
  const color =
    pct >= 80 ? 'var(--sla-breach)' : pct >= 50 ? 'var(--sla-warning)' : 'var(--sla-ok)';

  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground w-6 text-right">{count}</span>
    </div>
  );
}

export function TechnicianPicker({
  value,
  onValueChange,
  technicians,
  activeTicketCounts,
  maxWorkload = 10,
  disabled = false,
  placeholder = 'Select technician',
  includeUnassigned = true,
  className,
}: TechnicianPickerProps) {
  const handleChange = (val: string) => {
    onValueChange(val === 'unassigned' ? null : Number(val));
  };

  return (
    <Select
      value={value?.toString() ?? (includeUnassigned ? 'unassigned' : '')}
      onValueChange={handleChange}
      disabled={disabled || technicians.length === 0}
    >
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder={technicians.length === 0 ? 'No technicians available' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeUnassigned && (
          <SelectItem value="unassigned">Unassigned</SelectItem>
        )}
        {technicians.map((tech) => {
          const count = activeTicketCounts?.[tech.id];
          const label = tech.name ?? `${tech.first_name} ${tech.last_name}`;
          return (
            <SelectItem key={tech.id} value={String(tech.id)}>
              <div className="w-full min-w-[180px]">
                <span className="text-sm">{label}</span>
                {count !== undefined && (
                  <WorkloadBar count={count} max={maxWorkload} />
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
