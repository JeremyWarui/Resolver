import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Download } from 'lucide-react';

// Import components
import TechTickets from './TechTickets';
import StatCard from '@/components/Common/StatCard';

// Import icons
import { AlertCircle, Wrench, CheckCircle, Clock } from 'lucide-react';

// Import sample data from shared file
import { sampleTickets, currentTechnician } from './data/sampleData';

const TechnicianDashboard = () => {
  // Calculate ticket statistics from sample data
  const ticketStats = useMemo(() => {
    const openCount = sampleTickets.filter(t => t.status === 'open').length;
    const inProgressCount = sampleTickets.filter(t => t.status === 'in progress').length;
    const pendingCount = sampleTickets.filter(t => t.status === 'pending').length;
    const resolvedCount = sampleTickets.filter(t => t.status === 'resolved').length;
    
    return {
      openTickets: openCount,
      inProgressTickets: inProgressCount,
      pendingTickets: pendingCount,
      resolvedTickets: resolvedCount,
      totalTickets: sampleTickets.length
    };
  }, []);

  // Custom stats card component with calculated data
  const CustomTicketStats = () => (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-2'>
      <StatCard
        title="Open Tickets"
        value={ticketStats.openTickets}
        description="Requires attention"
        icon={<AlertCircle className='h-6 w-6 text-[#0078d4]' />}
        iconBgColor="bg-[#e5f2fc]"
        badge={{ value: "+12%", color: "amber" }}
        className="bg-white"
      />

      <StatCard
        title="In Progress"
        value={ticketStats.inProgressTickets}
        description="Currently working"
        icon={<Wrench className='h-6 w-6 text-[#0078d4]' />}
        iconBgColor="bg-[#e5f2fc]"
        badge={{ value: "+8%", color: "blue" }}
        className="bg-white"
      />

      <StatCard
        title="Resolved"
        value={ticketStats.resolvedTickets}
        description="Completed work"
        icon={<CheckCircle className='h-6 w-6 text-[#107c10]' />}
        iconBgColor="bg-[#e5f9e5]"
        badge={{ value: "+24%", color: "green" }}
        className="bg-white"
      />

      <StatCard
        title="Pending"
        value={ticketStats.pendingTickets}
        description="Awaiting resources"
        icon={<Clock className='h-6 w-6 text-[#5c2d91]' />}
        iconBgColor="bg-[#f9f3ff]"
        badge={{ value: "-5%", color: "red" }}
        className="bg-white"
      />
    </div>
  );

  return (
    <main className='flex-1 overflow-y-auto p-4 bg-gray-50 space-y-6'>
      <div className='flex justify-between mb-2'>
        <div>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Technician Dashboard
          </h2>
          <p className='text-sm text-gray-600'>Welcome back, {currentTechnician.name} 👋</p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center gap-1'
          >
            <Filter className='h-4 w-4' />
            Filter
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center gap-1'
          >
            <Download className='h-4 w-4' />
            Export
          </Button>
        </div>
      </div>

      {/* Use custom stats component with calculated data */}
      <CustomTicketStats />

      {/* Tickets Section - Only show open tickets on dashboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Open Tickets</h3>
        </div>
        
        {/* Tickets Table - Only show open tickets on dashboard */}
        <TechTickets defaultFilter="open" />
      </div>
    </main>
  );
};

export default TechnicianDashboard;
