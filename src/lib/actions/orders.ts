import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

import type { AgentOrderItem } from '@/lib/types';
import { getCustomerOrdersForManager } from '@/lib/actions/manager';
import type { ManagerOrderItem } from '@/lib/types';

export async function getAgentCustomerOrders(): Promise<AgentOrderItem[]> {
  noStore();
  const supabase = await createClient();

  // TODO: добавить фильтрацию по agent_id, когда появится в customer_orders
  console.warn('ВНИМАНИЕ: Фильтрация заказов по агенту отключена. Требуется добавить agent_id в таблицу customer_orders.');

  const { data, error } = await supabase
    .from('customer_orders')
    .select(`
      id,
      created_at,
      status,
      customer:customers(name, contacts, tin, kpp, delivery_address, payment_terms),
      order_items:customer_order_items(
        id,
        quantity,
        product:products(title, nomenclature_code, batch_number, expiry_date, unit, category, description),
        goods_receipt_item:goods_receipt_items(price_per_unit, purchase_price_per_unit)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Ошибка при загрузке заказов:', error);
    return [];
  }

  return (data ?? []).map((order: any) => ({
    id: order.id,
    created_at: order.created_at,
    status: order.status,
    customer_name: order.customer?.name || 'Неизвестный клиент',
    customer: order.customer || null,
    order_items: (order.order_items ?? []).map((item: any) => ({
      id: item.id,
      product: {
        title: item.product?.title || 'Неизвестный товар',
        nomenclature_code: item.product?.nomenclature_code || '',
        batch_number: item.product?.batch_number || '',
        expiry_date: item.product?.expiry_date,
        unit: item.product?.unit || '',
        category: item.product?.category || '',
        description: item.product?.description || '', // всегда string
      },
      available_quantity: item.quantity,
      price_per_unit: item.goods_receipt_item?.price_per_unit,
      purchase_price_per_unit: item.goods_receipt_item?.purchase_price_per_unit,
    })),
  })) as AgentOrderItem[];
}

export async function getManagerCustomerOrders(): Promise<ManagerOrderItem[]> {
  return getCustomerOrdersForManager();
}
