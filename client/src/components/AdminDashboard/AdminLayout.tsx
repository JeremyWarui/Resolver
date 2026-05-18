import { useState, Suspense, lazy } from "react";
import SideBar, { Section } from "../Common/Sidebar";
import Header from "../Common/Header";
import FullScreenLoading from "../Common/FullScreenLoading";
import { AdminDashboardProvider, useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { SharedDataProvider } from "@/contexts/SharedDataContext";

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

function ComingSoonSection({ section }: { section: string }) {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{section} Coming Soon</h2>
        <p className="text-gray-600 mb-6">
          We're currently working on this feature. It will be available in a future update.
        </p>
        <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
          <div className="bg-[#0078d4] h-2 rounded-full w-3/4"></div>
        </div>
        <p className="text-sm text-gray-500">Development in progress: 75% complete</p>
      </div>
    </div>
  );
}

const headerTitles: Record<Section["id"], string> = {
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
  const [activeSection, setActiveSection] = useState<Section["id"]>("dashboard");
  const { loading } = useAdminDashboard();

  return (
    <div className="flex h-screen bg-gray-100">
      {loading && <FullScreenLoading message="Loading dashboard..." />}

      <SideBar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={headerTitles[activeSection]}
          searchPlaceholder="Search..."
          currentUser={null}
          onSearchChange={() => {}}
        />
        <main className="flex-1 overflow-y-auto">
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
        </main>
      </div>
    </div>
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
