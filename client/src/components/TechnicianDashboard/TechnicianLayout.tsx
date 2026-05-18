import { useState } from 'react';
import TechSideBar, { Section } from './TechSideBar';
import Header from '../Common/Header';
import FullScreenLoading from '../Common/FullScreenLoading';
import TechTicketsPage from './TechTicketsPage';
import TechSectionTickets from './TechSectionTickets';
import TechReport from './TechReport';
import { useCurrentUser } from '@/contexts/UserDataContext';
import { TechnicianDashboardProvider, useTechDashboard } from '@/contexts/TechnicianDashboardContext';

// Import your view components (or use placeholders)

// A placeholder component for sections not yet implemented
function ComingSoonSection({ section }: { section: string }) {
  return (
    <div className='flex items-center justify-center h-full p-6'>
      <div className='text-center max-w-md p-8 bg-white rounded-lg shadow-sm'>
        <h2 className='text-2xl font-bold text-gray-800 mb-4'>
          {section} Coming Soon
        </h2>
        <p className='text-gray-600 mb-6'>
          We're currently working on this feature. It will be available in a
          future update.
        </p>
        <div className='w-full bg-gray-200 h-2 rounded-full mb-4'>
          <div className='bg-[#0078d4] h-2 rounded-full w-3/4'></div>
        </div>
        <p className='text-sm text-gray-500'>
          Development in progress: 75% complete
        </p>
      </div>
    </div>
  );
}

const TechnicianLayoutContent = () => {
  const [activeSection, setActiveSection] =
    useState<Section['id']>('dashboard');

  // Fetch current user data
  const { userData, loading: userLoading } = useCurrentUser();

  // Fetch dashboard data
  const { loading: dashboardLoading } = useTechDashboard();

  const headerTitle: Record<Section['id'], string> = {
    dashboard: 'Section Tickets',
    assignedTickets: 'Assigned Tickets',
    report: 'Reports',
    settings: 'Settings',
  };

  const isLoading = userLoading || dashboardLoading;

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Show loading spinner while fetching data */}
      {isLoading && <FullScreenLoading message="Loading your dashboard..." />}

      {/* Sidebar with controlled active state */}
      <TechSideBar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header
          title={headerTitle[activeSection]}
          searchPlaceholder='Search...'
          currentUser={userData}
          onSearchChange={(value) => {
            // Optionally, handle search changes here (e.g. propagate down to your view)
            console.log('Search:', value);
          }}
        />
        <main className='flex-1 overflow-y-auto'>
          {activeSection === 'dashboard' && <TechSectionTickets currentTechnicianId={userData?.id} />}
          {activeSection === 'assignedTickets' && <TechTicketsPage userData={userData} />}
          {activeSection === 'report' && <TechReport />}
          {activeSection === 'settings' && (
            <ComingSoonSection section='Settings' />
          )}
        </main>
      </div>
    </div>
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
