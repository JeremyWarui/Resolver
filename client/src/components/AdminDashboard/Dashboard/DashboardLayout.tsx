import { Button } from "@/components/ui/button";
import { Plus, Filter, Download } from "lucide-react";
import StatsCards from "../../Common/StatsCards";
import ChartSection from "./ChartsSection";
import FacilityAndWorkload from "./FacilityAndWorkload";
import RecentTicketsTable from "./RecentTickets";

const MainContent = () => {
  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="flex justify-between mb-2">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Maintenance Overview
          </h2>
          <p className="text-sm text-gray-600">Welcome back, 👋</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-1 bg-[#0078d4] hover:bg-[#106ebe]"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards showTicketsStatsOnly/>
      {/* Charts - First Row */}
      <ChartSection />
      {/* Charts and Tables - Second Row */}
      <FacilityAndWorkload />
      {/*Recent Tickets */}
      <RecentTicketsTable />
    </main>
  );
};

export default MainContent;
