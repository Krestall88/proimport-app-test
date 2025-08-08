import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

// Этот тип должен соответствовать пропсам ExpandableOrdersTable
interface Order {
  id: string;
  created_at: string;
  status: string;
  customer_name: string;
  customer: {
    name: string;
    contacts: {
      phone?: string | null;
      email?: string | null;
    } | null;
    tin?: string;
    kpp?: string;
    delivery_address?: string;
    payment_terms?: string;
  } | null;
  order_items: {
    id: string;
    product_name: string;
    quantity: number;
    price_per_unit?: number;
    purchase_price_per_unit?: number;
  }[];
}

async function getOrders(role: 'agent' | 'owner'): Promise<Order[]> {
  noStore();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // ВРЕМЕННО: Фильтрация по agent_id отключена, т.к. поля нет в таблице.
  // Агент будет видеть все заказы.
  // TODO: Добавить фильтрацию .eq('agent_id', user.id) для роли 'agent',
  // как только поле agent_id будет добавлено в customer_orders.
  if (role === 'agent') {
    console.warn('ВНИМАНИЕ: Фильтрация заказов по агенту отключена. Требуется добавить agent_id в таблицу customer_orders.');
  }

  const query = supabase
    .from('customer_orders')
    .select(`
      id,
      created_at,
      status,
      customer:customers(name, contacts, tin, kpp, delivery_address, payment_terms),
      order_items:customer_order_items(
        id,
        quantity,
        product:products(title, sku, batch_number, expiry_date, unit, category, description),
        goods_receipt_item:goods_receipt_items(price_per_unit, purchase_price_per_unit)
      )
    `)
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Ошибка при загрузке заказов:', error);
    return [];
  }

  // Трансформируем данные в нужный для таблицы формат
  return data.map((order: any) => ({
    id: order.id,
    created_at: order.created_at,
    status: order.status,
    customer_name: order.customer?.name || 'Неизвестный клиент',
    customer: order.customer || null,
    order_items: order.order_items.map((item: any) => ({
      id: item.id,
      product: {
        title: item.product?.title || 'Неизвестный товар',
        sku: item.product?.sku || '',
        batch_number: item.product?.batch_number || '',
        expiry_date: item.product?.expiry_date,
        unit: item.product?.unit || '',
        category: item.product?.category || '',
        description: item.product?.description,
      },
      available_quantity: item.quantity,
      price_per_unit: item.goods_receipt_item?.price_per_unit,
      purchase_price_per_unit: role === 'owner' ? item.goods_receipt_item?.purchase_price_per_unit : undefined,
    })),
  }));
}

export async function getManagerCustomerOrders(): Promise<Order[]> {
  return getOrders('owner');
}

export async function getAgentCustomerOrders(): Promise<Order[]> {
  return getOrders('agent');
}
