import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Wrench, CheckCircle, Clock, Users, UserCheck, UserX } from 'lucide-react';
// Import GraphQL hook instead of service
import useGraphQLStats from '@/hooks/useGraphQLStats';

// Define props interface for the component
interface StatsCardsProps {
  showTechnicianStatsOnly?: boolean;
  showTicketsStatsOnly?: boolean;
  currentUser?: string;
}

const StatsCards = ({ 
  showTechnicianStatsOnly = false, 
  showTicketsStatsOnly = false,
  currentUser = null
}: StatsCardsProps) => {
  // Use GraphQL hook to fetch stats data, passing the currentUser for filtering if provided
  const { ticketStats, technicianStats, loading } = useGraphQLStats({ 
    user: currentUser 
  });

  // Determine how many cards to show in loading state based on which stats to display
  const loadingCardsCount = showTechnicianStatsOnly ? 4 : (showTicketsStatsOnly ? 4 : 8);
  
  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-2'>
        {Array.from({ length: loadingCardsCount }).map((_, i) => (
          <Card key={i}>
            <CardContent className='p-4 flex items-center'>
              <div className='bg-gray-200 p-3 rounded-full mr-6 ml-2 animate-pulse'></div>
              <div className='w-full'>
                <div className='h-4 bg-gray-200 rounded animate-pulse mb-2'></div>
                <div className='h-6 bg-gray-200 rounded animate-pulse w-1/2 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded animate-pulse w-3/4'></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Create separate technician stats component
  const TechnicianStats = () => (
    <>
      <Card>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-[#e5f2fc] p-3 rounded-full mr-6 ml-2'>
            <Users className='h-6 w-6 text-[#0078d4]' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Total Technicians</p>
            <div className='flex items-center'>
              <h3 className='text-2xl font-bold mr-2'>{technicianStats.total}</h3>
            </div>
            <p className='text-xs text-gray-500'>Registered technicians</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-[#e5f9e5] p-3 rounded-full mr-6 ml-2'>
            <UserCheck className='h-6 w-6 text-[#107c10]' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Available</p>
            <div className='flex items-center'>
              <h3 className='text-2xl font-bold mr-2'>{technicianStats.available}</h3>
              <span className='text-xs px-1.5 py-0.5 bg-green-100 text-green-600 rounded'>
                {technicianStats.total > 0 ? Math.round((technicianStats.available / technicianStats.total) * 100) : 0}%
              </span>
            </div>
            <p className='text-xs text-gray-500'>Ready for assignment</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-[#fef2e6] p-3 rounded-full mr-6 ml-2'>
            <Clock className='h-6 w-6 text-[#ca5010]' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Busy</p>
            <div className='flex items-center'>
              <h3 className='text-2xl font-bold mr-2'>{technicianStats.busy}</h3>
              <span className='text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded'>
                {technicianStats.total > 0 ? Math.round((technicianStats.busy / technicianStats.total) * 100) : 0}%
              </span>
            </div>
            <p className='text-xs text-gray-500'>Currently working</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-[#f9f9f9] p-3 rounded-full mr-6 ml-2'>
            <UserX className='h-6 w-6 text-[#797775]' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Off Duty</p>
            <div className='flex items-center'>
              <h3 className='text-2xl font-bold mr-2'>{technicianStats.offDuty}</h3>
              <span className='text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded'>
                {technicianStats.total > 0 ? Math.round((technicianStats.offDuty / technicianStats.total) * 100) : 0}%
              </span>
            </div>
            <p className='text-xs text-gray-500'>Not available</p>
          </div>
        </CardContent>
      </Card>
    </>
  );

  // Create separate ticket stats component
  const TicketStats = () => (
    <>
      <Card>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-[#e5f2fc] p-3 rounded-full mr-6 ml-2'>
            <AlertTriangle className='h-6 w-6 text-[#0078d4]' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Open Tickets</p>
            <div className='flex items-center'>
              <h3 className='text-2xl font-bold mr-2'>{ticketStats.openTickets}</h3>
              <span className='text-xs px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded'>
                +12%
              </span>
            </div>
            <p className='text-xs text-gray-500'>{currentUser ? 'Your open tickets' : 'Requires attention'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-[#e5f2fc] p-3 rounded-full mr-6 ml-2'>
            <Wrench className='h-6 w-6 text-[#0078d4]' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Assigned Tickets</p>
            <div className='flex items-center'>
              <h3 className='text-2xl font-bold mr-2'>
                {ticketStats.assignedTickets}
              </h3>
              <span className='text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded'>
                +8%
              </span>
            </div>
            <p className='text-xs text-gray-500'>{currentUser ? 'Your assigned tickets' : 'In progress'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-[#e5f9e5] p-3 rounded-full mr-6 ml-2'>
            <CheckCircle className='h-6 w-6 text-[#107c10]' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Resolved Tickets</p>
            <div className='flex items-center'>
              <h3 className='text-2xl font-bold mr-2'>
                {ticketStats.resolvedTickets}
              </h3>
              <span className='text-xs px-1.5 py-0.5 bg-green-100 text-green-600 rounded'>
                +24%
              </span>
            </div>
            <p className='text-xs text-gray-500'>{currentUser ? 'Your resolved tickets' : 'This month'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-4 flex items-center'>
          <div className='bg-[#f9f3ff] p-3 rounded-full mr-6 ml-2'>
            <Clock className='h-6 w-6 text-[#5c2d91]' />
          </div>
          <div>
            <p className='text-sm text-gray-500'>Pending Tickets</p>
            <div className='flex items-center'>
              <h3 className='text-2xl font-bold mr-2'>
                {ticketStats.pendingTickets}
              </h3>
              <span className='text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded'>
                -5%
              </span>
            </div>
            <p className='text-xs text-gray-500'>{currentUser ? 'Your pending tickets' : 'Awaiting parts/approval'}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );

  // Render stats based on props
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-2'>
      {/* Show only technician stats if specified */}
      {showTechnicianStatsOnly && technicianStats.total > 0 && <TechnicianStats />}
      
      {/* Show only ticket stats if specified */}
      {showTicketsStatsOnly && <TicketStats />}
      
      {/* Show both if neither specific option is selected */}
      {!showTechnicianStatsOnly && !showTicketsStatsOnly && (
        <>
          <TicketStats />
          {technicianStats.total > 0 && <TechnicianStats />}
        </>
      )}
    </div>
  );
};

export default StatsCards;
