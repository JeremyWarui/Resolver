import RoleDashboardView from "@/features/shared/RoleDashboardView";

/**
 * Manager dashboard homepage — now the shared, role-scoped RoleDashboardView.
 * All analytics/ticket/report endpoints scope server-side by JWT, so the
 * manager gets a real department overview (stats cards, flow/demand charts,
 * recent tickets, export) with no dead legacy fields.
 */
const ManagerDashboard = () => <RoleDashboardView role="manager" />;

export default ManagerDashboard;
