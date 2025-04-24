import { SetStateAction, useState } from 'react';
import TechSideBar, { Section } from './TechSideBar';
import Header from '../Common/Header';
import TechnicianDashboard from './TechDashboard';
import TechTicketsTable from './TechTickets';
import TechReport from './TechReport';

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

const TechnicianLayout = () => {
  const [activeSection, setActiveSection] =
    useState<Section['id']>('dashboard');

  // Determine header title based on the active section.
  const headerTitle =
    activeSection === 'dashboard'
      ? 'Dashboard'
      : activeSection === 'assignedTickets'
        ? 'Assigned Tickets'
        : activeSection === 'report'
          ? 'Report'
          : 'Settings';

  const handleNavigate = (sectionId: Section['id']) => {
    setActiveSection(sectionId);
  };

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Sidebar with controlled active state */}
      <TechSideBar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header
          title={headerTitle}
          searchPlaceholder='Search...'
          onSearchChange={(value) => {
            // Optionally, handle search changes here (e.g. propagate down to your view)
            console.log('Search:', value);
          }}
        />
        <main className='flex-1 overflow-y-auto'>
          {activeSection === 'dashboard' && <TechnicianDashboard />}
          {activeSection === 'assignedTickets' && (
            <div className="p-4 bg-gray-50 space-y-6">
              <div className="flex justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">Assigned Tickets</h2>
                  <p className="text-sm text-gray-600">View and manage all tickets assigned to you</p>
                </div>
              </div>
              <TechTicketsTable 
                defaultFilter="all" 
                onNavigate={handleNavigate}
              />
            </div>
          )}
          {activeSection === 'report' && <TechReport />}
          {activeSection === 'settings' && (
            <ComingSoonSection section='Settings' />
          )}
        </main>
      </div>
    </div>
  );
};

export default TechnicianLayout;
