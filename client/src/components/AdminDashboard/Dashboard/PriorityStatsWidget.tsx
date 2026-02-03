import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Inbox } from "lucide-react";
import { useSharedData } from '@/contexts/SharedDataContext';
import { Skeleton } from "@/components/ui/skeleton";

interface PriorityStatsWidgetProps {
  onFilterClick?: (filterType: 'overdue' | 'unassigned') => void;
}

export default function PriorityStatsWidget({ onFilterClick }: PriorityStatsWidgetProps) {
  const { adminAnalytics, analyticsLoading: loading } = useSharedData();

  const overdueCount = adminAnalytics?.overdue_tickets?.length || 0;
  const unassignedCount = adminAnalytics?.system_overview?.open_tickets || 0;

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
      {/* Overdue Tickets */}
      <Card
        onClick={() => onFilterClick?.('overdue')}
        className={`cursor-pointer transition-all hover:shadow-md ${
          overdueCount > 0 ? 'border-red-200 bg-red-50/50' : 'bg-white'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className={`mr-4 p-3 rounded-full ${
              overdueCount > 0 ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <AlertTriangle className={`h-6 w-6 ${
                overdueCount > 0 ? 'text-red-600' : 'text-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Overdue Tickets</p>
              <p className={`text-2xl font-bold mt-1 ${
                overdueCount > 0 ? 'text-red-600' : 'text-gray-800'
              }`}>
                {overdueCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {overdueCount > 0 ? 'Need attention' : 'All on track'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unassigned Tickets */}
      <Card
        onClick={() => onFilterClick?.('unassigned')}
        className={`cursor-pointer transition-all hover:shadow-md ${
          unassignedCount > 0 ? 'border-blue-200 bg-blue-50/50' : 'bg-white'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className={`mr-4 p-3 rounded-full ${
              unassignedCount > 0 ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Inbox className={`h-6 w-6 ${
                unassignedCount > 0 ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Unassigned Tickets</p>
              <p className={`text-2xl font-bold mt-1 ${
                unassignedCount > 0 ? 'text-blue-600' : 'text-gray-800'
              }`}>
                {unassignedCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {unassignedCount > 0 ? 'Need assignment' : 'All assigned'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
