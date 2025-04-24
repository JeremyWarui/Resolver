import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
type TimePeriodData = {
  [key in "today" | "week" | "month"]: { name: string; value: number }[];
};

// Sample data for facilities
const timePeriodsData: TimePeriodData = {
  today: [
    { name: "Mekatilili", value: 15 },
    { name: "Admin Block", value: 8 },
    { name: "Habel Nyamu", value: 12 },
    { name: "Sacho", value: 3 },
    { name: "Wamalwa", value: 5 },
    { name: "Margaret", value: 7 },
    { name: "Residential Area", value: 9 },
    { name: "Sawe", value: 6 },
    { name: "Maasai Mara", value: 2 },
  ],
  week: [
    { name: "Mekatilili", value: 35 },
    { name: "Admin Block", value: 18 },
    { name: "Habel Nyamu", value: 22 },
    { name: "Sacho", value: 6 },
    { name: "Wamalwa", value: 8 },
    { name: "Margaret", value: 12 },
    { name: "Residential Area", value: 15 },
    { name: "Sawe", value: 10 },
    { name: "Maasai Mara", value: 3 },
  ],
  month: [
    { name: "Mekatilili", value: 60 },
    { name: "Admin Block", value: 25 },
    { name: "Habel Nyamu", value: 30 },
    { name: "Sacho", value: 8 },
    { name: "Wamalwa", value: 10 },
    { name: "Margaret", value: 15 },
    { name: "Residential Area", value: 20 },
    { name: "Sawe", value: 18 },
    { name: "Maasai Mara", value: 4 },
  ],
};

const timePeriodLabels = {
  today: "Today",
  week: "This Week",
  month: "This Month",
};

const chartConfig = {
  value: {
    label: "Tickets",
    color: "hsl(210, 100%, 50%)", // Blue color
  },
  label: {
    color: "gray", // Changed to black
  },
} satisfies ChartConfig; 

type TimePeriod = "today" | "week" | "month";
export function FacilityChart() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");

  const facilityData: { name: string; value: number }[] = timePeriodsData[timePeriod];
  // Find the maximum value in the current data
  const maxValue = Math.max(...facilityData.map((item) => item.value));
  return (
    <Card className="py-7 px-2">
      <CardHeader className="flex flex-row justify-between pb-5">
        <div>
          <CardTitle className="pb-2">Facility vs Tickets</CardTitle>
          <CardDescription>Current tickets as per facility</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              {timePeriodLabels[timePeriod]}{" "}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTimePeriod("today")}>
              Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimePeriod("week")}>
              This Week
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimePeriod("month")}>
              This Month
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-w-[500px]">
          <BarChart
            accessibilityLayer
            data={facilityData}
            layout="vertical"
            margin={{
              left: 3,
              right: 30,
              top: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "gray" }}
              width={100}
              tickFormatter={(value) => value}
            />
            <XAxis
              dataKey="value"
              type="number"
              domain={[0, maxValue]} // Set domain to go from 0 to our calculated upper limit
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="value"
              layout="vertical"
              fill="hsl(210, 100%, 50%)"
              radius={4}
            >
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                className="fill-black"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing tickets raised in regards to facilities
        </div>
      </CardFooter>
    </Card>
  );
}
