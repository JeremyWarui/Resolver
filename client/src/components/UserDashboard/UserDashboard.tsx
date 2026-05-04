import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StatsCards from "@/components/Common/StatsCards";
import PostedTicketsTable from "./PostedTicketsTable";
import useUserData from "@/hooks/users/useUserData";

interface UserDashboardProps {
  onNavigate?: (section: 'dashboard' | 'userTickets' | 'submitTicket' | 'settings') => void;
}

const UserDashboard = ({ onNavigate }: UserDashboardProps) => {
  const { userData, loading: userLoading } = useUserData();

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="flex justify-between mb-2">
        <div>
          <p className="text-md text-gray-600">
            Welcome back, {userLoading ? '...' : [userData?.first_name, userData?.last_name].filter(Boolean).join(' ') || userData?.username || 'User'} 👋
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            className="flex items-center gap-1 bg-[#0078d4] hover:bg-[#106ebe]"
            onClick={() => onNavigate && onNavigate('submitTicket')}
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      <StatsCards />

      <p className="text-sm text-gray-500 mb-2">All tickets in your campus</p>
      <PostedTicketsTable viewOnly={true} />
    </main>
  );
};

export default UserDashboard;
