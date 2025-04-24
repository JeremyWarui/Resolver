import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import {
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ChevronDown } from "lucide-react";

// Sample data for weekly tickets
const weeklyTicketsData = [
  { name: "Mon", tickets: 12 },
  { name: "Tue", tickets: 19 },
  { name: "Wed", tickets: 15 },
  { name: "Thu", tickets: 8 },
  { name: "Fri", tickets: 22 },
  { name: "Sat", tickets: 6 },
  { name: "Sun", tickets: 4 },
];

// Sample data for monthly tickets
const monthlyTicketsData = [
  { name: "Week 1", tickets: 45 },
  { name: "Week 2", tickets: 52 },
  { name: "Week 3", tickets: 49 },
  { name: "Week 4", tickets: 62 },
];

// Sample data for ticket categories
const categoryData = [
  { name: "Electrical", value: 35 },
  { name: "Plumbing", value: 25 },
  { name: "IT", value: 20 },
  { name: "HVAC", value: 15 },
  { name: "Structural", value: 5 },
];

// FluentUI theme colors
const COLORS = ["#0078d4", "#107c10", "#ffaa44", "#d13438", "#5c2d91"];

const ChartSection = () => {
  const [ticketTimeframe, setTicketTimeframe] = useState("week");
  const [categoryTimeframe, setCategoryTimeframe] = useState("week");
  return (
    <div className="grid grid-cols-7 gap-2 mb-2">
      {/* Charts - First Row */}
      <Card className="col-span-4 py-7 px-2">
        <CardHeader className="flex flex-row justify-between pb-5">
          <div>
            <CardTitle className="pb-2">Tickets Raised</CardTitle>
            <CardDescription>Tickets raised within the period</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                {ticketTimeframe === "week" ? "This Week" : "This Month"}{" "}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTicketTimeframe("week")}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTicketTimeframe("month")}>
                This Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-5 pt-1">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={
                  ticketTimeframe === "week"
                    ? weeklyTicketsData
                    : monthlyTicketsData
                }
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                barCategoryGap={50}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={true}
                  stroke="#edebe9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  dy={20}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  width={30}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                          <p className="text-xs font-medium text-gray-800">{`${payload[0].payload.name}`}</p>
                          <p className="text-xs text-gray-600">{`Tickets: ${payload[0].value}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="tickets"
                  fill="#0078d4"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      {/* Ticket Categories Chart */}
      <Card className="col-span-3 py-7 px-2">
        <CardHeader className="flex flex-row justify-between pb-5">
          <div>
            <CardTitle className="pb-2">Ticket Categories</CardTitle>
            <CardDescription>
              Tickets raised as per Sections
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                {categoryTimeframe === "week"
                  ? "This Week"
                  : categoryTimeframe === "month"
                    ? "This Month"
                    : "Today"}{" "}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCategoryTimeframe("day")}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryTimeframe("week")}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryTimeframe("month")}>
                This Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  // fill='#0078d4'
                  paddingAngle={5}
                  dataKey="value"
                  label={({ percent }) => {
                    return `${(percent * 100).toFixed(0)}%`;
                  }}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(value) => {
                    return <span style={{ fontSize: "10px" }}>{value}</span>;
                  }}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                          <p className="text-xs font-medium text-gray-800">{`${payload[0].name}`}</p>
                          <p className="text-xs text-gray-600">{`Tickets: ${payload[0].value}`}</p>
                          {/* <p className='text-xs text-gray-600'>{`Percentage: ${(
                            (payload[0].value / 100) *
                            100
                          ).toFixed(0)}%`}</p> */}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartSection;
