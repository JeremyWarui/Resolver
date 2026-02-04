import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import StatsCards from "@/components/Common/StatsCards";
import PostedTicketsTable from "./PostedTicketsTable";
import useUserData from "@/hooks/users/useUserData";

// Define props to receive the section change function
interface UserDashboardProps {
  onNavigate?: (section: 'dashboard' | 'userTickets' | 'submitTicket' | 'settings') => void;
}

const UserDashboard = ({ onNavigate }: UserDashboardProps) => {
  // Get current user data for the welcome message only
  const { userData, loading: userLoading } = useUserData();
  
  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="flex justify-between mb-2">
        <div>
          <p className="text-md text-gray-600">
            Welcome back, {userLoading ? '...' : userData ? `${userData.first_name} ${userData.last_name}` : 'User'} 👋
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
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

      {/* Stats Cards - Show ticket stats */}
      <StatsCards />
      
      {/* All tickets in the system - no user filter */}
      <PostedTicketsTable />
    </main>
  );
}
export default UserDashboard;

