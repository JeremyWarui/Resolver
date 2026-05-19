import { useState } from 'react';
import ComingSoonSection from '@/components/Common/ComingSoonSection';
import { RoleLayout } from '@/components/Common/RoleLayout';
import SectionHeadDashboard from './SectionHeadDashboard';
import SectionHeadTickets from './SectionHeadTickets';
import SectionHeadTechnicians from './SectionHeadTechnicians';
import { useCurrentUser } from '@/contexts/UserDataContext';
import {
  SectionHeadDashboardProvider,
  useSectionHeadDashboard,
} from '@/contexts/SectionHeadDashboardContext';

const SectionHeadLayoutContent = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const { userData, loading: userLoading } = useCurrentUser();
  const { loading: dashboardLoading } = useSectionHeadDashboard();

  const headerTitle: Record<string, string> = {
    dashboard: 'Dashboard',
    tickets: 'Section Tickets',
    technicians: 'Technicians',
    reports: 'Reports',
    settings: 'Settings',
  };

  const isLoading = userLoading || dashboardLoading;

  return (
    <RoleLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role={userData?.role || 'head_of_section'}
      title={headerTitle[activeSection]}
      currentUser={userData}
      loading={isLoading}
    >
      {activeSection === 'dashboard' && <SectionHeadDashboard />}
      {activeSection === 'tickets' && <SectionHeadTickets userId={userData?.id} />}
      {activeSection === 'technicians' && <SectionHeadTechnicians />}
      {activeSection === 'reports' && <ComingSoonSection section="Reports" />}
      {activeSection === 'settings' && <ComingSoonSection section="Settings" />}
    </RoleLayout>
  );
};

const SectionHeadLayout = () => (
  <SectionHeadDashboardProvider>
    <SectionHeadLayoutContent />
  </SectionHeadDashboardProvider>
);

export default SectionHeadLayout;
