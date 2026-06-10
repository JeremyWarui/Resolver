// FilterPanel — collapsible advanced filters drawer.
// The `available` prop hides facets that are irrelevant for the current role/view.

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { TicketFilters } from '@/types';

interface FilterPanelAvailable {
  priority?: boolean;
  assignee?: boolean;
  dateRange?: boolean;
  department?: boolean;
  overdue?: boolean;
}

interface FilterPanelProps {
  filters: TicketFilters;
  onChange: (updates: Partial<TicketFilters>) => void;
  available?: FilterPanelAvailable;
  className?: string;
}

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function FilterPanel({ filters, onChange, available = {}, className }: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    filters.priority,
    filters.assigneeId,
    filters.dateFrom,
    filters.dateTo,
    filters.overdue,
  ].filter(Boolean).length;

  const handleReset = () => {
    onChange({ priority: undefined, assigneeId: undefined, dateFrom: undefined, dateTo: undefined, overdue: undefined });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2', className)}>
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs gap-1">
                <X className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {available.priority !== false && (
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={filters.priority ?? 'all'}
                onValueChange={(v) => onChange({ priority: v === 'all' ? undefined : v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {available.overdue && (
            <div className="space-y-2">
              <Label>SLA</Label>
              <Select
                value={filters.overdue ? 'overdue' : 'all'}
                onValueChange={(v) => onChange({ overdue: v === 'overdue' ? true : undefined })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tickets</SelectItem>
                  <SelectItem value="overdue">Overdue only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {available.dateRange && (
            <div className="space-y-2">
              <Label>Date range</Label>
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  value={filters.dateFrom ?? ''}
                  onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                />
                <input
                  type="date"
                  value={filters.dateTo ?? ''}
                  onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
