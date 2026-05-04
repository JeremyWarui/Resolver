import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import TechTicketsTable from './TechTickets';
import type { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface TechTicketsPageProps {
  userData?: User | null;
}

const TechTicketsPage = ({ userData }: TechTicketsPageProps) => {
  const { user } = useAuth();
  const technicianId = user?.id;

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
      <div className="flex justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Assigned Tickets</h1>
          <p className="text-sm text-gray-600">
            Welcome back, {userData?.first_name || 'Technician'} 👋 Manage your assigned work
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <TechTicketsTable currentTechnicianId={technicianId} />
    </div>
  );
};

export default TechTicketsPage;
