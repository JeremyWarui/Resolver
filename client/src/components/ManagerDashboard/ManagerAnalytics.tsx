import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Building2, Clock, TrendingUp } from 'lucide-react';
import StatCard from '@/components/Common/StatCard';
import { useManagerDashboard } from '@/contexts/ManagerDashboardContext';

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}

const ManagerAnalytics = () => {
  const { data, loading, days, setDays } = useManagerDashboard();
  const overview = data?.overview;

  const statusChartData = (data?.status_distribution ?? []).map(item => ({
    name: item.status.replace(/_/g, ' '),
    count: item.count,
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Department Analytics</h2>
          {data?.department && (
            <p className="text-sm text-gray-600 mt-0.5">
              {data.department.name} · {data.department.code} · {data.department.campuses_count} campus
              {data.department.campuses_count !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
        <select
          className="text-sm border rounded-md px-3 py-1.5 bg-white shadow-sm"
          value={days}
          onChange={e => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-1">
        <StatCard
          title="Total Tickets"
          value={overview?.total_tickets ?? 0}
          isLoading={loading}
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
          className="bg-white"
        />
        <StatCard
          title="Open Tickets"
          value={overview?.open_tickets ?? 0}
          isLoading={loading}
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          iconBgColor="bg-orange-50"
          className="bg-white"
        />
        <StatCard
          title="Escalated"
          value={overview?.escalated_tickets ?? 0}
          isLoading={loading}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          iconBgColor="bg-red-50"
          className="bg-white"
        />
        <StatCard
          title="Avg Resolution"
          value={overview?.avg_resolution_hours != null ? `${Math.round(overview.avg_resolution_hours)}h` : '—'}
          isLoading={loading}
          icon={<Building2 className="h-5 w-5 text-green-600" />}
          iconBgColor="bg-green-50"
          badge={
            overview
              ? {
                  value: `${overview.sla_24h_pct.toFixed(0)}% SLA`,
                  color: overview.sla_24h_pct >= 80 ? 'green' : overview.sla_24h_pct >= 60 ? 'amber' : 'red',
                }
              : undefined
          }
          className="bg-white"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6">
          <CardTitle className="text-base">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          {loading ? (
            <Skeleton className="h-70 w-full" />
          ) : statusChartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No status data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusChartData} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-base">Campus Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            {loading ? (
              <SectionSkeleton />
            ) : !data?.by_campus?.length ? (
              <p className="text-sm text-muted-foreground">No campus data available.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm bg-white">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="px-3 py-3 font-medium">Campus</th>
                      <th className="px-3 py-3 font-medium text-right">Total</th>
                      <th className="px-3 py-3 font-medium text-right">Open</th>
                      <th className="px-3 py-3 font-medium text-right">Escalated</th>
                      <th className="px-3 py-3 font-medium text-right">SLA %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.by_campus.map(c => (
                      <tr key={c.campus.id}>
                        <td className="px-3 py-2.5">
                          <span className="font-medium">{c.campus.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{c.campus.code}</Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right">{c.total_tickets}</td>
                        <td className="px-3 py-2.5 text-right">{c.open_tickets}</td>
                        <td className="px-3 py-2.5 text-right">{c.escalated_tickets ?? 0}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={(c.sla_compliance ?? 0) >= 80 ? 'text-green-600' : (c.sla_compliance ?? 0) >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                            {c.sla_compliance ?? 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-base">Top Technicians</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            {loading ? (
              <SectionSkeleton />
            ) : !data?.technicians?.length ? (
              <p className="text-sm text-muted-foreground">No technician data available.</p>
            ) : (
              <div className="space-y-3">
                {data.technicians.slice(0, 8).map((t, idx) => (
                  <div key={t.technician.id} className="flex items-center gap-3 rounded-md border bg-white px-3 py-2.5">
                    <span className="text-xs text-muted-foreground w-5">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.technician.name || t.technician.username}</p>
                      <p className="text-xs text-muted-foreground truncate">@{t.technician.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Resolved</p>
                      <p className="text-sm font-medium text-green-600">{t.resolved}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6">
          <CardTitle className="text-base">Section Performance</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          {loading ? (
            <SectionSkeleton />
          ) : !data?.by_section?.length ? (
            <p className="text-sm text-muted-foreground">No section data available.</p>
          ) : (
            <div className="space-y-3">
              {data.by_section.map(s => (
                <div key={s.section.id} className="flex items-center gap-3 rounded-md border bg-white px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.section.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{typeof s.section.campus === 'string' ? s.section.campus : s.section.campus?.name || 'No campus'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(s.escalated_tickets ?? 0) > 0 && (
                      <Badge variant="destructive" className="text-xs">{s.escalated_tickets} escalated</Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">{s.open_tickets} open</Badge>
                    <Badge variant="outline" className="text-xs">{s.total_tickets} total</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerAnalytics;