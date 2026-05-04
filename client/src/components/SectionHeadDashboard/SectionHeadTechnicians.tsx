import { useMemo } from 'react';
import { useSharedData } from '@/contexts/SharedDataContext';
import { useSectionHeadAnalytics } from '@/hooks/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SectionHeadTechnicians = () => {
  const { technicians, techniciansLoading } = useSharedData();
  const { data, loading } = useSectionHeadAnalytics();

  const techList = useMemo(() => {
    if (!data?.tech_performance) return [];
    return data.tech_performance.map(tp => {
      const full = technicians.find(t => t.id === tp.technician.id);
      return { ...tp, email: full?.email ?? '' };
    });
  }, [data?.tech_performance, technicians]);

  const isLoading = loading || techniciansLoading;

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Technicians</h2>
        <p className="text-sm text-gray-600">
          {techList.length} technician{techList.length !== 1 ? 's' : ''}
        </p>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Technician List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : techList.length > 0 ? (
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {techList.map(tp => (
                <div key={tp.technician.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {tp.technician.name}
                    </p>
                    <p className="text-xs text-gray-500">{tp.email}</p>
                    <p className="text-xs text-gray-500">
                      {tp.technician.sections.join(', ') || 'No section assigned'}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-green-600 font-medium">{tp.resolved} resolved</p>
                    <p className="text-gray-500 text-xs">{tp.total_assigned} total</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No technicians found</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default SectionHeadTechnicians;
