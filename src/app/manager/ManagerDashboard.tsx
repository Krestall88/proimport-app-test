'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InventoryTable from './InventoryTable';
import CustomerOrdersList from './CustomerOrdersList';
import ReceiptsWithComments from './ReceiptsWithComments';
import CustomerList from './CustomerList'; // Импортируем новый компонент
import AnalyticsDashboard from './analytics/AnalyticsDashboard'; // Импортируем дашборд аналитики
import type { ManagerInventoryItem, ManagerOrderItem, ManagerGoodsReceipt, CustomerInfo, AnalyticsKpis, SalesChartDataPoint, TopProduct, TopCustomer } from '@/lib/types';

interface AnalyticsData {
  kpis: AnalyticsKpis;
  salesChartData: SalesChartDataPoint[];
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
}

interface ManagerDashboardProps {
  inventory: ManagerInventoryItem[];
  customerOrders: ManagerOrderItem[];
  goodsReceipts: ManagerGoodsReceipt[];
  customers: CustomerInfo[];
  analyticsData: AnalyticsData; // Добавляем данные аналитики
}

export default function ManagerDashboard({
  analyticsData,
}: {
  analyticsData: AnalyticsData;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Обзор</h3>
        <p className="text-sm text-muted-foreground">
          Ключевые показатели и аналитика вашего бизнеса.
        </p>
      </div>
      <AnalyticsDashboard data={analyticsData} />
    </div>
  );
}
