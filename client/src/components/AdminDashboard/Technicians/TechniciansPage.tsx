// import { Button } from "@/components/ui/button";
// import { Plus, Filter, Download } from "lucide-react";
import TechniciansTable from "./TechniciansTable";
import StatsCards from "../../Common/StatsCards";
import { useMemo } from "react";

const TechniciansPage = () => {
  // Create a props object to customize the StatsCards to show only technician stats
  const statsProps = useMemo(() => ({
    showTechnicianStatsOnly: true
  }), []);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="flex justify-between mb-2">
        <div>
          <p className="text-sm text-gray-600">
            Manage technicians in all the sections
          </p>
        </div>
      </div>

      {/* Add StatsCards component for technician statistics */}
      <StatsCards {...statsProps} />
      
      <TechniciansTable />
    </div>
  );
};

export default TechniciansPage;
