import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import TechTicketsTable from "./TechTickets";
import type { TechQuickFilterType } from "./QuickFilterButtons";
import type { User } from "@/types";

interface TechTicketsPageProps {
  userData?: User | null;
}

const TechTicketsPage = ({ userData }: TechTicketsPageProps) => {
  const [activeQuickFilter, setActiveQuickFilter] = useState<TechQuickFilterType>('assigned');
  
  // TESTING: Force technician ID 3 (Alex Smith) for testing purposes
  const simulatedTechnicianId = 3;

  // Handle stat card clicks to change filter
  const handleStatCardClick = (filter: TechQuickFilterType) => {
    setActiveQuickFilter(filter);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
      <div className="flex justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">My Tickets</h1>
          <p className="text-sm text-gray-600">
            Welcome back, {userData?.first_name || 'Technician'} 👋 Manage your assigned work
          </p>
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
        </div>
      </div>
      
      {/* Tickets Table with active filter - includes stats cards and quick filters */}
      <TechTicketsTable 
        activeQuickFilter={activeQuickFilter}
        currentTechnicianId={simulatedTechnicianId}
        onFilterChange={setActiveQuickFilter}
        onStatCardClick={handleStatCardClick}
      />
    </div>
  );
};

export default TechTicketsPage;
