import { useTechnicianAnalytics } from '@/hooks/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, Star, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatCard from '@/components/Common/StatCard';

export default function TechnicianPerformanceReport() {
  const { data: analytics, loading, error } = useTechnicianAnalytics();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Failed to load technician analytics</span>
      </div>
    );
  }

  if (!analytics) return null;

  // Sort technicians by total tickets
  const sortedTechnicians = [...analytics.technician_performance].sort(
    (a, b) => b.total_tickets - a.total_tickets
  );

  // Prepare chart data
  const chartData = sortedTechnicians.slice(0, 10).map(tech => ({
    name: tech.full_name || tech.username,
    resolved: tech.resolved_tickets,
    pending: tech.pending_tickets,
    overdue: tech.overdue_tickets,
  }));

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResolutionColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const avgResolutionRate = (
    analytics.technician_performance.reduce((sum, t) => sum + t.resolution_percentage, 0) /
    analytics.technician_performance.length
  ).toFixed(1);

  const avgRating = (
    analytics.technician_performance.reduce((sum, t) => sum + t.avg_rating, 0) /
    analytics.technician_performance.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Overview Stats - Using StatCard like Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
        <StatCard
          title="Total Technicians"
          value={analytics.technician_performance.length}
          description="Active technicians"
          icon={<Users className="h-6 w-6 text-[#0078d4]" />}
          iconBgColor="bg-[#e5f2fc]"
          className="bg-white"
        />

        <StatCard
          title="Avg Resolution Rate"
          value={`${avgResolutionRate}%`}
          description="Overall completion rate"
          icon={<CheckCircle className="h-6 w-6 text-[#107c10]" />}
          iconBgColor="bg-[#e5f9e5]"
          badge={
            parseFloat(avgResolutionRate) > 70
              ? { value: 'Good', color: 'green' }
              : { value: 'Fair', color: 'amber' }
          }
          className="bg-white"
        />

        <StatCard
          title="Avg Rating"
          value={avgRating}
          description="Customer satisfaction"
          icon={<Star className="h-6 w-6 text-[#ffaa44] fill-[#ffaa44]" />}
          iconBgColor="bg-[#fff8e5]"
          badge={
            parseFloat(avgRating) >= 4.5
              ? { value: 'Excellent', color: 'green' }
              : parseFloat(avgRating) >= 3.5
                ? { value: 'Good', color: 'blue' }
                : { value: 'Fair', color: 'amber' }
          }
          className="bg-white"
        />
      </div>

      {/* Workload Distribution Chart */}
      <Card className="py-7 px-2">
        <CardHeader className="pb-5">
          <CardTitle className="pb-2">Technician Workload Distribution</CardTitle>
          <CardDescription>Comparison of resolved, pending, and overdue tickets</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-1">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edebe9" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
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
                <Legend />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="overdue" fill="#ef4444" name="Overdue" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Performance Table - DataTable Styling */}
      <Card className="py-7 px-2">
        <CardHeader className="pb-5">
          <CardTitle className="pb-2">Detailed Performance Metrics</CardTitle>
          <CardDescription>Comprehensive view of all technician metrics</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-1">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold">Technician</TableHead>
                  <TableHead className="text-center font-semibold">Total</TableHead>
                  <TableHead className="text-center font-semibold">Resolved</TableHead>
                  <TableHead className="text-center font-semibold">Pending</TableHead>
                  <TableHead className="text-center font-semibold">Overdue</TableHead>
                  <TableHead className="text-center font-semibold">Resolution %</TableHead>
                  <TableHead className="text-center font-semibold">Avg Rating</TableHead>
                  <TableHead className="text-center font-semibold">Avg Time (hrs)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTechnicians.length > 0 ? (
                  sortedTechnicians.map((tech) => (
                    <TableRow key={tech.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div>
                          <div>{tech.full_name || tech.username}</div>
                          <div className="text-xs text-gray-500">@{tech.username}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{tech.total_tickets}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          {tech.resolved_tickets}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-yellow-600">
                          <Clock className="h-4 w-4" />
                          {tech.pending_tickets}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          {tech.overdue_tickets}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn('border', getResolutionColor(tech.resolution_percentage))}>
                          {tech.resolution_percentage.toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className={cn('flex items-center justify-center gap-1 font-semibold', getRatingColor(tech.avg_rating))}>
                          <Star className="h-4 w-4 fill-current" />
                          {tech.avg_rating.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {tech.avg_resolution_time.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No technician data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Section Ratings (if available) - Same width to occupy one row */}
      {analytics.section_ratings && analytics.section_ratings.length > 0 && (
        <div className="mb-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Section-wise Performance</h3>
            <p className="text-sm text-gray-500">Average ratings by section</p>
          </div>
          <div className={cn(
            "grid gap-3",
            analytics.section_ratings.length === 1 ? "grid-cols-1" :
            analytics.section_ratings.length === 2 ? "grid-cols-2" :
            analytics.section_ratings.length === 3 ? "grid-cols-3" :
            analytics.section_ratings.length === 4 ? "grid-cols-4" :
            "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          )}>
            {analytics.section_ratings.map((section) => (
              <StatCard
                key={section.section_name}
                title={section.section_name}
                value={section.avg_rating.toFixed(1)}
                description={`${section.technician_count} ${section.technician_count === 1 ? 'technician' : 'technicians'}`}
                icon={<Star className="h-6 w-6 text-[#ffaa44] fill-[#ffaa44]" />}
                iconBgColor="bg-[#fff8e5]"
                className="bg-white"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
