import { AlertTriangle, Building2, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/Common/StatCard';
import { useManagerAnalytics } from '@/hooks/analytics';

const ManagerDashboard = () => {
  const { data, loading } = useManagerAnalytics();
  const overview = data?.overview;

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Department Overview</h2>
        {data?.department && (
          <p className="text-sm text-gray-600">
            {data.department.name} · {data.department.code} ·{' '}
            {data.department.campuses_count} campus{data.department.campuses_count !== 1 ? 'es' : ''}
          </p>
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
          value={overview?.open_tickets ?? 0}
          isLoading={loading}
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          iconBgColor="bg-orange-50"
          badge={overview && overview.open_tickets > 0 ? { value: 'Active', color: 'amber' } : undefined}
        />
        <StatCard
          title="Escalated"
          value={overview?.escalated_tickets ?? 0}
          isLoading={loading}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          iconBgColor="bg-red-50"
          badge={overview && overview.escalated_tickets > 0 ? { value: 'Needs Review', color: 'red' } : undefined}
        />
        <StatCard
          title="Avg Resolution"
          value={overview?.avg_resolution_hours != null ? `${Math.round(overview.avg_resolution_hours)}h` : '—'}
          isLoading={loading}
          icon={<Building2 className="h-5 w-5 text-green-600" />}
          iconBgColor="bg-green-50"
        />
      </div>

      {/* Campus breakdown + Sections */}
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
            ) : data?.campuses && data.campuses.length > 0 ? (
              <div className="divide-y">
                {data.campuses.map(c => (
                  <div key={c.campus.id} className="py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.campus.name}</p>
                        <p className="text-xs text-gray-500">{c.campus.code}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-orange-600 font-medium">{c.open_tickets} open</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-600">{c.total_tickets} total</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-[#0078d4] h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(c.sla_compliance, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{c.sla_compliance.toFixed(0)}% SLA</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No campus data available</p>
            )}
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Sections</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : data?.sections && data.sections.length > 0 ? (
              <div className="divide-y max-h-72 overflow-y-auto">
                {data.sections.map(s => (
                  <div key={s.section.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.section.name}</p>
                      <p className="text-xs text-gray-500">{s.section.campus ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.escalated_tickets > 0 && (
                        <Badge variant="destructive" className="text-xs">{s.escalated_tickets} escalated</Badge>
                      )}
                      <span className="text-sm text-orange-600 font-medium">{s.open_tickets} open</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No section data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ManagerDashboard;
