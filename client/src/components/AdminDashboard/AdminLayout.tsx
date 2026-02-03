import { useState } from "react";
import SideBar, { Section } from "../Common/Sidebar";
import Header from "../Common/Header";
import { SharedDataProvider, useSharedData } from "@/contexts/SharedDataContext";

// Import your view components (or use placeholders)
import MainContent from "./Dashboard/DashboardLayout";
import TicketsPage from "./TicketsPage/TicketsPage";
import TechniciansPage from "./Technicians/TechniciansPage";
import FacilitiesPage from "./Facilities/FacilitiesPage";
import SectionsPage from "./Sections/SectionsPage";
import { ReportsPageEnhanced as ReportsPage } from "./Reports";

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
  const { currentUser: userData } = useSharedData();

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
          {activeSection === "dashboard" && <MainContent />}
          {activeSection === "tickets" && <TicketsPage />}
          {activeSection === "reports" && <ReportsPage />}
          {activeSection === "technicians" && <TechniciansPage />}
          {activeSection === "sections" && <SectionsPage />}
          {activeSection === "facilities" && <FacilitiesPage />}
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
