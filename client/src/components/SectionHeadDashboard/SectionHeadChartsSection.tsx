import ChartCard from '@/components/Common/ChartCard';
import { ChartPlaceholder } from '@/components/Common/ChartPlaceholder';
import { AppBarChart } from '@/components/Common/AppBarChart';
import { AppPieChart } from '@/components/Common/AppPieChart';
import { STATUS_LABELS } from '@/constants/tickets';
import type { SectionHeadAnalytics, Ticket } from '@/types';

interface SectionHeadChartsSectionProps {
  data: SectionHeadAnalytics | null;
  loading: boolean;
}

const SectionHeadChartsSection = ({ data, loading }: SectionHeadChartsSectionProps) => {
  const truncate = (s: string, max: number) => s.length > max ? s.slice(0, max) + '…' : s;

  const sectionBarData = (data?.by_section ?? []).map(s => ({
    name: truncate(s.section.name, 13),
    Open: s.open,
    Total: s.total,
  }));

  const statusPieData = (data?.status_distribution ?? [])
    .filter(s => s.count > 0)
    .map(s => ({
      name: STATUS_LABELS[s.status as Ticket['status']] ?? s.status,
      value: s.count,
    }));

  return (
    <div className="grid grid-cols-7 gap-2 mb-2">
      <ChartCard
        className="col-span-4"
        title="Tickets by Section"
        description="Open vs total tickets per section"
        contentClassName="p-5 pt-1"
      >
        {loading ? (
          <ChartPlaceholder message="Loading chart data..." />
        ) : sectionBarData.length === 0 ? (
          <ChartPlaceholder message="No section data available" />
        ) : (
          <AppBarChart data={sectionBarData} dataKeys={['Total', 'Open']} barColors={['#bfdbfe', '#0078d4']} barGap={40} barSize={16} />
        )}
      </ChartCard>

      <ChartCard
        className="col-span-3"
        title="Status Breakdown"
        description="Ticket distribution by status"
        contentClassName="p-4 pt-0"
      >
        {loading ? (
          <ChartPlaceholder message="Loading chart data..." />
        ) : statusPieData.length === 0 ? (
          <ChartPlaceholder message="No status data available" />
        ) : (
          <AppPieChart data={statusPieData} />
        )}
      </ChartCard>
    </div>
  );
};

export default SectionHeadChartsSection;
