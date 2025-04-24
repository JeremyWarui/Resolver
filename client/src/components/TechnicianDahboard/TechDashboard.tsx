import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Download } from 'lucide-react';

// Import components
import TechTickets from './TechTickets';

// Import card components for custom stats
import { Card, CardContent } from '@/components/ui/card';
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
      <Card>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-[#e5f2fc] p-3 rounded-full mr-6 ml-2'>
            <AlertCircle className='h-6 w-6 text-[#0078d4]' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Open Tickets</p>
            <div className='flex items-center'>
              <h3 className='text-2xl font-bold mr-2'>{ticketStats.openTickets}</h3>
            </div>
            <p className='text-xs text-gray-500'>Requires attention</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-[#fef2e6] p-3 rounded-full mr-6 ml-2'>
            <Wrench className='h-6 w-6 text-[#ca5010]' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>In Progress</p>
            <div className='flex items-center'>
              <h3 className='text-2xl font-bold mr-2'>
                {ticketStats.inProgressTickets}
              </h3>
            </div>
            <p className='text-xs text-gray-500'>Currently working</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-[#e5f9e5] p-3 rounded-full mr-6 ml-2'>
            <CheckCircle className='h-6 w-6 text-[#107c10]' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Resolved</p>
            <div className='flex items-center'>
              <h3 className='text-2xl font-bold mr-2'>
                {ticketStats.resolvedTickets}
              </h3>
            </div>
            <p className='text-xs text-gray-500'>Completed work</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-[#f9f3ff] p-3 rounded-full mr-6 ml-2'>
            <Clock className='h-6 w-6 text-[#5c2d91]' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Pending</p>
            <div className='flex items-center'>
              <h3 className='text-2xl font-bold mr-2'>
                {ticketStats.pendingTickets}
              </h3>
            </div>
            <p className='text-xs text-gray-500'>Awaiting resources</p>
          </div>
        </CardContent>
      </Card>
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
