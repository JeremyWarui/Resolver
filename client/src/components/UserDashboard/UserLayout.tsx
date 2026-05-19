import { useState } from 'react';
import ComingSoonSection from '../Common/ComingSoonSection';
import { RoleLayout } from '../Common/RoleLayout';
import { UserDashboardProvider } from '@/contexts/UserDashboardContext';
import { useCurrentUser } from '@/contexts/UserDataContext';

// Import your view components (or use placeholders)
import UserDashboard from './UserDashboard';
import UserTickets from './UserTickets';
import { TicketCreationWizard } from '@/components/shared/TicketCreationWizard';

const UserLayoutContent = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [ticketRefreshKey, setTicketRefreshKey] = useState(0);

  // Read current user from context (fetched once by UserDataProvider)
  const { userData, loading: userLoading } = useCurrentUser();

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
  const handleSectionChange = (section: string) => {
    if (section === 'submitTicket') {
      setIsCreateTicketOpen(true);
      // Keep on current section instead of changing to submitTicket
      return;
    }
    setActiveSection(section);
  };

  return (
    <>
      <RoleLayout
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        role={userData?.role || 'user'}
        title={headerTitle}
        currentUser={userData}
        loading={userLoading}
      >
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
      </RoleLayout>

      {/* Create Ticket Modal */}
      <TicketCreationWizard
        isOpen={isCreateTicketOpen}
        onOpenChange={setIsCreateTicketOpen}
        onSuccess={handleTicketCreated}
      />
    </>
  );
};

const UserLayout = () => {
  return (
    <UserDashboardProvider>
      <UserLayoutContent />
    </UserDashboardProvider>
  );
};

export default UserLayout;
