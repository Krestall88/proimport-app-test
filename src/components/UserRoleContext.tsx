'use client';

import { createContext, useContext, ReactNode } from 'react';

interface UserRoleContextType {
  role: 'owner' | 'warehouse_manager' | 'agent';
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children, role }: { children: ReactNode; role: 'owner' | 'warehouse_manager' | 'agent' }) {
  return (
    <UserRoleContext.Provider value={{ role }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
}
