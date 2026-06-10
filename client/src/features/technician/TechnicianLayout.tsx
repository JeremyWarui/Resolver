import { useState } from 'react';
import ComingSoonSection from '@/components/shared/ComingSoonSection';
import { RoleLayout } from '@/components/layout/RoleLayout';
import TechTicketsPage from './TechTicketsPage';
import TechSectionTickets from './TechSectionTickets';
import TechnicianReportsPage from './TechnicianReportsPage';
import { TicketDetailPage } from '@/app/dashboard/tickets/TicketDetailPage';
import { useAuthStore } from '@/stores/authStore';
import { useTechnicianDashboard } from '@/hooks/dashboard';

const TechnicianLayoutContent = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const userData = useAuthStore((s) => s.user);
  const { loading: dashboardLoading } = useTechnicianDashboard();

  const headerTitle: Record<string, string> = {
    dashboard: 'Section Tickets',
    assignedTickets: 'Assigned Tickets',
    report: 'Reports',
    settings: 'Settings',
  };
  const displayTitle = selectedTicketId !== null ? 'Ticket Detail' : (headerTitle[activeSection] ?? 'Dashboard');

  return (
    <RoleLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role={userData?.role || 'technician'}
      title={displayTitle}
      currentUser={userData}
      loading={dashboardLoading}
    >
      <>
        {activeSection === 'dashboard' && (
          <TechSectionTickets
            currentTechnicianId={userData?.id}
            onTicketSelect={setSelectedTicketId}
          />
        )}
        {activeSection === 'assignedTickets' && (
          <TechTicketsPage userData={userData} onTicketSelect={setSelectedTicketId} />
        )}
        {activeSection === 'report' && <TechnicianReportsPage />}
        {activeSection === 'settings' && <ComingSoonSection section='Settings' />}
      </>

      <TicketDetailPage
        open={selectedTicketId !== null}
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </RoleLayout>
  );
};

const TechnicianLayout = () => <TechnicianLayoutContent />;

export default TechnicianLayout;
