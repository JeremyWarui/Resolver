import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ManagerSectionStat } from '@/types';

interface ManagerSectionPerformanceProps {
  sections: ManagerSectionStat[] | undefined;
  loading: boolean;
}

const ManagerSectionPerformance = ({ sections, loading }: ManagerSectionPerformanceProps) => {
  if (loading) {
    return (
      <Card className="py-7 px-2">
        <CardHeader className="pb-5">
          <CardTitle>Section Performance</CardTitle>
          <CardDescription>Tickets by section</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <Card className="py-7 px-2">
        <CardHeader className="pb-5">
          <CardTitle>Section Performance</CardTitle>
          <CardDescription>Tickets by section</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <p>No section data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-7 px-2">
      <CardHeader className="pb-5">
        <CardTitle>Section Performance</CardTitle>
        <CardDescription>Tickets by section</CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="divide-y max-h-72 overflow-y-auto">
          {sections.map((section, idx) => {
            if (!section || !section.section) return null;
            return (
              <div key={section.section.id ?? idx} className="py-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-400">{idx + 1}</span>
                    <p className="text-sm font-medium text-gray-800">{section.section.name || '—'}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {section.campus?.name || 'No campus'} · {section.section.code || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {(section.escalated ?? 0) > 0 && (
                    <Badge variant="destructive" className="text-xs">{section.escalated ?? 0} escalated</Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">{section.open ?? 0} open</Badge>
                  <Badge variant="outline" className="text-xs">{section.technician_count ?? 0} tech</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerSectionPerformance;
