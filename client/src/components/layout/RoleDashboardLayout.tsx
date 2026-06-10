import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { TicketDetailPage } from '@/app/dashboard/tickets/TicketDetailPage';
import { useAuthStore } from '@/stores/authStore';
import type { RoleNavConfig } from '@/config/roleNav';

export interface SectionCtx {
  /** Open the ticket-detail panel for a ticket id (or close with null). */
  onTicketSelect: (id: number | null) => void;
  userId?: number;
}

interface RoleDashboardLayoutProps {
  nav: RoleNavConfig;
  /** Maps section key → page node. Receives helpers for ticket selection etc. */
  sections: (ctx: SectionCtx) => Record<string, ReactNode>;
  /** Optional wrapper around the active section (e.g. <Suspense> for lazy pages). */
  renderWrapper?: (node: ReactNode) => ReactNode;
}

/**
 * Generic role dashboard scaffold. Replaces the near-identical HOD/HOS/Manager
 * layout bodies: URL → active section, header title, RoleLayout wrapper, and the
 * shared TicketDetailPage. Each role provides only its nav config (config/roleNav)
 * and its section → component map.
 */
export function RoleDashboardLayout({ nav, sections, renderWrapper }: RoleDashboardLayoutProps) {
  const location = useLocation();
  const userData = useAuthStore((s) => s.user);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const getSection = (pathname: string): string => {
    const sub = pathname.split('/').filter(Boolean)[1] ?? '';
    return nav.sectionFromPath[sub] ?? 'dashboard';
  };

  const [activeSection, setActiveSection] = useState<string>(getSection(location.pathname));
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setSelectedTicketId(null);
    setActiveSection(getSection(location.pathname));
  }

  const displayTitle =
    selectedTicketId !== null ? 'Ticket Detail' : nav.headerTitle[activeSection] ?? 'Dashboard';

  const sectionMap = sections({ onTicketSelect: setSelectedTicketId, userId: userData?.id });
  const activeNode = sectionMap[activeSection] ?? sectionMap.dashboard ?? null;

  return (
    <RoleLayout
      activeSection={activeSection}
      onSectionChange={(s) => {
        setSelectedTicketId(null);
        setActiveSection(s);
      }}
      role={userData?.role || nav.defaultRole}
      title={displayTitle}
      currentUser={userData}
      loading={false}
    >
      {renderWrapper ? renderWrapper(activeNode) : <>{activeNode}</>}

      <TicketDetailPage
        open={selectedTicketId !== null}
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </RoleLayout>
  );
}

export default RoleDashboardLayout;
