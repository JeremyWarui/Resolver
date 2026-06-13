import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { UserStatsCards } from '@/components/shared/data/StatCards';
import { TicketCreationWizard } from '@/components/shared/ticket/TicketCreationWizard';
import { TicketDetailModal } from '@/components/shared/ticket/TicketDetailModal';
import QuickActions, { type QuickActionCategory, type QuickActionItem } from './QuickActions';
import { RecentTicketsCard } from './RecentTicketsCard';
import { useAuthStore } from '@/stores/authStore';
import { useUserDashboard } from '@/hooks/dashboard';
import { useTickets } from '@/hooks/tickets';

interface UserDashboardProps {
  onNavigate?: (section: 'dashboard' | 'userTickets' | 'submitTicket' | 'settings') => void;
}

type QuickStart = {
  departmentCode?: string;
  category?: QuickActionCategory;
  item?: QuickActionItem;
} | undefined;

const UserDashboard = ({ onNavigate }: UserDashboardProps) => {
  const queryClient = useQueryClient();
  const userData = useAuthStore((s) => s.user);
  const { loading: dashLoading, refetch } = useUserDashboard();
  const { tickets: recentTickets } = useTickets({ mine: 1, page_size: 5 });

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [quickStart, setQuickStart] = useState<QuickStart>(undefined);

  const welcomeName = [userData?.first_name, userData?.last_name].filter(Boolean).join(' ') ||
    userData?.username ||
    'User';

  useEffect(() => {
    refetch();
  }, [refetch]);

  function handleServiceSelect(ctx: {
    sectionTypeId: number;
    departmentCode: string;
    category?: QuickActionCategory;
    item?: QuickActionItem;
  }) {
    setQuickStart({
      departmentCode: ctx.departmentCode,
      category: ctx.category,
      item: ctx.item,
    });
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
          <p className="text-sm text-muted-foreground">Welcome back, {welcomeName}</p>
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
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
        }}
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
