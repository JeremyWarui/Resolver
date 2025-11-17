import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import TechTicketsTable from "./TechTickets";
import TechnicianStatsCards from "./TechnicianStatsCards";
import TechQuickFilterButtons, { type TechQuickFilterType } from "./QuickFilterButtons";
import { useTickets } from "@/hooks/tickets";
import useUserData from "@/hooks/users/useUserData";

const TechTicketsPage = () => {
  const [activeQuickFilter, setActiveQuickFilter] = useState<TechQuickFilterType>('assigned');
  
  // Get current technician data
  const { loading: userLoading } = useUserData();
  
  // TESTING: Force technician ID 3 (Alex Smith) for testing purposes
  const simulatedTechnicianId = 3;
  
  // Fetch all tickets assigned to this technician
  const { tickets: myTickets, loading: ticketsLoading } = useTickets({ 
    assigned_to: simulatedTechnicianId,
    page_size: 100, // Reasonable limit for one technician
    ordering: '-created_at',
  });
  
  const loading = userLoading || ticketsLoading;

  // Calculate accurate counts from actual ticket data (client-side)
  const filterCounts = useMemo(() => {
    console.log('🎯 TechTicketsPage - Calculating counts from', myTickets.length, 'tickets');
    
    if (!myTickets.length) {
      console.log('🎯 TechTicketsPage - No tickets, returning zeros');
      return {
        all: 0,
        assigned: 0,
        in_progress: 0,
        pending: 0,
        resolved: 0,
      };
    }

    const counts = {
      all: myTickets.length,
      assigned: myTickets.filter(t => t.status === 'assigned').length,
      in_progress: myTickets.filter(t => t.status === 'in_progress').length,
      pending: myTickets.filter(t => t.status === 'pending').length,
      resolved: myTickets.filter(t => t.status === 'resolved').length,
    };
    
    return counts;
  }, [myTickets]);

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
            Manage your assigned work
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

      {/* Stats Cards - Clickable to filter */}
      <TechnicianStatsCards 
        counts={filterCounts} 
        loading={loading}
        onCardClick={handleStatCardClick}
      />
      
      {/* Quick Filter Buttons */}
      <TechQuickFilterButtons 
        activeFilter={activeQuickFilter}
        onFilterChange={setActiveQuickFilter}
        counts={filterCounts}
      />
      
      {/* Tickets Table with active filter */}
      <TechTicketsTable 
        activeQuickFilter={activeQuickFilter}
        currentTechnicianId={simulatedTechnicianId}
      />
    </div>
  );
};

export default TechTicketsPage;
