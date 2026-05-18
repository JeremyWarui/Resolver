import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UserStatsCards from "@/components/Common/UserStatsCards";
import PostedTicketsTable from "./PostedTicketsTable";
import { useCurrentUser } from "@/contexts/UserDataContext";
import { useUserDashboard } from "@/contexts/UserDashboardContext";

interface UserDashboardProps {
  onNavigate?: (section: 'dashboard' | 'userTickets' | 'submitTicket' | 'settings') => void;
}

const UserDashboard = ({ onNavigate }: UserDashboardProps) => {
  const { userData, loading: userLoading } = useCurrentUser();
  const { setUserTickets, refetch } = useUserDashboard();

  // Refetch dashboard data on component mount (e.g., when a new ticket is created and remounts)
  useEffect(() => {
    refetch();
  }, [refetch]);

  const welcomeName = userLoading
    ? '...'
    : [userData?.first_name, userData?.last_name].filter(Boolean).join(' ') || userData?.username || 'User';

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="flex justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back, {welcomeName} 👋</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            className="flex items-center gap-1 bg-[#0078d4] hover:bg-[#106ebe]"
            onClick={() => onNavigate?.('submitTicket')}
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      <UserStatsCards />

      <p className="text-sm text-gray-500 mb-2">Recent tickets</p>
      <PostedTicketsTable viewOnly={true} onDataFetched={setUserTickets} />
    </main>
  );
};

export default UserDashboard;
