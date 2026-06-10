import { Skeleton } from '@/components/ui/skeleton';
import { AppPieChart } from '@/components/shared/data/AppPieChart';
import ChartCard from '@/components/shared/data/ChartCard';

interface ManagerStatusDistributionProps {
  statusData: Array<{ status: string; count: number }> | undefined;
  loading: boolean;
}

const ManagerStatusDistribution = ({ statusData, loading }: ManagerStatusDistributionProps) => {
  const chartData = (statusData ?? []).map(item => ({
    name: item.status.replace(/_/g, ' ').charAt(0).toUpperCase() + item.status.replace(/_/g, ' ').slice(1),
    value: item.count,
  }));

  return (
    <ChartCard title="Status Distribution" description="Current ticket states across your department">
      {loading ? (
        <Skeleton className="h-[280px] w-full" />
      ) : chartData.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-muted-foreground">
          <p>No status data available</p>
        </div>
      ) : (
        <AppPieChart data={chartData} height={280} innerRadius={60} outerRadius={100} />
      )}
    </ChartCard>
  );
};

export default ManagerStatusDistribution;
