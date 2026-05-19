import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

const BAR_COLORS = ['#0078d4', '#bfdbfe', '#107c10', '#ffaa44', '#d13438', '#5c2d91'];

interface AppBarChartProps {
  data: unknown[];
  dataKeys?: string | string[];
  height?: number;
  barSize?: number;
  vertical?: boolean;
  barGap?: number;
  barColors?: string | string[];
}

export function AppBarChart({
  data,
  dataKeys = 'Count',
  height = 250,
  barSize = 20,
  vertical = false,
  barGap = 50,
  barColors,
}: AppBarChartProps) {
  const keys = Array.isArray(dataKeys) ? dataKeys : [dataKeys];
  const colors = Array.isArray(barColors) ? barColors : [barColors || BAR_COLORS[0]];

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          barCategoryGap={barGap}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={vertical} stroke="#edebe9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={20} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={30} />
          <RechartsTooltip
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                  <p className="text-xs font-medium text-gray-800 capitalize">{label || payload[0]?.payload?.name}</p>
                  {payload.map((p, i) => (
                    <p key={i} className="text-xs text-gray-600">
                      {p.name}: {p.value}
                    </p>
                  ))}
                </div>
              ) : null
            }
          />
          {keys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[idx % colors.length]}
              radius={[4, 4, 0, 0]}
              barSize={barSize}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
