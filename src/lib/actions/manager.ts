'use server';

import { createClient } from '@/lib/supabase/server';

// Здесь будет вся серверная логика для модуля руководителя

/**
 * TODO: Получение остатков на складе с детализацией по ценам
 */
import type { ManagerInventoryItem } from '@/lib/types';

/**
 * Fetches inventory data with pricing details for the manager's dashboard.
 * Uses the new RPC function that accounts for customer order reservations.
 */
export async function getInventoryForManager(): Promise<ManagerInventoryItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_inventory_with_reservations');

  if (error) {
    console.error('Error fetching manager inventory:', error);
    return [];
  }

  return (data ?? []).map((item: any) => ({
    id: item.id || `${item.product_id}-${item.batch_number}-${item.expiry_date}`,
    product_id: item.product_id,
    product: {
      title: item.product_name,
      nomenclature_code: item.nomenclature_code ?? '',
      batch_number: item.batch_number,
      expiry_date: item.expiry_date,
      unit: item.unit,
      category: item.category,
      description: item.description,
    },
    available_quantity: item.available_quantity,
    purchase_price: item.purchase_price,
    final_price: item.final_price,
    total_received: item.total_received,
    total_reserved: item.total_reserved,
    characteristics: item.characteristics
  })) as ManagerInventoryItem[];
}

/**
 * TODO: Получение заказов клиентов
 */
import type { ManagerOrderItem } from '@/lib/types';

/**
 * Fetches customer orders for the manager's dashboard.
 * Uses the `manager_customer_orders_view`.
 */
export interface ManagerOrdersFilters {
  supplierName?: string;
  dateFrom?: string; // ISO string
  dateTo?: string;   // ISO string
}

export async function getCustomerOrdersForManager(filters: ManagerOrdersFilters = {}): Promise<ManagerOrderItem[]> {
  const supabase = await createClient();
  let query = supabase.from('manager_orders_view').select('*');

  if (filters.supplierName) {
    query = query.eq('supplier_name', filters.supplierName);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }

  // View уже возвращает плоский массив позиций заказов
  // Явное преобразование и заполнение обязательных полей
  return (data ?? []).map((item: any) => ({
    purchase_order_id: item.purchase_order_id || '',
    created_at: item.created_at || '',
    shipped_at: item.shipped_at || null,
    status: item.status || '',
    customer_name: item.customer_name || '',
    order_item_id: item.order_item_id || '',
    product: item.product || {
      id: '',
      title: '',
      nomenclature_code: '',
      description: '',
      purchase_price: null,
      selling_price: null,
      category: '',
      unit: '',
      expiry_date: '',
      batch_number: '',
      created_at: '',
      supplier_id: null
    },
    available_quantity: item.available_quantity ?? 0,
    purchase_price: item.purchase_price ?? 0,
    final_price: item.final_price ?? 0,
    item_total: item.item_total ?? 0,
  })) as ManagerOrderItem[];
}

/**
 * TODO: Получение принятых товаров с комментариями кладовщиков
 */
import type { ManagerGoodsReceipt } from '@/lib/types';

/**
 * Fetches goods receipts that have comments from warehouse staff.
 * Uses the `manager_receipts_view`.
 */
export async function getGoodsReceiptsWithComments(): Promise<ManagerGoodsReceipt[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('manager_receipts_view')
    .select('*')
    .order('receipt_date', { ascending: false });

  if (error) {
    console.error('Error fetching receipts with comments:', error);
    return [];
  }

  // Явное преобразование и заполнение обязательных полей
  return (data ?? []).map((item: any) => ({
    id: item.id || '',
    created_at: item.created_at || '',
    supplier_name: item.supplier_name || '',
    purchase_order_id: item.purchase_order_id || '',
    status: item.status || '',
    notes: item.notes || '',
    description: item.description || '',
  })) as ManagerGoodsReceipt[];
}

