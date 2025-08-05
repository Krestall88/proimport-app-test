import KpiCard from './KpiCard';
import SalesChart from './SalesChart';
import TopProducts from './TopProducts';
import TopCustomers from './TopCustomers';
import type { AnalyticsKpis, SalesChartDataPoint, TopProduct, TopCustomer } from '@/lib/types';

interface AnalyticsData {
  kpis: AnalyticsKpis;
  salesChartData: SalesChartDataPoint[];
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

// Helper to format numbers as currency
import { formatCurrency } from '@/app/utils/formatCurrency';

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const { kpis, salesChartData, topProducts, topCustomers } = data;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Общая выручка" value={formatCurrency(kpis.total_revenue)} description="За все время" />
        <KpiCard title="Средний чек" value={formatCurrency(kpis.avg_order_value)} />
        <KpiCard title="Всего заказов" value={kpis.total_orders.toString()} />
        <KpiCard title="Стоимость склада" value={formatCurrency(kpis.warehouse_value)} />
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <SalesChart data={salesChartData} />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <TopProducts data={topProducts} />
          <TopCustomers data={topCustomers} />
        </div>
      </div>
    </div>
  );
}
