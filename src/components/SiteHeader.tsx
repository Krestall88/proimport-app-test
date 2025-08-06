import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

import UserMenu from './UserMenu';
import { HeaderNavigation } from './HeaderNavigation';

const roleNavLinks = {
  owner: [
    { href: '/manager/analytics', label: 'Руководитель' },
    { href: '/warehouse', label: 'Склад' },
    { href: '/agent', label: 'Панель агента' },
    { href: '/driver/orders', label: 'Водитель' },
  ],
  warehouse_worker: [
    { href: '/warehouse', label: 'Склад' },
  ],
  agent: [
    { href: '/agent', label: 'Панель агента' },
  ],
  driver: [
    { href: '/driver/orders', label: 'Водитель' },
  ],
};

const SiteHeader = async () => {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole: keyof typeof roleNavLinks | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role as keyof typeof roleNavLinks | null;
  }

  // Для owner показываем все панели (agent, warehouse, driver, owner)
  const navLinks = userRole === 'owner'
    ? [
        ...roleNavLinks.owner,
        ...roleNavLinks.warehouse_worker.filter(l => l.href !== '/warehouse'),
        ...roleNavLinks.agent.filter(l => l.href !== '/agent'),
        ...roleNavLinks.driver.filter(l => l.href !== '/driver/orders'),
      ]
    : userRole ? roleNavLinks[userRole] : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <span className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">ProImport</span>
          </span>
          <HeaderNavigation navLinks={navLinks} />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