import { CustomerInfo } from '@/lib/types';

/**
 * Fetches a list of unique customers from the database.
 * Uses a remote procedure call (RPC) to `get_unique_customers`.
 */
export async function getCustomers(): Promise<CustomerInfo[]> {
  const supabase = await createClient();

  // TODO: реализовать корректный RPC или убрать вызов, если его нет
  // const { data, error } = await supabase.rpc('get_unique_customers');
  const data: any[] = [];
  const error = null;

  if (error) {
    console.error('Error fetching unique customers:', error);
    return [];
  }

  // Явное преобразование к CustomerInfo[]
  return (data ?? []).map((item: any) => ({
    customer_id: item.customer_id || '',
    name: item.name || '',
    contacts: item.contacts || null,
    tin: item.tin || '',
    kpp: item.kpp || '',
    delivery_address: item.delivery_address || '',
    payment_terms: item.payment_terms || '',
  })) as CustomerInfo[];
}

export async function createPurchaseOrder(data: any) {
  // TODO: Реализовать реальное создание заказа через Supabase
  // Пока что возвращаем успешный результат для теста UI
  return { success: true, message: 'Заказ на поставку создан (моделирование).' };
}

// --- Analytics Actions ---



/**
 * Fetches pending purchase orders for the manager's dashboard.
 * Uses the `purchase_orders_for_dashboard` view.
 */
import type { PurchaseOrder } from '@/lib/types';
// TODO: Убедиться, что тип PurchaseOrder экспортируется из types.ts
export async function getPurchaseOrdersForManager(): Promise<PurchaseOrder[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('manager_orders_view') // Используем существующую view вместо несуществующей
    .select('*')
    .eq('status', 'pending')
    .order('expected_delivery_date', { ascending: true });

  if (error) {
    console.error('Error fetching purchase orders for manager:', error);
    return [];
  }

  // Явное преобразование к PurchaseOrder[]
  return (data ?? []).map((item: any) => ({
    id: item.id || '',
    created_at: item.created_at || '',
    expected_delivery_date: item.expected_delivery_date || null,
    status: item.status || '',
    supplier_id: item.supplier_id || '',
    supplier: item.supplier || null,
    purchase_order_items: item.purchase_order_items || [],
  })) as PurchaseOrder[];
}

// --- Analytics Actions ---

import type { AnalyticsKpis, SalesChartDataPoint, TopProduct, TopCustomer } from '@/lib/types';

interface AnalyticsData {
  kpis: AnalyticsKpis;
  salesChartData: SalesChartDataPoint[];
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
}

// Placeholder function assuming these RPCs exist in Supabase
export async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = await createClient();

  // Fetch all analytics data in parallel
  const [
    { data: kpis, error: kpisError },
    { data: salesChartData, error: salesChartError },
    { data: topProducts, error: topProductsError },
    { data: topCustomers, error: topCustomersError },
  ] = await Promise.all([
    supabase.rpc('get_analytics_kpis'),
    supabase.rpc('get_sales_chart_data'),
    supabase.rpc('get_top_products'),
    supabase.rpc('get_top_customers'),
  ]);

  if (kpisError) console.error('Error fetching KPIs:', kpisError);
  if (salesChartError) console.error('Error fetching sales chart data:', salesChartError);
  if (topProductsError) console.error('Error fetching top products:', topProductsError);
  if (topCustomersError) console.error('Error fetching top customers:', topCustomersError);

  // Return fetched data or fallbacks to prevent crashes
  return {
    kpis: kpis?.[0] || { total_revenue: 0, avg_order_value: 0, total_orders: 0, warehouse_value: 0 },
    salesChartData: (salesChartData ?? []).map((point: any) => ({
      name: point.month || '',
      total: point.total_revenue ?? 0,
    })) as SalesChartDataPoint[],
    topProducts: topProducts || [],
    topCustomers: topCustomers || [],
  };
}
