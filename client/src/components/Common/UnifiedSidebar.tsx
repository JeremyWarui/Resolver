import { LogOut } from 'lucide-react';
import type { UserRole } from '@/types';
import { SIDEBAR_CONFIG } from '@/constants/sidebarConfig';
import NavButton from './NavButton';
import FullScreenLoading from './FullScreenLoading';
import { useLogout } from '@/hooks/useLogout';

interface UnifiedSidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  role: UserRole;
}

export function UnifiedSidebar({ activeSection, onSectionChange, role }: UnifiedSidebarProps) {
  const { handleLogout, isLoading } = useLogout();
  const config = SIDEBAR_CONFIG[role];

  return (
    <>
      {isLoading && <FullScreenLoading message="Logging out..." />}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-[#0078d4]">Resolver 🚀</h1>
          {config.subtitle && <p className="text-xs text-gray-500 mt-1">{config.subtitle}</p>}
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-2">
            {config.items.map(({ id, label, icon: Icon }) => (
              <NavButton
                key={id}
                icon={Icon}
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
}
