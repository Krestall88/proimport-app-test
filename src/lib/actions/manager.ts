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
    product_title: item.product_name, // название товара
    sku: item.sku,
    quantity: item.available_quantity, // остаток
    purchase_price: item.purchase_price,
    final_price: item.final_price,
    expiry_date: item.expiry_date,
    description: item.description || '-',
    batch_number: item.batch_number,
    category: item.category,
    unit: item.unit,
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
  return data as ManagerOrderItem[];
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

  return data as ManagerGoodsReceipt[];
}

import { CustomerInfo } from '@/lib/types';

/**
 * Fetches a list of unique customers from the database.
 * Uses a remote procedure call (RPC) to `get_unique_customers`.
 */
export async function getCustomers(): Promise<CustomerInfo[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_unique_customers');

  if (error) {
    console.error('Error fetching unique customers:', error);
    return [];
  }

  return data || [];
}

/**
 * TODO: Функция для создания нового заказа на поставку
 */
export async function createPurchaseOrder(data: any) {
  console.log('Creating new purchase order...', data);
  return { success: true, message: 'Заказ на поставку создан (моделирование).' };
}

// --- Analytics Actions ---

import { PurchaseOrderForDashboard } from '@/lib/types';

/**
 * Fetches pending purchase orders for the manager's dashboard.
 * Uses the `purchase_orders_for_dashboard` view.
 */
export async function getPurchaseOrdersForManager(): Promise<PurchaseOrderForDashboard[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('purchase_orders_for_dashboard')
    .select('*')
    .eq('status', 'pending')
    .order('expected_delivery_date', { ascending: true });

  if (error) {
    console.error('Error fetching purchase orders for manager:', error);
    return [];
  }

  return data as PurchaseOrderForDashboard[];
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
    salesChartData: salesChartData || [],
    topProducts: topProducts || [],
    topCustomers: topCustomers || [],
  };
}
