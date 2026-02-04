import { useState } from 'react';
import UserSideBar, { Section } from './UserSideBar';
import Header from '../Common/Header';
import FullScreenLoading from '../Common/FullScreenLoading';
import { useUserData } from '@/hooks/users';
import { SharedDataProvider } from '@/contexts/SharedDataContext';

// Import your view components (or use placeholders)
import UserDashboard from './UserDashboard';
import UserTickets from './UserTickets';
import CreateTicket from './CreateTicket';

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

const UserLayoutContent = () => {
  const [activeSection, setActiveSection] =
    useState<Section['id']>('dashboard');
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [ticketRefreshKey, setTicketRefreshKey] = useState(0);

  // Fetch current user data
  const { userData, loading: userLoading } = useUserData();

  // Callback to refresh ticket tables after creating a ticket
  const handleTicketCreated = () => {
    setTicketRefreshKey((prev) => prev + 1);
  };

  // Determine header title based on the active section.
  const headerTitle =
    activeSection === 'dashboard'
      ? 'Dashboard'
      : activeSection === 'userTickets'
        ? 'My Tickets'
        : activeSection === 'submitTicket'
          ? 'New Ticket'
          : 'Settings';

  // Handle section changes - if "submitTicket" is selected, open the modal
  const handleSectionChange = (section: Section['id']) => {
    if (section === 'submitTicket') {
      setIsCreateTicketOpen(true);
      // Keep on current section instead of changing to submitTicket
      return;
    }
    setActiveSection(section);
  };

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Show loading spinner while fetching user data */}
      {userLoading && <FullScreenLoading message="Loading your dashboard..." />}
      
      {/* Sidebar with controlled active state */}
      <UserSideBar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header
          title={headerTitle}
          searchPlaceholder='Search...'
          currentUser={userData}
          onSearchChange={(value) => {
            // Optionally, handle search changes here (e.g. propagate down to your view)
            console.log('Search:', value);
          }}
        />
        <main className='flex-1 overflow-y-auto'>
          {activeSection === 'dashboard' && (
            <UserDashboard
              key={`dashboard-${ticketRefreshKey}`}
              onNavigate={handleSectionChange}
            />
          )}
          {activeSection === 'userTickets' && (
            <UserTickets
              key={`user-${ticketRefreshKey}`}
              onNavigate={handleSectionChange}
            />
          )}
          {activeSection === 'settings' && (
            <ComingSoonSection section='Settings' />
          )}
        </main>
      </div>

      {/* Create Ticket Modal */}
      <CreateTicket
        isOpen={isCreateTicketOpen}
        onOpenChange={setIsCreateTicketOpen}
        onSuccess={handleTicketCreated}
      />
    </div>
  );
};

const UserLayout = () => {
  return (
    <SharedDataProvider>
      <UserLayoutContent />
    </SharedDataProvider>
  );
};

export default UserLayout;
