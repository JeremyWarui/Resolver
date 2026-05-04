import { useSectionHeadAnalytics } from '@/hooks/analytics';
import { useSharedData } from '@/contexts/SharedDataContext';
import SectionHeadStatsCards from './SectionHeadStatsCards';
import SectionHeadChartsSection from './SectionHeadChartsSection';
import ChartCard from '@/components/Common/ChartCard';

const SectionHeadDashboard = () => {
  const { data, loading } = useSectionHeadAnalytics();
  const { facilities, facilitiesLoading } = useSharedData();

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Section Overview</h2>
        {data?.department && (
          <p className="text-sm text-gray-600">
            {data.department.name} · {data.department.campus ?? 'Campus'} · {data.department.sections_count} section{data.department.sections_count !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <SectionHeadStatsCards data={data} loading={loading} />

      <SectionHeadChartsSection data={data} loading={loading} />

      {/* Sections breakdown + Technician performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <ChartCard title="Sections Breakdown" description="Ticket summary per section">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : data?.section_stats && data.section_stats.length > 0 ? (
            <div className="divide-y max-h-72 overflow-y-auto">
              {data.section_stats.map(s => (
                <div key={s.section.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.section.name}</p>
                    <p className="text-xs text-gray-500">{s.technician_count} technician{s.technician_count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-orange-600 font-medium">{s.open_tickets} open</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600">{s.total_tickets} total</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No section data available</p>
          )}
        </ChartCard>

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
            <p className="text-sm text-gray-500 text-center py-6">No technician data available</p>
          )}
        </ChartCard>
      </div>

      {/* Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
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

export default SectionHeadDashboard;
