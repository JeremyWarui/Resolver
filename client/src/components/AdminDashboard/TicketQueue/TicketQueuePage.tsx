import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Inbox } from 'lucide-react';
import OverdueTicketsTable from './OverdueTicketsTable';
import UnassignedTicketsTable from './UnassignedTicketsTable';
import { useAdminAnalytics } from '@/hooks/analytics';

export default function TicketQueuePage() {
  const [activeTab, setActiveTab] = useState('overdue');
  const { data: analytics } = useAdminAnalytics();

  const overdueCount = analytics?.overdue_tickets?.length || 0;

  return (
    <div className='flex-1 overflow-y-auto p-4 bg-gray-50'>
      {/* Page Header */}
      <div className='flex justify-between mb-2'>
        <div>
          <h1 className='text-xl font-semibold text-gray-800'>
            Ticket Queue Management
          </h1>
          <p className='text-sm text-gray-600'>
            Monitor and manage tickets requiring immediate attention
          </p>
        </div>
      </div>

      {/* Ticket Queue Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-2'
      >
        <TabsList className='grid w-full grid-cols-2 lg:w-[400px] p-1.5'>
          <TabsTrigger
            value='overdue'
            className='flex items-center gap-2 px-4 py-2.5'
          >
            <AlertTriangle className='h-4 w-4' />
            <span>Overdue</span>
            {overdueCount > 0 && (
              <span className='ml-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full'>
                {overdueCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value='unassigned'
            className='flex items-center gap-2 px-4 py-2.5'
          >
            <Inbox className='h-4 w-4' />
            <span>Unassigned</span>
          </TabsTrigger>
        </TabsList>

        {/* Overdue Tickets Tab */}
        <TabsContent value='overdue' className='mt-0'>
          {/* Alert Card for Overdue Tickets */}
          {overdueCount > 0 && (
            <div className='flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg my-4'>
              <div className='flex items-center gap-3'>
                <AlertTriangle className='h-8 w-8 text-red-600' />
                <div>
                  <div className='text-lg font-semibold text-red-900'>
                    {overdueCount} Overdue{' '}
                    {overdueCount === 1 ? 'Ticket' : 'Tickets'}
                  </div>
                  <div className='text-sm text-red-700'>
                    These tickets require immediate attention
                  </div>
                </div>
              </div>
            </div>
          )}
          <OverdueTicketsTable />
        </TabsContent>

        {/* Unassigned Tickets Tab */}
        <TabsContent value='unassigned' className='mt-0'>
          <UnassignedTicketsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
