import { useState, Suspense, lazy } from "react";
import SideBar, { Section } from "../Common/Sidebar";
import Header from "../Common/Header";
import FullScreenLoading from "../Common/FullScreenLoading";
import { SharedDataProvider, useSharedData } from "@/contexts/SharedDataContext";

// Lazy load dashboard pages for better code splitting
const MainContent = lazy(() => import("./Dashboard/DashboardLayout"));
const TicketsPage = lazy(() => import("./TicketsPage/TicketsPage"));
const TechniciansPage = lazy(() => import("./Technicians/TechniciansPage"));
const FacilitiesPage = lazy(() => import("./Facilities/FacilitiesPage"));  
const SectionsPage = lazy(() => import("./Sections/SectionsPage"));
const ReportsPage = lazy(() => import("./Reports").then(module => ({ default: module.ReportsPageEnhanced })));

// Loading component for dashboard pages
const PageLoading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading page...</span>
  </div>
);

// A placeholder component for sections not yet implemented
function ComingSoonSection({ section }: { section: string }) {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {section} Coming Soon
        </h2>
        <p className="text-gray-600 mb-6">
          We're currently working on this feature. It will be available in a
          future update.
        </p>
        <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
          <div className="bg-[#0078d4] h-2 rounded-full w-3/4"></div>
        </div>
        <p className="text-sm text-gray-500">
          Development in progress: 75% complete
        </p>
      </div>
    </div>
  );
}

function AdminLayoutContent() {
  const [activeSection, setActiveSection] =
    useState<Section["id"]>("dashboard");
  
  // Fetch current user data from shared context
  const { currentUser: userData, isLoading } = useSharedData();

  // Determine header title based on the active section.
  const headerTitle =
    activeSection === "dashboard"
      ? "Dashboard"
      : activeSection === "tickets"
        ? "Tickets"
        : activeSection === "reports"
          ? "Reports & Analytics"
          : activeSection === "schedule"
            ? "Schedule"
            : activeSection === "technicians"
              ? "Technicians"
              : activeSection === "facilities"
                ? "Facilities"
                : activeSection === "sections"
                  ? "Sections"
                  : activeSection === "inventory"
                  ? "Inventory Management"
                  : "Settings";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Show loading spinner while fetching reference data */}
      {isLoading && <FullScreenLoading message="Loading dashboard..." />}
      
      {/* Sidebar with controlled active state */}
      <SideBar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={headerTitle}
          searchPlaceholder="Search..."
          currentUser={userData}
          onSearchChange={(value) => {
            // Optionally, handle search changes here (e.g. propagate down to your view)
            console.log("Search:", value);
          }}
        />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<PageLoading />}>
            {activeSection === "dashboard" && <MainContent />}
            {activeSection === "tickets" && <TicketsPage />}
            {activeSection === "reports" && <ReportsPage />}
            {activeSection === "technicians" && <TechniciansPage />}
            {activeSection === "sections" && <SectionsPage />}
            {activeSection === "facilities" && <FacilitiesPage />}
          </Suspense>
          {activeSection === "schedule" && (
            <ComingSoonSection section="Schedule" />
          )}
          {activeSection === "inventory" && (
            <ComingSoonSection section="Inventory" />
          )}
          {activeSection === "settings" && (
            <ComingSoonSection section="Settings" />
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <SharedDataProvider>
      <AdminLayoutContent />
    </SharedDataProvider>
  );
}
