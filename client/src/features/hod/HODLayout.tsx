import ComingSoonSection from '@/components/shared/ComingSoonSection';
import { RoleDashboardLayout } from '@/components/layout/RoleDashboardLayout';
import { ROLE_NAV } from '@/config/roleNav';
import HODDashboard from './HODDashboard';
import HODTechnicians from './HODTechnicians';
import HODSections from './HODSections';
import RoleTicketsPage from '@/features/shared/RoleTicketsPage';
import RoleAnalyticsView from '@/features/shared/RoleAnalyticsView';
import RoleReportsPage from '@/features/shared/RoleReportsPage';
import { SLATrackingView } from '@/features/analytics/SLATrackingView';

const HODLayout = () => (
  <RoleDashboardLayout
    nav={ROLE_NAV.hod}
    sections={({ onTicketSelect }) => ({
      dashboard: <HODDashboard />,
      tickets: <RoleTicketsPage role="hod" onTicketSelect={onTicketSelect} />,
      technicians: <HODTechnicians />,
      sections: <HODSections />,
      analytics: <RoleAnalyticsView role="hod" />,
      reports: <RoleReportsPage role="hod" />,
      sla: <SLATrackingView />,
      settings: <ComingSoonSection section="Settings" />,
    })}
  />
);

export default HODLayout;
