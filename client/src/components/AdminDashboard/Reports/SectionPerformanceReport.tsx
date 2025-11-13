import { useTicketAnalytics } from '@/hooks/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, Building2, TrendingUp, BarChart3 } from 'lucide-react';
import StatCard from '@/components/Common/StatCard';

const CHART_COLORS = ['#0078d4', '#00a86b', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

export default function SectionPerformanceReport() {
  const { data: analytics, loading, error } = useTicketAnalytics({ timeframe: 'month', days: 90 });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Failed to load section analytics</span>
      </div>
    );
  }

  if (!analytics || !analytics.section_distribution.length) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <Building2 className="h-5 w-5 mr-2" />
        <span>No section data available</span>
      </div>
    );
  }

  // Prepare chart data
  const sectionBarData = analytics.section_distribution.map((item, index) => ({
    name: item.name,
    tickets: item.ticket_count,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const sectionPieData = analytics.section_distribution.map((item, index) => ({
    name: item.name,
    value: item.ticket_count,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const totalTickets = analytics.section_distribution.reduce((sum, item) => sum + item.ticket_count, 0);
  const avgPerSection = (totalTickets / analytics.section_distribution.length).toFixed(0);

  // Find section with most tickets
  const topSection = analytics.section_distribution.reduce((max, item) => 
    item.ticket_count > max.ticket_count ? item : max
  , analytics.section_distribution[0]);

  return (
    <div className="space-y-6">
      {/* Summary Cards - Using StatCard like Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
        <StatCard
          title="Total Sections"
          value={analytics.section_distribution.length}
          description="Active sections"
          icon={<Building2 className="h-6 w-6 text-[#0078d4]" />}
          iconBgColor="bg-[#e5f2fc]"
          className="bg-white"
        />

        <StatCard
          title="Total Tickets"
          value={totalTickets}
          description="Last 90 days"
          icon={<TrendingUp className="h-6 w-6 text-[#107c10]" />}
          iconBgColor="bg-[#e5f9e5]"
          badge={{ 
            value: `${topSection.name} leads`, 
            color: 'green' 
          }}
          className="bg-white"
        />

        <StatCard
          title="Avg per Section"
          value={avgPerSection}
          description="Tickets per section"
          icon={<BarChart3 className="h-6 w-6 text-[#5c2d91]" />}
          iconBgColor="bg-[#f9f3ff]"
          className="bg-white"
        />
      </div>

      {/* Two Column Grid: Donut Chart + Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie Chart - Distribution Percentage (Donut) */}
        <Card className="py-7 px-2">
          <CardHeader className="pb-5">
            <CardTitle className="pb-2">Section Distribution Breakdown</CardTitle>
            <CardDescription>Percentage of total tickets by section</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-1">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectionPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {sectionPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle"
                    formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Ticket Distribution (Thin Bars) */}
        <Card className="py-7 px-2">
          <CardHeader className="pb-5">
            <CardTitle className="pb-2">Section Ticket Volume</CardTitle>
            <CardDescription>Number of tickets by section (Last 90 days)</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-1">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionBarData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edebe9" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120}
                    interval={0}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    width={30}
                  />
                  <Tooltip />
                  <Bar dataKey="tickets" name="Tickets" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Details Table */}
      <Card className="py-7 px-2">
        <CardHeader className="pb-5">
          <CardTitle className="pb-2">Section Performance Details</CardTitle>
          <CardDescription>Detailed breakdown of each section</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-1">
          <div className="space-y-3">
            {analytics.section_distribution.map((section, index) => {
              const percentage = (section.ticket_count / totalTickets) * 100;
              return (
                <div key={section.name} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{section.name}</div>
                    <div className="text-sm text-gray-500">{section.ticket_count} tickets</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-gray-900">{percentage.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">of total</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
