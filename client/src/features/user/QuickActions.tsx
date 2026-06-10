import { useState, useMemo, useEffect } from 'react';
import {
  ChevronDown, ChevronUp,
  Laptop, Wrench, Users, Shield, Truck, Receipt, Layers,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api/client';
import type { ServiceCategory, ServiceItem } from '@/types/catalogue';

// ── Backend shape for /section-types/ ───────────────────────────────────────

interface CatalogueSectionType {
  id: number;
  name: string;
  code: string;
  department_id: number;
  department_code: string;
  department_name: string;
  service_categories: ServiceCategory[];
}

// ── Color theme — keyed on department code / name ─────────────────────────────

interface CategoryTheme {
  color: string;
  lightBg: string;
  icon: React.ElementType;
}


function getDeptTheme(deptCode: string, deptName?: string): CategoryTheme {
  const key = `${deptCode} ${deptName ?? ''}`.toLowerCase();
  if (/^ict|tech|\bit\b|comput|digital/.test(key))
    return { color: '#185FA5', lightBg: 'bg-blue-100 dark:bg-blue-950/50', icon: Laptop };
  if (/^adm|maint|facilit|admin/.test(key))
    return { color: '#854F0B', lightBg: 'bg-amber-100 dark:bg-amber-950/50', icon: Building2 };
  if (/^hr|human|payroll|staff|leave|welfare/.test(key))
    return { color: '#3B6D11', lightBg: 'bg-green-100 dark:bg-green-950/50', icon: Users };
  if (/secur|access|guard|incident/.test(key))
    return { color: '#A32D2D', lightBg: 'bg-red-100 dark:bg-red-950/50', icon: Shield };
  if (/transport|travel|vehic|car|fleet/.test(key))
    return { color: '#5F5E5A', lightBg: 'bg-stone-200 dark:bg-stone-700/50', icon: Truck };
  if (/finance|financ|payment|account|invoic|reimburse/.test(key))
    return { color: '#534AB7', lightBg: 'bg-violet-100 dark:bg-violet-950/50', icon: Receipt };
  return { color: '#6B7280', lightBg: 'bg-gray-100 dark:bg-gray-800/50', icon: Layers };
}

function getCatTheme(cat: ServiceCategory): CategoryTheme {
  const key = `${cat.section_type_name} ${cat.name} ${cat.icon ?? ''}`.toLowerCase();
  if (/ict|tech|\bit\b|comput|digital|network|internet|erp|software/.test(key))
    return { color: '#185FA5', lightBg: 'bg-blue-100 dark:bg-blue-950/50', icon: Laptop };
  if (/maint|facilit|plumb|electr|clean|build|repair/.test(key))
    return { color: '#854F0B', lightBg: 'bg-amber-100 dark:bg-amber-950/50', icon: Wrench };
  if (/\bhr\b|human|payroll|staff|leave|welfare|registry/.test(key))
    return { color: '#3B6D11', lightBg: 'bg-green-100 dark:bg-green-950/50', icon: Users };
  if (/secur|access|guard|incident/.test(key))
    return { color: '#A32D2D', lightBg: 'bg-red-100 dark:bg-red-950/50', icon: Shield };
  if (/transport|travel|vehic|car|fleet/.test(key))
    return { color: '#5F5E5A', lightBg: 'bg-stone-200 dark:bg-stone-700/50', icon: Truck };
  if (/finance|financ|payment|account|invoic|reimburse/.test(key))
    return { color: '#534AB7', lightBg: 'bg-violet-100 dark:bg-violet-950/50', icon: Receipt };
  return { color: '#6B7280', lightBg: 'bg-gray-100 dark:bg-gray-800/50', icon: Layers };
}


// ── Types ─────────────────────────────────────────────────────────────────────

interface QuickActionsProps {
  onServiceSelect: (ctx: {
    sectionTypeId: number;
    departmentCode: string;
    category?: ServiceCategory;
    item?: ServiceItem;
  }) => void;
}

interface DeptGroup {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  theme: CategoryTheme;
  entries: Array<{ sectionTypeId: number; category: ServiceCategory }>;
}

// ── DepartmentBox ─────────────────────────────────────────────────────────────

interface DepartmentBoxProps {
  group: DeptGroup;
  onServiceSelect: QuickActionsProps['onServiceSelect'];
}


const VISIBLE_CAT_LIMIT = 4;

function DepartmentBox({ group, onServiceSelect }: DepartmentBoxProps) {
  const [expanded, setExpanded] = useState(false);
  const { theme, departmentName, departmentCode, entries } = group;
  const DeptIcon = theme.icon;

  const visible = expanded ? entries : entries.slice(0, VISIBLE_CAT_LIMIT);
  const hasMore = entries.length > VISIBLE_CAT_LIMIT;

  const firstSectionTypeId = entries[0]?.sectionTypeId ?? 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0', theme.lightBg)}>
          <DeptIcon className="h-3.5 w-3.5" style={{ color: theme.color }} />
        </div>
        <span className="text-[13px] font-semibold text-foreground flex-1 leading-tight">
          {departmentName}
        </span>
        <button
          type="button"
          onClick={() => onServiceSelect({ sectionTypeId: firstSectionTypeId, departmentCode })}
          className="text-xs font-medium hover:underline whitespace-nowrap text-muted-foreground hover:text-foreground"
        >
          View All →
        </button>
      </div>

      <Separator className="my-3" />

      {/* Category square-tile grid */}
      <div className="grid grid-cols-2 gap-2">
        {visible.map(({ sectionTypeId, category: cat }) => {
          const catTheme = getCatTheme(cat);
          const CatIcon = catTheme.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onServiceSelect({ sectionTypeId, departmentCode, category: cat })}
              className="aspect-square border border-border bg-background rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 hover:border-border/80 transition-all text-center group"
            >
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', catTheme.lightBg)}>
                <CatIcon className="h-4 w-4" style={{ color: catTheme.color }} />
              </div>
              <span className="text-[11px] font-medium text-card-foreground leading-snug w-full">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* See More / See Less toggle */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="mt-3 self-start text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3" /> See Less</>
          ) : (
            <><ChevronDown className="h-3 w-3" /> See {entries.length - VISIBLE_CAT_LIMIT} More</>
          )}
        </button>
      )}
    </div>
  );
}

