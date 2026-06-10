import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserStatsCards } from '@/components/shared/data/StatCards';
import { TicketCreationWizard } from '@/components/shared/ticket/TicketCreationWizard';
import { TicketDetailModal } from '@/components/shared/ticket/TicketDetailModal';
import QuickActions from './QuickActions';
import { RecentTicketsCard } from './RecentTicketsCard';
import { useAuthStore } from '@/stores/authStore';
import { useUserDashboard } from '@/hooks/dashboard';
import { useTickets } from '@/hooks/tickets';
import organizationsService from '@/lib/api/organizations';
import type { Department } from '@/types';
import type { ServiceCategory, ServiceItem } from '@/types/catalogue';

interface UserDashboardProps {
  onNavigate?: (section: 'dashboard' | 'userTickets' | 'submitTicket' | 'settings') => void;
}

const UserDashboard = ({ onNavigate }: UserDashboardProps) => {
  const userData = useAuthStore((s) => s.user);
  const { loading: dashLoading, refetch } = useUserDashboard();
  const { tickets: recentTickets } = useTickets({ mine: 1, page_size: 5 });

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [quickStart, setQuickStart] = useState<
    { department: Department; category?: ServiceCategory; item?: ServiceItem } | undefined
  >();

  const welcomeName = [userData?.first_name, userData?.last_name].filter(Boolean).join(' ') ||
    userData?.username ||
    'User';

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    (async () => {
      try {
        const campusId = userData?.primary_campus_id;
        const deptRes = await organizationsService.getDepartments(
          campusId ? { campus: campusId } : undefined,
        );
        setDepartments(Array.isArray(deptRes) ? deptRes : []);
      } catch {
        // silent — wizard opens at step 1 if dept lookup fails
      }
    })();
  }, [userData?.primary_campus_id]);

  function handleServiceSelect(ctx: { sectionTypeId: number; departmentCode: string; category?: ServiceCategory; item?: ServiceItem }) {
    const dept = departments.find(d => d.code === ctx.departmentCode);
    if (!dept) {
      setQuickStart(undefined);
    } else if (ctx.category) {
      setQuickStart({ department: dept, category: ctx.category, item: ctx.item });
    } else {
      setQuickStart({ department: dept });
    }
    setWizardOpen(true);
  }

  function handleWizardOpenChange(open: boolean) {
    setWizardOpen(open);
    if (!open) setQuickStart(undefined);
  }

  function handleTicketClick(id: number) {
    setSelectedTicketId(id);
    setDetailOpen(true);
  }

  return (
    <main className="flex-1 overflow-y-auto bg-muted/30">
      {/* ── Section 1: Header + Greeting + KPI Stats ── */}
      <div className="px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {welcomeName}</p>
          </div>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => { setQuickStart(undefined); setWizardOpen(true); }}
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
        <UserStatsCards />
      </div>

      {/* ── Section 2: Quick Actions (left) + Recent Activity (right) ── */}
      <div className="p-6 flex gap-6 min-h-0">

        {/* Left column: Quick Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Quick Requests</h2>
            <span className="text-xs text-muted-foreground">
              Select a service to raise a request
            </span>
          </div>
          <QuickActions onServiceSelect={handleServiceSelect} />
        </div>

        {/* Right column: Recent Activity (fixed 320px) */}
        <div className="w-80 flex-shrink-0">
          <RecentTicketsCard
            tickets={recentTickets}
            loading={dashLoading}
            onTicketClick={handleTicketClick}
            onViewAll={() => onNavigate?.('userTickets')}
          />
        </div>
      </div>

      <TicketCreationWizard
        isOpen={wizardOpen}
        onOpenChange={handleWizardOpenChange}
        onSuccess={() => refetch()}
        quickStart={quickStart}
      />

      <TicketDetailModal
        ticketId={selectedTicketId}
        isOpen={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedTicketId(null);
        }}
      />
    </main>
  );
};

export default UserDashboard;
