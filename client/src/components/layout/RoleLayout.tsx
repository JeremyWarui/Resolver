import type { ReactNode } from 'react';
import type { UserRole, User } from '@/types';
import { AppSidebar } from './AppSidebar';
import FullScreenLoading from '@/components/shared/feedback/FullScreenLoading';

interface RoleLayoutProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  role: UserRole;
  title: string;
  currentUser?: User | null;
  loading?: boolean;
  children: ReactNode;
}

export function RoleLayout({ loading = false, children }: RoleLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {loading && <FullScreenLoading message="Loading your dashboard..." />}
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
