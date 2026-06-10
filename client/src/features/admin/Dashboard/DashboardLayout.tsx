import RoleDashboardView from "@/features/shared/RoleDashboardView";

/**
 * Admin dashboard body. The implementation now lives in the shared,
 * role-scoped RoleDashboardView; this thin wrapper preserves the existing
 * default export so AdminLayout's import is unchanged.
 */
const MainContent = () => <RoleDashboardView role="admin" />;

export default MainContent;
