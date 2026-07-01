import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { usePerformanceTechnicians } from '@/hooks/analytics';
import type { AnalyticsParams } from '@/types';

interface ManagerTechnicianWorkloadProps {
  params?: AnalyticsParams;
}

const ManagerTechnicianWorkload = ({ params = { days: 30 } }: ManagerTechnicianWorkloadProps) => {
  const { data: perfTechs, loading } = usePerformanceTechnicians(params);
  const technicians = perfTechs?.breakdown;
  return (
    <Card className="py-7 px-2">
      <CardHeader className="flex flex-row justify-between pb-5">
        <div>
          <CardTitle>Top Technicians</CardTitle>
          <CardDescription>Workload assigned per technician</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : technicians && technicians.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead className="text-primary text-center">
                    Assigned
                  </TableHead>
                  <TableHead className="text-status-resolved text-center">
                    Resolved
                  </TableHead>
                  <TableHead className="text-status-progress text-center">
                    Avg Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicians.map((tech, idx) => (
                  <TableRow key={tech.technician_id ?? idx}>
                    <TableCell className="font-medium text-sm">
                      <div>
                        <p>{tech.first_name && tech.last_name ? `${tech.first_name} ${tech.last_name}` : tech.username}</p>
                        <p className="text-xs text-muted-foreground">@{tech.username}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-primary font-medium">
                      {tech.total_assigned}
                    </TableCell>
                    <TableCell className="text-center text-sm text-status-resolved font-medium">
                      {tech.resolved_count}
                    </TableCell>
                    <TableCell className="text-center text-sm text-status-progress font-medium">
                      —
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            <p>No technician data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManagerTechnicianWorkload;
