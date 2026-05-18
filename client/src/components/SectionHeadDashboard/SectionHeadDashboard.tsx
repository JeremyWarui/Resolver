import { useSectionHeadDashboard } from '@/contexts/SectionHeadDashboardContext';
import SectionHeadStatsCards from './SectionHeadStatsCards';
import SectionHeadChartsSection from './SectionHeadChartsSection';
import ChartCard from '@/components/Common/ChartCard';

const SectionHeadDashboard = () => {
  const { data, loading } = useSectionHeadDashboard();

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Section Overview</h2>
        {data?.head_of_section && (
          <p className="text-sm text-gray-600">
            {data.head_of_section.sections_count} section{data.head_of_section.sections_count !== 1 ? 's' : ''} managed
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
          ) : data?.by_section && data.by_section.length > 0 ? (
            <div className="divide-y max-h-72 overflow-y-auto">
              {data.by_section.map(s => (
                <div key={s.section.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.section.name}</p>
                    <p className="text-xs text-gray-500">{s.technician_count} technician{s.technician_count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-orange-600 font-medium">{s.open} open</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600">{s.total} total</span>
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
            <p className="text-sm text-gray-500 text-center py-6">No technician data available</p>
          )}
        </ChartCard>
      </div>
    </main>
  );
};

export default SectionHeadDashboard;
