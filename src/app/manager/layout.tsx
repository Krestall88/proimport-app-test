import * as React from 'react';
import { AppShell } from '@/components/shell';
import { createClient } from '@/lib/supabase/server';

import { redirect } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileClock,
  PlusCircle,
  LineChart,
  Heart
} from 'lucide-react';

interface ManagerLayoutProps {
  children: React.ReactNode;
}

import { User } from 'lucide-react';
const navLinks = [
  { href: '/manager/analytics', label: 'Аналитика', icon: <LineChart className="h-5 w-5" /> },
  { href: '/manager/inventory', label: 'Остатки', icon: <Package className="h-5 w-5" /> },
  { href: '/manager/orders', label: 'Заказы клиентов', icon: <ShoppingCart className="h-5 w-5" /> },
  { href: '/manager/applications', label: 'Доп. заказы', icon: <Heart className="h-5 w-5" /> },
  { href: '/manager/suppliers', label: 'Поставщики', icon: <Package className="h-5 w-5" /> },
  { href: '/manager/create-purchase-order', label: 'Создать поставку', icon: <PlusCircle className="h-5 w-5" /> },
  { href: '/manager/audit-log', label: 'Аудит', icon: <FileClock className="h-5 w-5" /> },
  { href: '/manager', label: 'Общий список товаров', icon: <Package className="h-5 w-5" /> },
];

export default async function ManagerLayout({ children }: ManagerLayoutProps) {

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

  // Ensure the user has the 'owner' role to access the manager layout
  if (profile?.role !== 'owner') {
    return redirect('/login?message=Access Denied');
  }

  return (
    <AppShell
      user={user}
      navLinks={navLinks}
      title="Панель руководителя"
      role={profile?.role || 'agent'}
    >
      {children}
    </AppShell>
  );
}
