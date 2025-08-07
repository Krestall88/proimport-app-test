import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import StatusBadge from '../StatusBadge';
import { Order } from '@/lib/types';
import OrderStatusChart from '@/components/charts/OrderStatusChart';
import RevenueChart from '@/components/charts/RevenueChart';
import TopClientsChart from '@/components/charts/TopClientsChart';

const formatCurrency = (amount: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
  <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
    <div className="bg-gray-700 p-3 rounded-lg">{icon}</div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

async function OwnerDashboard() {
  const supabase = await createClient();

  // Fetch all stats in parallel for efficiency
  const [
    revenueRes,
    pendingOrdersRes,
    deliveredOrdersRes,
    customersRes,
    recentOrdersRes,
    orderStatsRes,
    dailyRevenueRes,
    topClientsRes
  ] = await Promise.all([
    supabase.from('customer_order_items').select('quantity, price_per_unit, customer_orders!inner(status)').eq('customer_orders.status', 'delivered'),
    supabase.from('customer_orders').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('customer_orders').select('id', { count: 'exact' }).eq('status', 'delivered'),
    supabase.from('customers').select('id', { count: 'exact' }),
    supabase.from('customer_orders').select('id, created_at, customers(name), status, customer_order_items(quantity, products(title))').order('created_at', { ascending: false }).limit(5),
    supabase.from('customer_orders').select('status').returns<Array<{ status: string }>>(),
    supabase.rpc('get_daily_revenue', { days_ago: 30 }),
    supabase.rpc('get_top_customers'),
  ]);

  // Process stats
  const totalRevenue = revenueRes.data?.reduce((sum, item) => sum + item.quantity * item.price_per_unit, 0) ?? 0;
  const pendingOrdersCount = pendingOrdersRes.count ?? 0;
  const deliveredOrdersCount = deliveredOrdersRes.count ?? 0;
  const totalCustomers = customersRes.count ?? 0;
  const recentOrders: Order[] = recentOrdersRes.data || [];

  // Process chart data
  const statusCounts = orderStatsRes.data?.reduce((acc, { status }) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  const revenueChartData = (dailyRevenueRes.data || []).map((d: any) => ({ ...d, date: new Date(d.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }) }));
  const topClientsData = topClientsRes.data?.map(client => ({ name: client.name, total: client.revenue })) ?? [];

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Панель владельца</h2>
        <div className="flex items-center gap-4">
            <Link href="/inventory" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Инвентарь
            </Link>
            <Link href="/purchase-orders" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Управление закупками
            </Link>
        </div>
    </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Общий доход" value={formatCurrency(totalRevenue)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-green-400"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
        <StatCard title="Заказы в ожидании" value={pendingOrdersCount} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-yellow-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
        <StatCard title="Выполнено заказов" value={deliveredOrdersCount} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>} />
        <StatCard title="Всего клиентов" value={totalCustomers} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-teal-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
      </div>

      {/* Chart and Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <OrderStatusChart data={chartData} />
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
        <div className="xl:col-span-2">
          <RevenueChart data={revenueChartData} />
        </div>
        <div className="xl:col-span-1">
          <TopClientsChart data={topClientsData} />
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Последние заказы</h3>
          <div className="overflow-y-auto max-h-[300px]">
            <table className="min-w-full text-left">
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
                    <td className="p-3">
                      <div className="ml-4 space-y-1">
                        <p className="font-medium">{order.customer_order_items.map(item => item.products?.title).join(', ') || 'Заказ'}</p>
                        <p className="text-sm text-muted-foreground">Клиент: {order.customers?.name ?? 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <StatusBadge status={order.status} />
                      <p className="text-sm text-gray-400 mt-1">{formatDate(order.created_at)}</p>
                    </td>
                    <td className="p-3 text-right">
                      <Link href={`/customer-orders/${order.id}`} className="text-blue-400 hover:underline text-sm">
                        Детали
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
