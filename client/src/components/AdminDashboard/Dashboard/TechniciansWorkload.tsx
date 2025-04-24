import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import { ChevronDown } from "lucide-react";

// Sample data for technician workload
const technicianData = [
  { name: "John", section: "Plumbing", assigned: 12, completed: 8 },
  { name: "Sarah", section: "Electrical", assigned: 9, completed: 7 },
  { name: "Mike", section: "IT", assigned: 8, completed: 5 },
  { name: "Lisa", section: "Carpentry", assigned: 6, completed: 4 },
  { name: "David", section: "Masonry", assigned: 3, completed: 2 },
];

const TechniciansWorkload = () => {
  const [technicianTimeframe, setTechnicianTimeframe] = useState("week");
  return (
    <Card className="py-7 px-2">
      <CardHeader className="flex flex-row justify-between pb-5">
        <div>
          <CardTitle className="pb-2">Technician Workload</CardTitle>
          <CardDescription>Works assigned as per Technician</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              {technicianTimeframe === "week"
                ? "This Week"
                : technicianTimeframe === "month"
                  ? "This Month"
                  : "Today"}{" "}
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTechnicianTimeframe("day")}>
              Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTechnicianTimeframe("week")}>
              This Week
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTechnicianTimeframe("month")}>
              This Month
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Technician</TableHead>
                <TableHead >Section</TableHead>
                <TableHead className="text-[#0078d4] text-center">
                  Assigned
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicianData.map((technician) => (
                <TableRow key={technician.name}>
                  <TableCell className="font-medium">{technician.name}</TableCell>
                  <TableCell >{technician.section}</TableCell>
                  <TableCell className="text-center text-[#0078d4]">{technician.assigned}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-medium">Total</TableCell>
                <TableCell className="text-center font-medium text-[#0078d4]">
                  {technicianData.reduce((sum, tech) => sum + tech.assigned, 0)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing tickets assigned as per the technicians in each section
        </div>
      </CardFooter>
    </Card>
  );
};

export default TechniciansWorkload;
