import * as React from 'react';
import { AppShell } from '@/components/shell';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Truck, ListChecks } from 'lucide-react';

const navLinks = [
  { href: '/driver/analytics', label: 'Аналитика', icon: <ListChecks className="h-5 w-5" /> },
  { href: '/driver/orders', label: 'Заказы', icon: <Truck className="h-5 w-5" /> },
];

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
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

  // Allow access for both 'driver' and 'owner' (superuser)
  if (profile?.role !== 'driver' && profile?.role !== 'owner') {
    return redirect('/login?message=Access Denied');
  }

  return (
    <AppShell
      user={user}
      navLinks={navLinks}
      title="Модуль водителя"
      role={profile?.role || 'driver'}
    >
      {children}
    </AppShell>
  );
}
