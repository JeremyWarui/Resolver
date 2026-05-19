import { useState, Suspense, lazy } from "react";
import ComingSoonSection from "../Common/ComingSoonSection";
import { RoleLayout } from "../Common/RoleLayout";
import { AdminDashboardProvider, useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { SharedDataProvider } from "@/contexts/SharedDataContext";
import { useCurrentUser } from "@/contexts/UserDataContext";

const MainContent = lazy(() => import("./Dashboard/DashboardLayout"));
const TicketsPage = lazy(() => import("./TicketsPage/TicketsPage"));
const TechniciansPage = lazy(() => import("./Technicians/TechniciansPage"));
const FacilitiesPage = lazy(() => import("./Facilities/FacilitiesPage"));
const SectionsPage = lazy(() => import("./Sections/SectionsPage"));
const ReportsPage = lazy(() => import("./Reports").then(module => ({ default: module.ReportsPageEnhanced })));
const OrganisationAnalyticsPage = lazy(() => import("./OrganisationAnalytics").then(m => ({ default: m.OrganisationAnalytics })));
const CampusesPage = lazy(() => import("./Campuses/CampusesPage"));
const DepartmentsPage = lazy(() => import("./Departments/DepartmentsPage"));
const CataloguePage = lazy(() => import("./Catalogue/CataloguePage"));

const PageLoading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading page...</span>
  </div>
);

const headerTitles: Record<string, string> = {
  dashboard: "Dashboard",
  tickets: "Tickets",
  reports: "Reports",
  analytics: "Organisation Analytics",
  schedule: "Schedule",
  technicians: "Technicians",
  facilities: "Facilities",
  sections: "Sections",
  campuses: "Campuses",
  departments: "Departments",
  inventory: "Service Catalogue",
  settings: "Settings",
};

function AdminLayoutContent() {
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const { userData } = useCurrentUser();
  const { loading } = useAdminDashboard();

  return (
    <RoleLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role={userData?.role || 'admin'}
      title={headerTitles[activeSection]}
      currentUser={userData}
      loading={loading}
    >
      <Suspense fallback={<PageLoading />}>
        {activeSection === "dashboard" && <MainContent />}
        {activeSection === "tickets" && <TicketsPage />}
        {activeSection === "reports" && <ReportsPage />}
        {activeSection === "analytics" && <OrganisationAnalyticsPage />}
        {activeSection === "technicians" && <TechniciansPage />}
        {activeSection === "sections" && <SectionsPage />}
        {activeSection === "facilities" && <FacilitiesPage />}
        {activeSection === "campuses" && <CampusesPage />}
        {activeSection === "departments" && <DepartmentsPage />}
      </Suspense>
      {activeSection === "schedule" && <ComingSoonSection section="Schedule" />}
      {activeSection === "inventory" && <CataloguePage />}
      {activeSection === "settings" && <ComingSoonSection section="Settings" />}
    </RoleLayout>
  );
}

export default function AdminLayout() {
  return (
    <AdminDashboardProvider>
      <SharedDataProvider>
        <AdminLayoutContent />
      </SharedDataProvider>
    </AdminDashboardProvider>
  );
}