// ── QuickActions ──────────────────────────────────────────────────────────────

const QuickActions = ({ onServiceSelect }: QuickActionsProps) => {
  const [sectionTypes, setSectionTypes] = useState<CatalogueSectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<CatalogueSectionType[]>('/section-types/');
        if (cancelled) return;
        const data = Array.isArray(res.data) ? res.data : (res.data as { results?: CatalogueSectionType[] })?.results ?? [];
        setSectionTypes(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load services');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Group section types by department_id → one box per department
  const deptGroups = useMemo<DeptGroup[]>(() => {
    const groupMap = new Map<number, DeptGroup>();

    for (const st of sectionTypes) {
      const activeCategories = (st.service_categories ?? []).filter(c => c.is_active);
      if (activeCategories.length === 0) continue;

      const entries = activeCategories.map(cat => ({ sectionTypeId: st.id, category: cat }));
      const existing = groupMap.get(st.department_id);

      if (existing) {
        existing.entries.push(...entries);
      } else {
        groupMap.set(st.department_id, {
          departmentId: st.department_id,
          departmentCode: st.department_code,
          departmentName: st.department_name || st.department_code,
          theme: getDeptTheme(st.department_code, st.department_name),
          entries,
        });
      }
    }

    return Array.from(groupMap.values());
  }, [sectionTypes]);

  // ── Loading skeleton ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(j => <Skeleton key={j} className="h-9 rounded-lg" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
        <AlertCircle className="h-8 w-8 text-destructive opacity-60" />
        <p className="text-sm font-medium text-destructive">Could not load services</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (deptGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
        <Wrench className="h-8 w-8 opacity-20" />
        <p className="text-sm">No services available yet.</p>
        <p className="text-xs opacity-70">Contact your administrator to set up the service catalogue.</p>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {deptGroups.map(group => (
          <DepartmentBox key={group.departmentId} group={group} onServiceSelect={onServiceSelect} />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
