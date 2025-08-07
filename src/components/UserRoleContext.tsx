'use client';

import { createContext, useContext, ReactNode } from 'react';

type UserRole = 'owner' | 'warehouse_manager' | 'agent' | 'driver';

interface UserRoleContextType {
  role: UserRole;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children, role }: { children: ReactNode; role: UserRole }) {
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
