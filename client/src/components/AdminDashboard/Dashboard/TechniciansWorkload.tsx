import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useTechnicianAnalytics } from "@/hooks/analytics";

const TechniciansWorkload = () => {
  const { data, loading } = useTechnicianAnalytics();
  
  const technicians = data?.technician_performance?.slice(0, 10) || [];

  return (
    <Card className="py-7 px-2">
      <CardHeader className="flex flex-row justify-between pb-5">
        <div>
          <CardTitle className="pb-2">Technician Workload</CardTitle>
          <CardDescription>Works assigned as per Technician</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : technicians.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead className="text-[#0078d4] text-center">
                    Assigned
                  </TableHead>
                  <TableHead className="text-[#107c10] text-center">
                    Resolved
                  </TableHead>
                  <TableHead className="text-[#ffaa44] text-center">
                    Pending
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicians.map((tech) => (
                  <TableRow key={tech.technician_id}>
                    <TableCell className="font-medium text-sm">
                      {tech.technician_name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {tech.section_name}
                    </TableCell>
                    <TableCell className="text-center text-sm text-[#0078d4] font-medium">
                      {tech.total_tickets}
                    </TableCell>
                    <TableCell className="text-center text-sm text-[#107c10] font-medium">
                      {tech.resolved_tickets}
                    </TableCell>
                    <TableCell className="text-center text-sm text-[#ffaa44] font-medium">
                      {tech.pending_tickets}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            <p>No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TechniciansWorkload;
