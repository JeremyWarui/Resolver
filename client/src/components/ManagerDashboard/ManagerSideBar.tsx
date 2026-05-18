import { LayoutDashboard, ClipboardList, BarChart2, Settings, LogOut } from 'lucide-react';
import NavButton from '@/components/Common/NavButton';
import FullScreenLoading from '@/components/Common/FullScreenLoading';
import { useLogout } from '@/hooks/useLogout';

export type ManagerSection = 'dashboard' | 'tickets' | 'reports' | 'settings';

interface SideBarProps {
  activeSection: ManagerSection;
  onSectionChange: (id: ManagerSection) => void;
}

const ManagerSideBar = ({ activeSection, onSectionChange }: SideBarProps) => {
  const { handleLogout, isLoading } = useLogout();

  const sections = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tickets' as const, label: 'Department Tickets', icon: ClipboardList },
    { id: 'reports' as const, label: 'Analytics', icon: BarChart2 },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {isLoading && <FullScreenLoading message="Logging out..." />}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-[#0078d4]">Resolver 🚀</h1>
          <p className="text-xs text-gray-500 mt-1">Manager Portal</p>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-2">
            {sections.map(({ id, label, icon }) => (
              <NavButton
                key={id}
                icon={icon}
                label={label}
                isActive={activeSection === id}
                onClick={() => onSectionChange(id)}
              />
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default ManagerSideBar;
