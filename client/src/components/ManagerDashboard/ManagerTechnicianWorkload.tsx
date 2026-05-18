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
import type { ManagerTechnicianStat } from '@/types';

interface ManagerTechnicianWorkloadProps {
  technicians: ManagerTechnicianStat[] | undefined;
  loading: boolean;
}

const ManagerTechnicianWorkload = ({ technicians, loading }: ManagerTechnicianWorkloadProps) => {
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
                  <TableHead className="text-[#0078d4] text-center">
                    Assigned
                  </TableHead>
                  <TableHead className="text-[#107c10] text-center">
                    Resolved
                  </TableHead>
                  <TableHead className="text-[#ffaa44] text-center">
                    Avg Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicians.map((tech) => (
                  <TableRow key={tech.technician.id}>
                    <TableCell className="font-medium text-sm">
                      <div>
                        <p>{tech.technician.name || tech.technician.username}</p>
                        <p className="text-xs text-gray-500">@{tech.technician.username}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-[#0078d4] font-medium">
                      {tech.total_assigned}
                    </TableCell>
                    <TableCell className="text-center text-sm text-[#107c10] font-medium">
                      {tech.resolved}
                    </TableCell>
                    <TableCell className="text-center text-sm text-[#ffaa44] font-medium">
                      {tech.avg_resolution_hours != null
                        ? `${Math.round(tech.avg_resolution_hours)}h`
                        : '—'}
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
