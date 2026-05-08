import { useState } from 'react';
import DirectorSideBar, { type ManagerSection } from './DirectorSideBar';
import Header from '@/components/Common/Header';
import FullScreenLoading from '@/components/Common/FullScreenLoading';
import ManagerDashboard from './DirectorDashboard';
import ManagerTickets from './DirectorTickets';
import { useUserData } from '@/hooks/users';
import { SharedDataProvider } from '@/contexts/SharedDataContext';

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

const ManagerLayoutContent = () => {
  const [activeSection, setActiveSection] = useState<ManagerSection>('dashboard');
  const { userData, loading: userLoading } = useUserData();

  const headerTitle: Record<ManagerSection, string> = {
    dashboard: 'Dashboard',
    tickets: 'Department Tickets',
    reports: 'Reports',
    settings: 'Settings',
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {userLoading && <FullScreenLoading message="Loading your dashboard..." />}
      <DirectorSideBar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={headerTitle[activeSection]}
          searchPlaceholder="Search..."
          currentUser={userData}
          onSearchChange={() => {}}
        />
        <main className="flex-1 overflow-y-auto">
          {activeSection === 'dashboard' && <ManagerDashboard />}
          {activeSection === 'tickets' && <ManagerTickets userId={userData?.id} />}
          {activeSection === 'reports' && <ComingSoon section="Reports" />}
          {activeSection === 'settings' && <ComingSoon section="Settings" />}
        </main>
      </div>
    </div>
  );
};

const ManagerLayout = () => (
  <SharedDataProvider>
    <ManagerLayoutContent />
  </SharedDataProvider>
);

export default ManagerLayout;
