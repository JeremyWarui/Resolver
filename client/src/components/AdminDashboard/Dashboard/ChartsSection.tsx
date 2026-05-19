import { useMemo } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import ChartCard from "@/components/Common/ChartCard";
import { ChartPlaceholder } from "@/components/Common/ChartPlaceholder";
import { AppBarChart } from "@/components/Common/AppBarChart";
import { AppPieChart } from "@/components/Common/AppPieChart";
import type { TicketAnalytics } from "@/types/analytics.types";

interface ChartSectionProps {
  analyticsData: TicketAnalytics | null;
  loading: boolean;
  ticketTimeframe: 'week' | 'month';
  setTicketTimeframe: (timeframe: 'week' | 'month') => void;
  categoryTimeframe: 'day' | 'week' | 'month';
  setCategoryTimeframe: (timeframe: 'day' | 'week' | 'month') => void;
}

const ChartSection = ({
  analyticsData,
  loading: analyticsLoading,
  ticketTimeframe,
  setTicketTimeframe,
  categoryTimeframe,
  setCategoryTimeframe,
}: ChartSectionProps) => {

  // Transform trend data for bar chart
  const ticketsRaisedData = useMemo(() => {
    if (!analyticsData?.trend_data) return [];

    if (ticketTimeframe === 'week') {
      // For weekly view, show last 7 days with day names
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return analyticsData.trend_data.slice(-7).map(item => {
        const date = new Date(item.period);
        return {
          name: dayNames[date.getDay()],
          tickets: item.count,
        };
      });
    } else {
      // For monthly view, show last 4 weeks
      return analyticsData.trend_data.slice(-4).map((item, index) => ({
        name: `Week ${index + 1}`,
        tickets: item.count,
      }));
    }
  }, [analyticsData, ticketTimeframe]);

  const categoryData = analyticsData?.section_distribution.map(section => ({
    name: section.display_name ?? section.name,
    value: section.ticket_count,
  })) || [];

  const ticketAction = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          {ticketTimeframe === "week" ? "This Week" : "This Month"} <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTicketTimeframe("week")}>This Week</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTicketTimeframe("month")}>This Month</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const categoryAction = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          {categoryTimeframe === "week" ? "This Week" : categoryTimeframe === "month" ? "This Month" : "Today"} <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setCategoryTimeframe("day")}>Today</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCategoryTimeframe("week")}>This Week</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCategoryTimeframe("month")}>This Month</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="grid grid-cols-7 gap-2 mb-2">
      <ChartCard className="col-span-4" title="Tickets Raised" description="Tickets raised within the period" action={ticketAction} contentClassName="p-5 pt-1">
        {analyticsLoading ? (
          <ChartPlaceholder message="Loading ticket data..." />
        ) : ticketsRaisedData.length === 0 ? (
          <ChartPlaceholder message="No data available" />
        ) : (
          <AppBarChart data={ticketsRaisedData} dataKeys="tickets" height={375} />
        )}
      </ChartCard>

      <ChartCard className="col-span-3" title="Ticket Categories" description="Tickets raised as per Sections" action={categoryAction} contentClassName="p-4 pt-0">
        {analyticsLoading ? (
          <ChartPlaceholder message="Loading categories..." />
        ) : categoryData.length === 0 ? (
          <ChartPlaceholder message="No data available" />
        ) : (
          <AppPieChart data={categoryData} height={375} innerRadius={75} outerRadius={120} />
        )}
      </ChartCard>
    </div>
  );
};

export default ChartSection;
