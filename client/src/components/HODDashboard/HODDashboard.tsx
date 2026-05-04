import { useHODAnalytics } from '@/hooks/analytics';
import { useSharedData } from '@/contexts/SharedDataContext';
import HODStatsCards from './HODStatsCards';
import HODChartsSection from './HODChartsSection';
import ChartCard from '@/components/Common/ChartCard';

const HODDashboard = () => {
  const { data, loading } = useHODAnalytics();
  const { facilities, facilitiesLoading } = useSharedData();

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Campus Overview</h2>
        {data?.campus && (
          <p className="text-sm text-gray-600">
            {data.campus.name} · {data.campus.location}
          </p>
        )}
      </div>

      <HODStatsCards data={data} loading={loading} />

      <HODChartsSection data={data} loading={loading} />

      {/* Department breakdown + Section performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <ChartCard title="Departments" description="Ticket summary per department">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : data?.dept_stats && data.dept_stats.length > 0 ? (
            <div className="divide-y max-h-72 overflow-y-auto">
              {data.dept_stats.map(d => (
                <div key={d.department.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{d.department.name}</p>
                    <p className="text-xs text-gray-500">HOD: {d.department.hod ?? 'Unassigned'}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-orange-600 font-medium">{d.open_tickets} open</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600">{d.total_tickets} total</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No department data available</p>
          )}
        </ChartCard>

        <ChartCard title="Section Performance" description="Open tickets and technicians per section">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : data?.section_performance && data.section_performance.length > 0 ? (
            <div className="divide-y max-h-72 overflow-y-auto">
              {data.section_performance.map(s => (
                <div key={s.section.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.section.name}</p>
                    <p className="text-xs text-gray-500">{s.section.department}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-orange-600 font-medium">{s.open_count} open</p>
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
          ) : data?.tech_performance && data.tech_performance.length > 0 ? (
            <div className="divide-y max-h-72 overflow-y-auto">
              {data.tech_performance.map(t => (
                <div key={t.technician.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.technician.name}</p>
                    <p className="text-xs text-gray-500">{t.technician.sections.join(', ') || 'No section'}</p>
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
          {facilitiesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : facilities.length > 0 ? (
            <div className="divide-y max-h-72 overflow-y-auto">
              {facilities.map(f => (
                <div key={f.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{f.name}</p>
                    <p className="text-xs text-gray-500">{f.type ?? '—'}</p>
                  </div>
                  <span className="text-sm text-gray-600">{f.status ?? '—'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No facilities</p>
          )}
        </ChartCard>
      </div>
    </main>
  );
};

export default HODDashboard;
