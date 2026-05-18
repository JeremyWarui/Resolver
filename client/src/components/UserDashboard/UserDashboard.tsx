import { useEffect, useState, useMemo } from 'react';
import {
  Plus, Clock, CheckCircle, AlertTriangle, ChevronRight,
  Wifi, Mail, Monitor, Database, Phone,
  Droplets, Hammer, Zap, Car, Shield, Paintbrush, Layers,
  CalendarDays, Receipt, FolderOpen, FileText, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import UserStatsCards from '@/components/Common/UserStatsCards';
import { TicketCreationWizard } from '@/components/shared/TicketCreationWizard';
import { useCurrentUser } from '@/contexts/UserDataContext';
import { useUserDashboard } from '@/contexts/UserDashboardContext';
import apiClient from '@/api/client';
import type { Ticket, Department } from '@/types';
import type { ServiceCategory } from '@/types/catalogue';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  assigned: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

function daysAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

// ── Icon map for category names ───────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Network Services':       <Wifi className="h-5 w-5" />,
  'Telephone Services':     <Phone className="h-5 w-5" />,
  'Email Services':         <Mail className="h-5 w-5" />,
  'Software Services':      <Monitor className="h-5 w-5" />,
  'Device Services':        <Monitor className="h-5 w-5" />,
  'ERP Services':           <Database className="h-5 w-5" />,
  'Network Infrastructure': <Wifi className="h-5 w-5" />,
  'Plumbing Services':      <Droplets className="h-5 w-5" />,
  'Carpentry Services':     <Hammer className="h-5 w-5" />,
  'Electrical Services':    <Zap className="h-5 w-5" />,
  'Masonry Services':       <Layers className="h-5 w-5" />,
  'Painting Services':      <Paintbrush className="h-5 w-5" />,
  'Transport Services':     <Car className="h-5 w-5" />,
  'Security Services':      <Shield className="h-5 w-5" />,
  'Maintenance Requests':   <Hammer className="h-5 w-5" />,
  'Leave Services':         <CalendarDays className="h-5 w-5" />,
  'Payroll Services':       <Receipt className="h-5 w-5" />,
  'Registry Services':      <FolderOpen className="h-5 w-5" />,
  'HR Services':            <FileText className="h-5 w-5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'ICT Support': 'bg-blue-50 text-blue-600 border-blue-100',
  'Networks':    'bg-indigo-50 text-indigo-600 border-indigo-100',
  'Maintenance': 'bg-orange-50 text-orange-600 border-orange-100',
  'HR Operations':'bg-green-50 text-green-600 border-green-100',
};

// ── Priority order within each department (first 4 shown, rest in "more") ────
const DEPT_PRIORITY: Record<number, string[]> = {
  2: ['Electrical Services', 'Plumbing Services', 'Carpentry Services', 'Transport Services',
      'Security Services', 'Masonry Services', 'Painting Services', 'Maintenance Requests'],
  1: ['Network Services', 'Email Services', 'Software Services', 'ERP Services',
      'Device Services', 'Telephone Services', 'Network Infrastructure'],
  3: ['Leave Services', 'Payroll Services', 'Registry Services', 'HR Services'],
};

// Outer column order: Administration, ICT, HR
const DEPT_COLUMN_ORDER = [2, 1, 3];

// ── SectionType → Department map (for quickStart pre-fill) ───────────────────
interface SectionTypeWithDept {
  id: number;
  name: string;
  department_id: number;
  department_code: string;
  service_categories: ServiceCategory[];
}

interface UserDashboardProps {
  onNavigate?: (section: 'dashboard' | 'userTickets' | 'submitTicket' | 'settings') => void;
}

