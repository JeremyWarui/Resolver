import { FacilityChart } from "./FacilityChart";
import TechniciansWorkload from "./TechniciansWorkload";

const FacilityAndWorkload = () => {
  // const [facilityTimeframe, setFacilityTimeframe] = useState("week")
  
  return (
    <div className="grid grid-cols-2 gap-2 mb-2">
      {/* Facility Distribution */}
      <FacilityChart />
      {/* Technician Workload */}
      <TechniciansWorkload />
      {/* Recent Tickets */}

      
    </div>
  );
};

export default FacilityAndWorkload;
