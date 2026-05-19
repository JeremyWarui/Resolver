import type { UserRole } from '@/types';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Settings,
  FileText,
  Users,
  Layers,
  BarChart2,
  Building,
  MapPin,
  PenToolIcon as Tool,
  BarChart,
  CalendarIcon,
  TrendingUp,
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export interface SidebarConfig {
  items: SidebarItem[];
  subtitle?: string;
}

export const SIDEBAR_CONFIG: Record<UserRole, SidebarConfig> = {
  user: {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'userTickets', label: 'My Tickets', icon: ClipboardList },
      { id: 'submitTicket', label: 'New Ticket', icon: PlusCircle },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
  technician: {
    items: [
      { id: 'dashboard', label: 'Section Tickets', icon: LayoutDashboard },
      { id: 'assignedTickets', label: 'Assigned Tickets', icon: ClipboardList },
      { id: 'report', label: 'Reports', icon: FileText },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
  head_of_section: {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'tickets', label: 'Tickets', icon: ClipboardList },
      { id: 'technicians', label: 'Technicians', icon: Users },
      { id: 'reports', label: 'Reports', icon: BarChart2 },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    subtitle: 'Section Head Portal',
  },
  hod: {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'tickets', label: 'Campus Tickets', icon: ClipboardList },
      { id: 'technicians', label: 'Technicians', icon: Users },
      { id: 'sections', label: 'Sections', icon: Layers },
      { id: 'reports', label: 'Reports', icon: BarChart2 },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    subtitle: 'Head of Department Portal',
  },
  manager: {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'tickets', label: 'Tickets', icon: ClipboardList },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp },
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    subtitle: 'Manager Portal',
  },
  admin: {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart },
      { id: 'tickets', label: 'Tickets', icon: ClipboardList },
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp },
      { id: 'schedule', label: 'Schedule', icon: CalendarIcon },
      { id: 'technicians', label: 'Technicians', icon: Users },
      { id: 'facilities', label: 'Facilities', icon: Building },
      { id: 'sections', label: 'Sections', icon: Layers },
      { id: 'campuses', label: 'Campuses', icon: MapPin },
      { id: 'departments', label: 'Departments', icon: Layers },
      { id: 'inventory', label: 'Service Catalogue', icon: Tool },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
};
