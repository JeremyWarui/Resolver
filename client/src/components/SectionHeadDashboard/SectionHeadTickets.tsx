import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSectionHeadAnalytics } from '@/hooks/analytics';
import SectionHeadStatsCards from './SectionHeadStatsCards';
import RoleTicketTablePage from '@/components/Common/RoleTicketTablePage';

const SectionHeadTickets = ({ userId }: { userId?: number }) => {
  const { data, loading } = useSectionHeadAnalytics();

  const header = (
    <div className="flex justify-between mb-4">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Section Tickets</h2>
        <p className="text-sm text-gray-600">
          {data?.department ? `${data.department.name} — all section tickets` : 'All section tickets'}
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
      role="head_of_section"
      userId={userId}
      header={header}
      statsRow={<SectionHeadStatsCards data={data} loading={loading} />}
    />
  );
};

export default SectionHeadTickets;
