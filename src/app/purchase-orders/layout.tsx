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
  return (
    <AppShell
      mainNavItems={mainNavItems}
      sidebarNavItems={sidebarNavItems}
      activeModule="Закупки"
    >
      {children}
    </AppShell>
  );
}
