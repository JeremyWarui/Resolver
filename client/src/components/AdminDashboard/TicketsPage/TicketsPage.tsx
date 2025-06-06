import { Button } from "@/components/ui/button";
import { Plus, Filter, Download } from "lucide-react";
import TicketsTable from "./TicketsTable";
import StatsCards from "../../Common/StatsCards";

const TicketsPage = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="flex justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Tickets</h1>
          <p className="text-sm text-gray-600">
            Manage and track all maintenance requests
          </p>
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
            // onClick={() => setShowCreateTicket(true)}
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>
      <StatsCards showTicketsStatsOnly />
      <TicketsTable />
    </div>
  );
};

export default TicketsPage;
