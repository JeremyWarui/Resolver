import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ManagerStatusDistributionProps {
  statusData: Array<{ status: string; count: number }> | undefined;
  loading: boolean;
}

const ManagerStatusDistribution = ({ statusData, loading }: ManagerStatusDistributionProps) => {
  const chartData = (statusData ?? []).map(item => ({
    name: item.status.replace(/_/g, ' ').charAt(0).toUpperCase() + item.status.replace(/_/g, ' ').slice(1),
    count: item.count,
  }));

  return (
    <Card className="py-7 px-2">
      <CardHeader className="pb-5">
        <CardTitle>Status Distribution</CardTitle>
        <CardDescription>Tickets by status</CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {loading ? (
          <Skeleton className="h-72 w-full" />
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>No status data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Tickets']} labelFormatter={(l) => `Status: ${l}`} />
              <Bar dataKey="count" fill="#0078d4" radius={[3, 3, 0, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ManagerStatusDistribution;
