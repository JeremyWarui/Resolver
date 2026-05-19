import type { ReactNode } from 'react';
import type { UserRole, User } from '@/types';
import { UnifiedSidebar } from './UnifiedSidebar';
import Header from './Header';
import FullScreenLoading from './FullScreenLoading';

interface RoleLayoutProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  role: UserRole;
  title: string;
  currentUser?: User | null;
  loading?: boolean;
  children: ReactNode;
}

export function RoleLayout({
  activeSection,
  onSectionChange,
  role,
  title,
  currentUser,
  loading = false,
  children,
}: RoleLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {loading && <FullScreenLoading message="Loading your dashboard..." />}
      <UnifiedSidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        role={role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={title}
          searchPlaceholder="Search..."
          currentUser={currentUser}
          onSearchChange={() => {}}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
