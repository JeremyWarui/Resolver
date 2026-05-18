import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHODDashboard } from '@/contexts/HODDashboardContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const HODSections = () => {
  const { data, loading } = useHODDashboard();

  const sections = data?.by_section ?? [];

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Sections</h2>
        <p className="text-sm text-gray-600">
          {sections.length} section{sections.length !== 1 ? 's' : ''} under {data?.campus_department?.department?.name ?? 'your department'}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Section Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : sections.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-xs font-semibold text-gray-700">Section Name</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700">Code</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700">Head of Section</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-gray-700">Technicians</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-gray-700">Open Tickets</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-gray-700">Total Tickets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map(s => (
                    <TableRow key={s.section.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <TableCell className="py-3">
                        <p className="text-sm font-medium text-gray-800">{s.section.name}</p>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className="text-xs">{s.section.code}</Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-sm text-gray-600">{s.section.section_type ?? '—'}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-sm text-gray-600">
                          {s.head_of_section?.name ?? 'Unassigned'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span className="text-sm font-medium text-gray-800">{s.technician_count}</span>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span className="text-sm font-medium text-orange-600">{s.open}</span>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span className="text-sm text-gray-600">{s.total}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No sections found for your department</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default HODSections;
