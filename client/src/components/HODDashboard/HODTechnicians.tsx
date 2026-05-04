import { useMemo } from 'react';
import { useSharedData } from '@/contexts/SharedDataContext';
import { useHODAnalytics } from '@/hooks/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HODTechnicians = () => {
  const { technicians, techniciansLoading, sections } = useSharedData();
  const { data, loading } = useHODAnalytics();

  const campusSectionIds = useMemo(
    () => new Set(data?.section_performance?.map(s => s.section.id) ?? []),
    [data?.section_performance]
  );

  const campusTechnicians = useMemo(
    () => technicians.filter(t => t.sections.some(sId => campusSectionIds.has(sId))),
    [technicians, campusSectionIds]
  );

  const sectionNameMap = useMemo(
    () => new Map(sections.map(s => [s.id, s.name])),
    [sections]
  );

  const isLoading = loading || techniciansLoading;

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Technicians</h2>
        <p className="text-sm text-gray-600">
          {campusTechnicians.length} technician{campusTechnicians.length !== 1 ? 's' : ''}
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
          ) : campusTechnicians.length > 0 ? (
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {campusTechnicians.map(t => {
                const sectionNames = t.sections
                  .map(id => sectionNameMap.get(id) ?? String(id))
                  .join(', ');
                return (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {t.first_name} {t.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{t.email}</p>
                      <p className="text-xs text-gray-500">
                        {sectionNames || 'No section assigned'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No technicians found</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default HODTechnicians;
