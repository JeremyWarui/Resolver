import { useHODDashboard } from '@/contexts/HODDashboardContext';
import HODStatsCards from './HODStatsCards';
import HODChartsSection from './HODChartsSection';
import ChartCard from '@/components/Common/ChartCard';

const HODDashboard = () => {
  const { data, loading } = useHODDashboard();

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Campus Overview</h2>
        {data?.campus_department?.campus && (
          <p className="text-sm text-gray-600">
            {data.campus_department.campus.name} · {data.campus_department.department?.name ?? ''}
          </p>
        )}
      </div>

      <HODStatsCards data={data} loading={loading} />

      <HODChartsSection data={data} loading={loading} />

      {/* Status breakdown + Section performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <ChartCard title="Ticket Status" description="Breakdown by current status">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : data?.status_distribution && data.status_distribution.length > 0 ? (
            <div className="divide-y max-h-72 overflow-y-auto">
              {data.status_distribution.map(s => (
                <div key={s.status} className="py-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800 capitalize">{s.status.replace(/_/g, ' ')}</p>
                  <span className="text-sm font-semibold text-gray-700">{s.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No status data available</p>
          )}
        </ChartCard>

        <ChartCard title="Section Performance" description="Open tickets and technicians per section">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : data?.by_section && data.by_section.length > 0 ? (
            <div className="divide-y max-h-72 overflow-y-auto">
              {data.by_section.map(s => (
                <div key={s.section.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.section.name}</p>
                    <p className="text-xs text-gray-500">{s.section.section_type ?? '—'}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-orange-600 font-medium">{s.open} open</p>
                    <p className="text-gray-500 text-xs">{s.technician_count} technicians</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No section data available</p>
          )}
        </ChartCard>
      </div>

      {/* Technicians + Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <ChartCard title="Technician Performance" description="Works assigned per technician">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : data?.technician_workload && data.technician_workload.length > 0 ? (
            <div className="divide-y max-h-72 overflow-y-auto">
              {data.technician_workload.map(t => (
                <div key={t.technician.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.technician.name}</p>
                    <p className="text-xs text-gray-500">@{t.technician.username}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[#0078d4] font-medium">{t.total_assigned} assigned</span>
                    <span className="text-[#107c10] font-medium">{t.resolved} resolved</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No data available</p>
          )}
        </ChartCard>

        <ChartCard title="Facilities" description="Campus facilities and their status">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">Facility management coming soon</p>
          )}
        </ChartCard>
      </div>
    </main>
  );
};

export default HODDashboard;
