import { useState } from 'react';
import ComingSoonSection from '@/components/Common/ComingSoonSection';
import { RoleLayout } from '@/components/Common/RoleLayout';
import HODDashboard from './HODDashboard';
import HODTickets from './HODTickets';
import HODTechnicians from './HODTechnicians';
import HODSections from './HODSections';
import { useCurrentUser } from '@/contexts/UserDataContext';
import { HODDashboardProvider } from '@/contexts/HODDashboardContext';

const HODLayoutContent = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const { userData, loading: userLoading } = useCurrentUser();

  const headerTitle: Record<string, string> = {
    dashboard: 'Dashboard',
    tickets: 'Campus Tickets',
    technicians: 'Technicians',
    sections: 'Sections',
    reports: 'Reports',
    settings: 'Settings',
  };

  return (
    <RoleLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role={userData?.role || 'hod'}
      title={headerTitle[activeSection]}
      currentUser={userData}
      loading={userLoading}
    >
      {activeSection === 'dashboard' && <HODDashboard />}
      {activeSection === 'tickets' && <HODTickets userId={userData?.id} />}
      {activeSection === 'technicians' && <HODTechnicians />}
      {activeSection === 'sections' && <HODSections />}
      {activeSection === 'reports' && <ComingSoonSection section="Reports" />}
      {activeSection === 'settings' && <ComingSoonSection section="Settings" />}
    </RoleLayout>
  );
};

const HODLayout = () => (
  <HODDashboardProvider>
    <HODLayoutContent />
  </HODDashboardProvider>
);

export default HODLayout;
