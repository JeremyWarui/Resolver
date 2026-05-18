import { useManagerDashboard } from '@/contexts/ManagerDashboardContext';
import ManagerStatsCards from './ManagerStatsCards';
import ManagerCampusBreakdown from './ManagerCampusBreakdown';
import ManagerSectionPerformance from './ManagerSectionPerformance';
import ManagerTechnicianWorkload from './ManagerTechnicianWorkload';
import ManagerStatusDistribution from './ManagerStatusDistribution';

const ManagerDashboard = () => {
  const { data, loading } = useManagerDashboard();

  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Department Overview</h1>
        {data?.department && (
          <p className="text-sm text-gray-600">
            {data.department.name} · {data.department.code} ·{' '}
            {data.department.campuses_count} campus{data.department.campuses_count !== 1 ? 'es' : ''}
          </p>
        )}
      </div>

      {/* Overview stats */}
      <ManagerStatsCards loading={loading} />

      {/* Campus breakdown + Section Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <ManagerCampusBreakdown campuses={data?.by_campus} loading={loading} />
        <ManagerSectionPerformance sections={data?.by_section} loading={loading} />
      </div>

      {/* Status Distribution */}
      <div className="mb-2">
        <ManagerStatusDistribution statusData={data?.status_distribution} loading={loading} />
      </div>

      {/* Technician Workload */}
      <div className="mb-2">
        <ManagerTechnicianWorkload technicians={data?.technicians} loading={loading} />
      </div>
    </main>
  );
};

export default ManagerDashboard;
