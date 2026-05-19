import ChartCard from '@/components/Common/ChartCard';
import { ChartPlaceholder } from '@/components/Common/ChartPlaceholder';
import { AppBarChart } from '@/components/Common/AppBarChart';
import { AppPieChart } from '@/components/Common/AppPieChart';
import type { HODAnalytics } from '@/types';

interface HODChartsSectionProps {
  data: HODAnalytics | null;
  loading: boolean;
}

const HODChartsSection = ({ data, loading }: HODChartsSectionProps) => {
  const truncate = (s: string, max: number) => s.length > max ? s.slice(0, max) + '…' : s;

  const statusData = (data?.status_distribution ?? []).map(s => ({
    name: truncate(s.status.replace(/_/g, ' '), 14),
    Count: s.count,
  }));

  const sectionData = (data?.by_section ?? []).slice(0, 8).map(s => ({
    name: truncate(s.section.name, 12),
    value: s.open,
  }));

  return (
    <div className="grid grid-cols-7 gap-2 mb-2">
      <ChartCard
        className="col-span-4"
        title="Status Distribution"
        description="Ticket counts by current status"
        contentClassName="p-5 pt-1"
      >
        {loading ? (
          <ChartPlaceholder message="Loading chart data..." />
        ) : statusData.length === 0 ? (
          <ChartPlaceholder message="No status data available" />
        ) : (
          <AppBarChart data={statusData} dataKeys="Count" barGap={40} />
        )}
      </ChartCard>

      <ChartCard
        className="col-span-3"
        title="Section Workload"
        description="Open tickets by section"
        contentClassName="p-4 pt-0"
      >
        {loading ? (
          <ChartPlaceholder message="Loading chart data..." />
        ) : sectionData.length === 0 ? (
          <ChartPlaceholder message="No section data available" />
        ) : (
          <AppPieChart data={sectionData} />
        )}
      </ChartCard>
    </div>
  );
};

export default HODChartsSection;
