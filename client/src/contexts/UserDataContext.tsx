import { createContext, useContext, type ReactNode } from 'react';
import { useUserData } from '@/hooks/users';
import type { User } from '@/types';

interface UserDataContextType {
  userData: User | null;
  loading: boolean;
  refetch: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { userData, loading, refetch } = useUserData();

  return (
    <UserDataContext.Provider value={{ userData, loading, refetch }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useCurrentUser = (): UserDataContextType => {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useCurrentUser must be used within UserDataProvider');
  return ctx;
};
