import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import TicketsTable from "./TicketsTable";
import StatsCards from "../../Common/StatsCards";
import QuickFilterButtons, { type QuickFilterType } from "./QuickFilterButtons";
import { useTickets } from "@/hooks/tickets";

const TicketsPage = () => {
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilterType>('all');
  
  // Fetch all tickets to calculate accurate counts
  const { tickets: allTickets } = useTickets({ page_size: 1000 }); // Large page size to get all tickets

  // Calculate accurate counts from actual ticket data
  const filterCounts = useMemo(() => {
    const openTickets = allTickets.filter(t => t.status === 'open');
    const unassignedTickets = openTickets.filter(t => !t.assigned_to);
    const inProgressTickets = allTickets.filter(t => t.status === 'in_progress');
    const resolvedTickets = allTickets.filter(t => t.status === 'resolved');
    
    // Calculate overdue tickets (>7 days old in active states)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const overdueTickets = allTickets.filter(ticket => {
      const isActiveStatus = ['open', 'assigned', 'in_progress'].includes(ticket.status);
      const createdDate = new Date(ticket.created_at);
      return isActiveStatus && createdDate < sevenDaysAgo;
    });

    return {
      all: allTickets.length,
      open: openTickets.length,
      unassigned: unassignedTickets.length,
      overdue: overdueTickets.length,
      in_progress: inProgressTickets.length,
      resolved: resolvedTickets.length,
    };
  }, [allTickets]);

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
      <StatsCards />
      
      {/* Quick Filter Buttons */}
      <QuickFilterButtons 
        activeFilter={activeQuickFilter}
        onFilterChange={setActiveQuickFilter}
        counts={filterCounts}
      />
      
      <TicketsTable activeQuickFilter={activeQuickFilter} />
    </div>
  );
};

export default TicketsPage;
