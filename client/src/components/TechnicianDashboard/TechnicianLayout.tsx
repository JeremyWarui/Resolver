import { useState } from 'react';
import ComingSoonSection from '../Common/ComingSoonSection';
import { RoleLayout } from '../Common/RoleLayout';
import TechTicketsPage from './TechTicketsPage';
import TechSectionTickets from './TechSectionTickets';
import TechReport from './TechReport';
import { useCurrentUser } from '@/contexts/UserDataContext';
import { TechnicianDashboardProvider, useTechDashboard } from '@/contexts/TechnicianDashboardContext';

const TechnicianLayoutContent = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  // Fetch current user data
  const { userData, loading: userLoading } = useCurrentUser();

  // Fetch dashboard data
  const { loading: dashboardLoading } = useTechDashboard();

  const headerTitle: Record<string, string> = {
    dashboard: 'Section Tickets',
    assignedTickets: 'Assigned Tickets',
    report: 'Reports',
    settings: 'Settings',
  };

  const isLoading = userLoading || dashboardLoading;

  return (
    <RoleLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role={userData?.role || 'technician'}
      title={headerTitle[activeSection]}
      currentUser={userData}
      loading={isLoading}
    >
      {activeSection === 'dashboard' && <TechSectionTickets currentTechnicianId={userData?.id} />}
      {activeSection === 'assignedTickets' && <TechTicketsPage userData={userData} />}
      {activeSection === 'report' && <TechReport />}
      {activeSection === 'settings' && (
        <ComingSoonSection section='Settings' />
      )}
    </RoleLayout>
  );
};

const TechnicianLayout = () => {
  return (
    <TechnicianDashboardProvider>
      <TechnicianLayoutContent />
    </TechnicianDashboardProvider>
  );
};

export default TechnicianLayout;
