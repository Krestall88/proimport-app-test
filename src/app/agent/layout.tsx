import * as React from 'react';
import { createClient } from '@/lib/supabase/server';

import { redirect } from 'next/navigation';

import { AppShell } from '@/components/shell';
import { User, Users, ShoppingCart, PlusCircle, Heart, FileText } from 'lucide-react';

export default async function AgentLayout({ children }: { children: React.ReactNode }) {

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

  // Allow agent and owner roles
  if (profile?.role !== 'agent' && profile?.role !== 'owner') {
    return redirect('/login?message=Access Denied');
  }

  const navLinks = [
    { href: '/agent', label: 'Дашборд', icon: <User className="h-5 w-5" /> },
    { href: '/agent/clients', label: 'Клиенты', icon: <Users className="h-5 w-5" /> },
    { href: '/agent/customer-orders', label: 'Заказы', icon: <ShoppingCart className="h-5 w-5" /> },
    { href: '/agent/customer-orders/create', label: 'Создать заказ', icon: <PlusCircle className="h-5 w-5" /> },
      ];

  return (
    <AppShell
      user={user}
      navLinks={navLinks}
      title="Панель агента"
      role={profile?.role}
    >
      {children}
    </AppShell>
  );
}
