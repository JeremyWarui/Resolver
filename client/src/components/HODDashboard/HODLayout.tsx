import { useState } from 'react';
import HODSideBar, { type HODSection } from './HODSideBar';
import Header from '@/components/Common/Header';
import FullScreenLoading from '@/components/Common/FullScreenLoading';
import HODDashboard from './HODDashboard';
import HODTickets from './HODTickets';
import HODTechnicians from './HODTechnicians';
import HODSections from './HODSections';
import { useCurrentUser } from '@/contexts/UserDataContext';
import { HODDashboardProvider } from '@/contexts/HODDashboardContext';

function ComingSoon({ section }: { section: string }) {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{section} Coming Soon</h2>
        <p className="text-gray-600 mb-6">
          We're currently working on this feature. It will be available in a future update.
        </p>
        <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
          <div className="bg-[#0078d4] h-2 rounded-full w-3/4" />
        </div>
        <p className="text-sm text-gray-500">Development in progress: 75% complete</p>
      </div>
    </div>
  );
}

const HODLayoutContent = () => {
  const [activeSection, setActiveSection] = useState<HODSection>('dashboard');
  const { userData, loading: userLoading } = useCurrentUser();

  const headerTitle: Record<HODSection, string> = {
    dashboard: 'Dashboard',
    tickets: 'Campus Tickets',
    technicians: 'Technicians',
    sections: 'Sections',
    reports: 'Reports',
    settings: 'Settings',
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {userLoading && <FullScreenLoading message="Loading your dashboard..." />}
      <HODSideBar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={headerTitle[activeSection]}
          searchPlaceholder="Search..."
          currentUser={userData}
          onSearchChange={() => {}}
        />
        <main className="flex-1 overflow-y-auto">
          {activeSection === 'dashboard' && <HODDashboard />}
          {activeSection === 'tickets' && <HODTickets userId={userData?.id} />}
          {activeSection === 'technicians' && <HODTechnicians />}
          {activeSection === 'sections' && <HODSections />}
          {activeSection === 'reports' && <ComingSoon section="Reports" />}
          {activeSection === 'settings' && <ComingSoon section="Settings" />}
        </main>
      </div>
    </div>
  );
};

const HODLayout = () => (
  <HODDashboardProvider>
    <HODLayoutContent />
  </HODDashboardProvider>
);

export default HODLayout;
