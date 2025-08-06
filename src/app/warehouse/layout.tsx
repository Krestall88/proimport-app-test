import * as React from 'react';
import { redirect } from 'next/navigation';
import { Package, ShoppingCart, PackageSearch } from 'lucide-react';

import { AppShell } from '@/components/shell';
import WarehouseOrderBadge from './components/WarehouseOrderBadge';

import { createClient } from '@/lib/supabase/server';

import { User } from '@supabase/supabase-js';

interface WarehouseLayoutProps {
  children: React.ReactNode;
}

interface UserWithRole extends User {
  role: 'owner' | 'warehouse_manager';
}

// --- Определение навигационных элементов для модуля Склад ---
const warehouseModule = {
  title: "Склад",
  href: "/warehouse",
  sidebarNav: [
    { title: "Ожидаемые поставки", href: "/warehouse/pending-shipments", icon: <PackageSearch className="h-4 w-4" /> },
    { title: "Заказы клиентов", href: "/warehouse/customer-orders", icon: <ShoppingCart className="h-4 w-4" /> },
    { title: "Остатки по складу", href: "/warehouse/inventory", icon: <Package className="h-4 w-4" /> },
  ]
};

export default async function WarehouseLayout({ children }: WarehouseLayoutProps) {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Доступ только для кладовщика или владельца (owner всегда допускается)
  if (profile?.role !== 'warehouse_manager' && profile?.role !== 'owner') {
    return redirect('/login?message=Access Denied');
  }



  const navLinks = warehouseModule.sidebarNav.map(item => ({
    href: item.href,
    label: item.title,
    icon: item.icon,
  }));




  return (
    <AppShell
      user={user}
      title={warehouseModule.title}
      navLinks={navLinks}
      role={profile?.role || 'warehouse_manager'}
    >
      {children}
    </AppShell>
  );
}
