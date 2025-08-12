import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import React from 'react';
import AgentOrdersTable from '../components/AgentOrdersTable';

// Тип для сырых данных из БД
interface DbOrder {
  order_id: string;
  created_at: string;
  status: string;
  shipment_date?: string | null;
  customer_name: string;
  customer_contacts?: {
    phone?: string | null;
    email?: string | null;
  } | null;
  phone?: string | null;
  email?: string | null;
  customer_tin?: string;
  customer_kpp?: string;
  customer_delivery_address?: string;
  customer_payment_terms?: string;
  order_item_id: string;
  product_title: string;
  description: string;
  sku: string;
  category: string;
  batch_number?: string;
  expiry_date?: string;
  quantity: number;
  unit: string;
  final_price: number;
  item_total: number;
}

import type { AgentOrderItem } from '@/lib/types';

// Функция-адаптер для преобразования данных
const mapCustomerOrdersToAgentItems = (dbOrders: DbOrder[]): AgentOrderItem[] => {
  if (!dbOrders) return [];
  return dbOrders.map(item => ({
    purchase_order_id: item.order_id,
    created_at: item.created_at,
    status: item.status,
    shipment_date: item.shipment_date,
    customer_name: item.customer_name,
    customer_contacts: item.customer_contacts,
    customer_tin: item.customer_tin,
    customer_kpp: item.customer_kpp,
    customer_delivery_address: item.customer_delivery_address,
    customer_payment_terms: item.customer_payment_terms,
    order_item_id: item.order_item_id,
    product: {
      // TODO: После доработки view заменить sku на product_id
      id: item.sku, // временно используем sku как surrogate для id
      title: item.product_title,
      nomenclature_code: item.sku,
      description: item.description || '', // всегда string
      purchase_price: null,
      selling_price: null,
      category: item.category,
      unit: item.unit,
      expiry_date: item.expiry_date || undefined,
      batch_number: item.batch_number || undefined,
      created_at: item.created_at,
      supplier_id: null,
      characteristics: null,
      available_quantity: item.quantity || 0,
    },
    available_quantity: item.quantity,
    price_per_unit: item.final_price || 0,
  }));
};

export default async function CustomerOrdersPage() {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <p>Пожалуйста, войдите в систему.</p>;
  }

  // Получаем заказы с корректной ценой из представления manager_orders_view
  const { data: orders, error } = await supabase
    .from('manager_orders_view') // Используем то же представление, что и у менеджера
    .select('*')
    .eq('agent_id', user.id) // Фильтруем по ID текущего агента
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Ошибка при загрузке заказов для агента:', error);
    return <p>Не удалось загрузить заказы. Попробуйте позже.</p>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-semibold mb-2">Заказов пока нет</h2>
        <p className="text-gray-400 mb-4">Здесь будут отображаться все заказы, созданные вами.</p>
        <Link href="/agent/customer-orders/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Создать первый заказ
        </Link>
      </div>
    );
  }

  // DEBUG: Проверим, приходят ли данные с null price_per_unit
  console.log('DEBUG: Raw orders from DB:', orders);
  const flatOrders = mapCustomerOrdersToAgentItems(orders as unknown as DbOrder[]);
  console.log('DEBUG: Flat orders after mapping:', flatOrders);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        
        <Link href="/agent/customer-orders/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Создать новый заказ
        </Link>
      </div>
      <AgentOrdersTable orders={flatOrders} />
    </div>
  );
}