// ── Main Component ────────────────────────────────────────────────────────────
const UserDashboard = ({ onNavigate }: UserDashboardProps) => {
  const { userData, loading: userLoading } = useCurrentUser();
  const { refetch } = useUserDashboard();

  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [resolvedNoFeedback, setResolvedNoFeedback] = useState<Ticket[]>([]);
  const [sectionTypes, setSectionTypes] = useState<SectionTypeWithDept[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [quickStart, setQuickStart] = useState<{ department: Department; category: ServiceCategory } | undefined>();

  const welcomeName = userLoading
    ? '...'
    : [userData?.first_name, userData?.last_name].filter(Boolean).join(' ') || userData?.username || 'User';

  // Fetch active + resolved tickets
  useEffect(() => {
    refetch();
    (async () => {
      setTicketsLoading(true);
      try {
        // Fetch recent tickets — backend scopes to current user automatically.
        // Filter by status client-side since the API doesn't support multi-value status.
        const res = await apiClient.get('/tickets/', {
          params: { page_size: 20, ordering: '-updated_at' },
        });
        const all: Ticket[] = res.data.results ?? res.data ?? [];
        const ACTIVE = new Set(['open', 'assigned', 'in_progress', 'pending']);
        const RESOLVED = new Set(['resolved', 'closed']);
        setActiveTickets(all.filter(t => ACTIVE.has(t.status)).slice(0, 5));
        setResolvedNoFeedback(
          all.filter(t => RESOLVED.has(t.status) && !(t as any).feedback).slice(0, 5)
        );
      } catch { /* silent */ }
      finally { setTicketsLoading(false); }
    })();
  }, [refetch]);

  // Fetch section types + departments for quick requests
  useEffect(() => {
    (async () => {
      setCatsLoading(true);
      try {
        const campusId = userData?.primary_campus_id;
        const [stRes, deptRes] = await Promise.all([
          apiClient.get('/service-catalogue/section-types/'),
          apiClient.get('/departments/', { params: campusId ? { campus: campusId } : undefined }),
        ]);
        setSectionTypes(stRes.data ?? []);
        const deptData = deptRes.data;
        setDepartments(Array.isArray(deptData) ? deptData : deptData.results ?? []);
      } catch { /* silent */ }
      finally { setCatsLoading(false); }
    })();
  }, [userData?.primary_campus_id]);

  // Build per-department category list, ordered by priority
  const deptCategoryMap = useMemo(() => {
    const map: Record<number, { category: ServiceCategory; sectionType: SectionTypeWithDept }[]> = {};
    for (const st of sectionTypes) {
      const deptId = st.department_id;
      if (!map[deptId]) map[deptId] = [];
      for (const cat of st.service_categories) {
        if (cat.is_active && cat.service_items.length > 0) {
          map[deptId].push({ category: cat, sectionType: st });
        }
      }
    }
    // Sort each department's categories by priority list
    for (const deptId of Object.keys(map)) {
      const priority = DEPT_PRIORITY[Number(deptId)] ?? [];
      map[Number(deptId)].sort((a, b) => {
        const ai = priority.indexOf(a.category.name);
        const bi = priority.indexOf(b.category.name);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
    }
    return map;
  }, [sectionTypes]);

  // Track which department columns are expanded (show all vs top 4)
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set());
  function toggleExpand(deptId: number) {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      next.has(deptId) ? next.delete(deptId) : next.add(deptId);
      return next;
    });
  }

  function handleQuickRequest(cat: ServiceCategory, st: SectionTypeWithDept) {
    const dept = departments.find(d => d.id === st.department_id);
    if (!dept) { setWizardOpen(true); setQuickStart(undefined); return; }
    setQuickStart({ department: dept, category: cat });
    setWizardOpen(true);
  }

  function handleWizardOpen(open: boolean) {
    setWizardOpen(open);
    if (!open) setQuickStart(undefined);
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back, {welcomeName} 👋</p>
        </div>
        <Button
          size="sm"
          className="flex items-center gap-1 bg-[#0078d4] hover:bg-[#106ebe]"
          onClick={() => { setQuickStart(undefined); setWizardOpen(true); }}
        >
          <Plus className="h-4 w-4" /> New Ticket
        </Button>
      </div>

      {/* Stat cards */}
      <UserStatsCards />

      {/* ── Awaiting feedback ── */}
      {!ticketsLoading && resolvedNoFeedback.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-medium text-amber-800">
              {resolvedNoFeedback.length} resolved ticket{resolvedNoFeedback.length > 1 ? 's' : ''} awaiting your feedback
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {resolvedNoFeedback.map(t => (
              <button
                key={t.id}
                onClick={() => onNavigate?.('userTickets')}
                className="text-xs bg-white border border-amber-200 rounded px-2 py-1 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                {t.ticket_no} — {t.title.slice(0, 30)}{t.title.length > 30 ? '…' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Requests ── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">Quick Requests</h2>
          <span className="text-xs text-gray-400">Select a service to raise a request</span>
        </div>

        {catsLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(col => (
              <div key={col} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <div className="grid grid-cols-2 gap-2">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEPT_COLUMN_ORDER.map(deptId => {
              const tiles = deptCategoryMap[deptId] ?? [];
              if (tiles.length === 0) return null;
              const dept = departments.find(d => d.id === deptId);
              const isExpanded = expandedDepts.has(deptId);
              const visible = isExpanded ? tiles : tiles.slice(0, 4);
              const hiddenCount = tiles.length - 4;

              // Department column header color
              const headerColors: Record<number, string> = {
                2: 'text-orange-600',
                1: 'text-blue-600',
                3: 'text-green-600',
              };

              return (
                <div key={deptId} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Department label */}
                  <p className={`text-sm font-semibold uppercase tracking-wider text-center py-3 border-b border-gray-200 bg-white ${headerColors[deptId] ?? 'text-gray-500'}`}>
                    {dept?.name ?? '—'}
                  </p>

                  {/* 2-column inner grid of category tiles */}
                  <div className="grid grid-cols-2 gap-3 p-3">
                    {visible.map(({ category, sectionType }) => {
                      const icon = CATEGORY_ICONS[category.name] ?? <AlertTriangle className="h-5 w-5" />;
                      const tileColors: Record<number, string> = {
                        2: 'bg-orange-50 hover:bg-orange-100 text-orange-700',
                        1: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
                        3: 'bg-green-50 hover:bg-green-100 text-green-700',
                      };
                      const tileColor = tileColors[deptId] ?? 'bg-gray-50 hover:bg-gray-100 text-gray-600';
                      const shortName = category.name.replace(' Services', '').replace(' Requests', '');

                      return (
                        <button
                          key={category.id}
                          onClick={() => handleQuickRequest(category, sectionType)}
                          className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 text-center transition-all hover:shadow-md active:scale-95 ${tileColor}`}
                        >
                          <span className="opacity-80 [&>svg]:h-6 [&>svg]:w-6">{icon}</span>
                          <span className="text-xs font-semibold leading-tight">{shortName}</span>
                          <span className="text-[11px] opacity-50">
                            {category.service_items.length} option{category.service_items.length !== 1 ? 's' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* More / Less toggle */}
                  {hiddenCount > 0 && (
                    <button
                      onClick={() => toggleExpand(deptId)}
                      className="w-full text-xs text-gray-400 hover:text-gray-600 text-center py-2 border-t border-gray-100 transition-colors"
                    >
                      {isExpanded ? '▲ Show less' : `▼ ${hiddenCount} more service${hiddenCount > 1 ? 's' : ''}…`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Active Requests ── */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-800">My Active Requests</h2>
          <button
            onClick={() => onNavigate?.('userTickets')}
            className="text-xs text-[#0078d4] flex items-center gap-0.5 hover:underline"
          >
            View all <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {ticketsLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
          </div>
        ) : activeTickets.length === 0 ? (
          <div className="bg-white border border-dashed rounded-lg p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No active requests — all clear!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeTickets.map(t => (
              <div
                key={t.id}
                onClick={() => onNavigate?.('userTickets')}
                className="bg-white border rounded-lg px-5 py-4 flex items-center justify-between cursor-pointer hover:border-[#0078d4]/30 hover:shadow-sm transition-all"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.ticket_no}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {t.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {daysAgo(t.updated_at ?? t.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wizard */}
      <TicketCreationWizard
        isOpen={wizardOpen}
        onOpenChange={handleWizardOpen}
        onSuccess={() => { refetch(); setActiveTickets([]); }}
        quickStart={quickStart}
      />
    </main>
  );
};

export default UserDashboard;
