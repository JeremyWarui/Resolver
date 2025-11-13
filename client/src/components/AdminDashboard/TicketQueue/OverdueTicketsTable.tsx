import { useAdminAnalytics } from '@/hooks/analytics';
import DataTable from '@/components/Common/DataTable/DataTable';
import { AlertCircle } from 'lucide-react';
import { createOverdueTicketColumns } from './utils/queueTableColumns';

export default function OverdueTicketsTable() {
  const { data: analytics, loading, error } = useAdminAnalytics();

  const overdueTickets = analytics?.overdue_tickets || [];

  const handleViewTicket = () => {
    // View ticket functionality - can be enhanced later
  };

  const handleManageTicket = () => {
    // Manage ticket functionality - can be enhanced later
  };

  // Use shared column definitions from utilities
  const columns = createOverdueTicketColumns({
    onView: handleViewTicket,
    onManage: handleManageTicket,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Failed to load overdue tickets</span>
      </div>
    );
  }

  return (
    <DataTable
      variant="admin"
      title='Overdue Tickets'
      subtitle='Tickets that are way overdue'
      columns={columns}
      data={overdueTickets}
      loading={loading}
      emptyStateMessage="No Overdue Tickets"
      emptyStateDescription="All tickets are on track! Great job! 🎉"
      defaultPageSize={10}
    />
  );
}
