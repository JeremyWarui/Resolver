import { useState } from 'react';
import ComingSoonSection from '@/components/Common/ComingSoonSection';
import { RoleLayout } from '@/components/Common/RoleLayout';
import ManagerDashboard from './ManagerDashboard';
import ManagerTickets from './ManagerTickets';
import ManagerAnalytics from './ManagerAnalytics';
import { useCurrentUser } from '@/contexts/UserDataContext';
import { ManagerDashboardProvider } from '@/contexts/ManagerDashboardContext';

const ManagerLayoutContent = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const { userData, loading: userLoading } = useCurrentUser();

  const headerTitle: Record<string, string> = {
    dashboard: 'Dashboard',
    tickets: 'Department Tickets',
    reports: 'Analytics',
    settings: 'Settings',
  };

  return (
    <RoleLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role={userData?.role || 'manager'}
      title={headerTitle[activeSection]}
      currentUser={userData}
      loading={userLoading}
    >
      {activeSection === 'dashboard' && <ManagerDashboard />}
      {activeSection === 'tickets' && <ManagerTickets userId={userData?.id} />}
      {activeSection === 'reports' && <ManagerAnalytics />}
      {activeSection === 'settings' && <ComingSoonSection section="Settings" />}
    </RoleLayout>
  );
};

const ManagerLayout = () => (
  <ManagerDashboardProvider>
    <ManagerLayoutContent />
  </ManagerDashboardProvider>
);

export default ManagerLayout;
