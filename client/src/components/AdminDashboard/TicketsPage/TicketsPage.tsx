import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import TicketsTable from "./TicketsTable";
import StatsCards from "../../Common/StatsCards";

const TicketsPage = () => {
  const [activeQuickFilter, setActiveQuickFilter] = useState<'all' | 'open' | 'unassigned' | 'overdue' | 'in_progress' | 'resolved'>('all');

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="flex justify-between mb-2">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">All Tickets</h2>
          <p className="text-sm text-gray-600">Manage and track all maintenance tickets</p>
        </div>
        <div className="flex items-center space-x-2">
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

      {/* Global stats (reuses same data from dashboard) */}
      <StatsCards />

      {/* Tickets table with integrated quick filters */}
      <TicketsTable activeQuickFilter={activeQuickFilter} onFilterChange={setActiveQuickFilter} />
    </div>
  );
};

export default TicketsPage;
