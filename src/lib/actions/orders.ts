'use server';

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

  // Явное преобразование и заполнение обязательных полей AgentOrderItem
  return (data ?? []).map((order: any) => ({
    purchase_order_id: order.purchase_order_id || '',
    created_at: order.created_at || '',
    status: order.status || '',
    customer_name: order.customer?.name || 'Неизвестный клиент',
    customer_contacts: order.customer?.contacts || null,
    phone: order.customer?.contacts?.phone || '',
    email: order.customer?.contacts?.email || '',
    customer_tin: order.customer?.tin || '',
    customer_kpp: order.customer?.kpp || '',
    customer_delivery_address: order.customer?.delivery_address || '',
    customer_payment_terms: order.customer?.payment_terms || '',
    order_item_id: order.order_items?.[0]?.id || '',
    product: order.order_items?.[0]?.product || {
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
    available_quantity: order.order_items?.[0]?.available_quantity ?? 0,
    price_per_unit: order.order_items?.[0]?.price_per_unit ?? 0,
  })) as AgentOrderItem[];
}

export async function getManagerCustomerOrders(): Promise<ManagerOrderItem[]> {
  return getCustomerOrdersForManager();
}
