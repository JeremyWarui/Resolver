import {
  BarChart,
  CalendarIcon,
  Settings,
  ClipboardList,
  Users,
  Building,
  PenToolIcon as Tool,
  LogOut,
} from 'lucide-react';
import NavButton from './NavButton';

export interface Section {
  id:
    | 'dashboard'
    | 'tickets'
    | 'schedule'
    | 'technicians'
    | 'facilities'
    | 'inventory'
    | 'settings';
  label: string;
  icon: React.ElementType;
}

interface SideBarProps {
  activeSection: Section["id"];
  onSectionChange: (id: Section["id"]) => void;
}

const SideBar = ({ activeSection, onSectionChange }: SideBarProps) => {

  const sections: Section[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart },
    { id: 'tickets', label: 'Tickets', icon: ClipboardList },
    { id: 'schedule', label: 'Schedule', icon: CalendarIcon },
    { id: 'technicians', label: 'Technicians', icon: Users },
    { id: 'facilities', label: 'Facilities', icon: Building },
    { id: 'inventory', label: 'Inventory', icon: Tool },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className='w-64 bg-white border-r border-gray-200 flex flex-col'>
      <div className='p-6 border-b border-gray-200'>
        <h1 className='text-2xl font-semibold text-[#0078d4]'>Resolver 🚀 </h1>
      </div>
      <div className='flex-1 py-4 overflow-y-auto'>
        <nav className='space-y-1 px-2'>
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
      <div className='p-4 border-t border-gray-200'>
        <button className='flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900'>
          <LogOut className='mr-3 h-5 w-5' />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar;
