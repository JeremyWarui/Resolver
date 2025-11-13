import { useState } from 'react';
import { useTicketAnalytics } from '@/hooks/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import type { TicketAnalyticsParams } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  'open': '#3b82f6',
  'assigned': '#f59e0b',
  'in_progress': '#8b5cf6',
  'resolved': '#10b981',
  'closed': '#6b7280',
  'on_hold': '#ef4444',
};

const CHART_COLORS = ['#0078d4', '#00a86b', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function TicketMetricsReport() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  
  const params: TicketAnalyticsParams = {
    timeframe,
    group_by: groupBy,
    days: timeframe === 'day' ? 7 : timeframe === 'week' ? 30 : 90,
  };

  const { data: analytics, loading, error } = useTicketAnalytics(params);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Failed to load ticket metrics</span>
      </div>
    );
  }

  if (!analytics) return null;

  // Transform data for charts
  const statusChartData = analytics.status_counts.map(item => ({
    name: item.status.replace('_', ' ').toUpperCase(),
    value: item.count,
    fill: STATUS_COLORS[item.status] || '#6b7280',
  }));

  const facilityChartData = analytics.facility_distribution.slice(0, 10).map((item, index) => ({
    name: item.name,
    tickets: item.ticket_count,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const sectionChartData = analytics.section_distribution.slice(0, 10).map((item, index) => ({
    name: item.name,
    tickets: item.ticket_count,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const trendData = analytics.trend_data.map(item => ({
    date: new Date(item.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tickets: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gray-500" />
          <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Ticket Summary</CardTitle>
          <CardDescription className="text-blue-700">
            {analytics.ticket_counts.period}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-900">
            {analytics.ticket_counts.count}
          </div>
          <p className="text-sm text-blue-700 mt-1">Total Tickets</p>
        </CardContent>
      </Card>

      {/* First Row: Status Distribution (Donut) + Sections Chart (Bar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Distribution - Donut Chart */}
        <Card className="py-7 px-2">
          <CardHeader className="pb-5">
            <CardTitle className="pb-2">Status Distribution</CardTitle>
            <CardDescription>Breakdown of tickets by current status</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-1">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
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

        {/* Section Distribution - Vertical Bar Chart */}
        <Card className="py-7 px-2">
          <CardHeader className="pb-5">
            <CardTitle className="pb-2">Top Sections by Ticket Volume</CardTitle>
            <CardDescription>Sections with the most maintenance requests</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-1">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edebe9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    width={30}
                  />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#0078d4" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Facilities Chart (Horizontal Bar) + Trend Chart (Line) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Facility Distribution - Horizontal Bar Chart */}
        <Card className="py-7 px-2">
          <CardHeader className="pb-5">
            <CardTitle className="pb-2">Top Facilities by Ticket Volume</CardTitle>
            <CardDescription>Facilities with the most tickets</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-1">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facilityChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#0078d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card className="py-7 px-2">
          <CardHeader className="pb-5">
            <CardTitle className="pb-2">Ticket Trends</CardTitle>
            <CardDescription>Ticket creation over time</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-1">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="tickets" stroke="#0078d4" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
