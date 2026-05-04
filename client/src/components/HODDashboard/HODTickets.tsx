import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useHODAnalytics } from '@/hooks/analytics';
import HODStatsCards from './HODStatsCards';
import RoleTicketTablePage from '@/components/Common/RoleTicketTablePage';

const HODTickets = ({ userId }: { userId?: number }) => {
  const { data, loading } = useHODAnalytics();

  const header = (
    <div className="flex justify-between mb-4">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Campus Tickets</h2>
        <p className="text-sm text-gray-600">
          {data?.campus ? `${data.campus.name} — all department tickets` : 'All department tickets'}
        </p>
      </div>
      <Button size="sm" className="flex items-center gap-1 bg-[#0078d4] hover:bg-[#106ebe]">
        <Plus className="h-4 w-4" />
        New Ticket
      </Button>
    </div>
  );

  return (
    <RoleTicketTablePage
      role="hod"
      userId={userId}
      header={header}
      statsRow={<HODStatsCards data={data} loading={loading} />}
    />
  );
};

export default HODTickets;
