import * as React from 'react';
import { AppShell } from '@/components/shell';
import { List, PlusCircle } from 'lucide-react';

interface PurchaseOrdersLayoutProps {
  children: React.ReactNode;
}

const mainNavItems = [
  {
    title: "Дашборд руководителя",
    href: "/manager",
  },
  {
    title: "Закупки",
    href: "/purchase-orders",
  },
];

const sidebarNavItems = [
  {
    title: "Все заказы",
    href: "/purchase-orders",
    icon: <List className="h-4 w-4" />,
  },
  {
    title: "Создать заказ",
    href: "/purchase-orders/create",
    icon: <PlusCircle className="h-4 w-4" />,
  },
];

export default function PurchaseOrdersLayout({ children }: PurchaseOrdersLayoutProps) {
  // Convert sidebarNavItems to the format expected by AppShell
  const navLinks = sidebarNavItems.map(item => ({
    href: item.href,
    label: item.title,
    icon: item.icon,
    notificationBadgeCount: undefined,
  }));

  return (
    <AppShell
      user={null}
      navLinks={navLinks}
      title="Закупки"
      role="owner"
    >
      {children}
    </AppShell>
  );
}
