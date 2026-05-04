import {
  Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import ChartCard from '@/components/Common/ChartCard';
import type { HODAnalytics } from '@/types';

const COLORS = ['#0078d4', '#107c10', '#ffaa44', '#d13438', '#5c2d91'];

interface HODChartsSectionProps {
  data: HODAnalytics | null;
  loading: boolean;
}

const Placeholder = ({ message }: { message: string }) => (
  <div className="h-[250px] w-full flex items-center justify-center">
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

const HODChartsSection = ({ data, loading }: HODChartsSectionProps) => {
  const truncate = (s: string, max: number) => s.length > max ? s.slice(0, max) + '…' : s;

  const deptData = (data?.dept_stats ?? []).map(d => ({
    name: truncate(d.department.name, 14),
    Open: d.open_tickets,
    Total: d.total_tickets,
  }));

  const sectionData = (data?.section_performance ?? []).slice(0, 8).map(s => ({
    name: truncate(s.section.name, 12),
    value: s.open_count,
  }));

  return (
    <div className="grid grid-cols-7 gap-2 mb-2">
      <ChartCard
        className="col-span-4"
        title="Tickets by Department"
        description="Open vs total tickets per department"
        contentClassName="p-5 pt-1"
      >
        {loading ? (
          <Placeholder message="Loading chart data..." />
        ) : deptData.length === 0 ? (
          <Placeholder message="No department data available" />
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={deptData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }} barCategoryGap={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edebe9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} dy={20} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={30} />
                <RechartsTooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                        <p className="text-xs font-medium text-gray-800">{label}</p>
                        {payload.map((p, i) => <p key={i} className="text-xs text-gray-600">{p.name}: {p.value}</p>)}
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="Total" fill="#bfdbfe" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Open" fill="#0078d4" radius={[4, 4, 0, 0]} barSize={16} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <ChartCard
        className="col-span-3"
        title="Section Workload"
        description="Open tickets by section"
        contentClassName="p-4 pt-0"
      >
        {loading ? (
          <Placeholder message="Loading chart data..." />
        ) : sectionData.length === 0 ? (
          <Placeholder message="No section data available" />
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ percent = 0 }) => `${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sectionData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => <span style={{ fontSize: '10px' }}>{value}</span>}
                />
                <RechartsTooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                        <p className="text-xs font-medium text-gray-800">{payload[0].name}</p>
                        <p className="text-xs text-gray-600">Open tickets: {payload[0].value}</p>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  );
};

export default HODChartsSection;
