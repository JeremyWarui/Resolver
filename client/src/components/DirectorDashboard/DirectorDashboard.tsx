import { AlertTriangle, Building2, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/Common/StatCard';
import { useDirectorAnalytics } from '@/hooks/analytics';

const DirectorDashboard = () => {
  const { data, loading } = useDirectorAnalytics();
  const overview = data?.overview;

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Organisation Overview</h2>
        {data?.organization && (
          <p className="text-sm text-gray-600">{data.organization.name} · {data.organization.code}</p>
        )}
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Tickets"
          value={overview?.total_tickets ?? 0}
          isLoading={loading}
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
        />
        <StatCard
          title="Open Tickets"
          value={overview?.total_open ?? 0}
          isLoading={loading}
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          iconBgColor="bg-orange-50"
          badge={overview && overview.total_open > 0 ? { value: 'Active', color: 'amber' } : undefined}
        />
        <StatCard
          title="Escalated"
          value={overview?.total_escalated ?? 0}
          isLoading={loading}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          iconBgColor="bg-red-50"
          badge={overview && overview.total_escalated > 0 ? { value: 'Needs Review', color: 'red' } : undefined}
        />
        <StatCard
          title="Avg Resolution"
          value={overview?.avg_resolution_time != null ? `${Math.round(overview.avg_resolution_time)}h` : '—'}
          isLoading={loading}
          icon={<Building2 className="h-5 w-5 text-green-600" />}
          iconBgColor="bg-green-50"
        />
      </div>

      {/* Campus breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Campus Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : data?.campus_stats && data.campus_stats.length > 0 ? (
              <div className="divide-y">
                {data.campus_stats.map(c => (
                  <div key={c.campus.id} className="py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.campus.name}</p>
                        <p className="text-xs text-gray-500">{c.campus.location}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-orange-600 font-medium">{c.open_tickets} open</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-600">{c.total_tickets} total</span>
                      </div>
                    </div>
                    {/* SLA compliance bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-[#0078d4] h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(c.sla_compliance, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{c.sla_compliance.toFixed(0)}% SLA compliance</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No campus data available</p>
            )}
          </CardContent>
        </Card>

        {/* Department performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : data?.dept_performance && data.dept_performance.length > 0 ? (
              <div className="divide-y max-h-72 overflow-y-auto">
                {data.dept_performance.map(d => (
                  <div key={d.department.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{d.department.name}</p>
                      <p className="text-xs text-gray-500">{d.department.campus}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-orange-600 font-medium">{d.open_count} open</p>
                      <p className="text-green-600 text-xs">{d.resolved_count} resolved</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No department data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default DirectorDashboard;
