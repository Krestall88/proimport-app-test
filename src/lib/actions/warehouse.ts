'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  PurchaseOrder
} from '@/lib/types';

//==============================================================================
// Data Fetching Functions
//==============================================================================

/**
 * Fetches pending purchase orders with full item details.
 * This is the primary function for the warehouse dashboard.
 */
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      id,
      expected_delivery_date,
      status,
      supplier:suppliers!inner(name),
      purchase_order_items:purchase_order_items!inner(
        id,
        product_id,
        quantity_ordered,
        product:products!inner(title, nomenclature_code, unit, description, category)
      )
    `)
    .eq('status', 'pending')
    .order('expected_delivery_date', { ascending: true });

  if (error) {
    console.error('Error fetching purchase orders:', error);
    return [];
  }

  // The query returns supplier and product as arrays, so we flatten them.
  const formattedData = data.map(order => ({
    ...order,
    supplier: Array.isArray(order.supplier) ? order.supplier[0] : order.supplier,
    purchase_order_items: order.purchase_order_items.map(item => ({
      ...item,
      product: Array.isArray(item.product) ? item.product[0] : item.product,
    }))
  }));

  return formattedData as PurchaseOrder[];
}

/**
 * Fetches customer orders for the dashboard.
 * Note: Uses 'any' for return type, should be replaced with a proper type.
 */


// Корректная типизация: возвращает WarehouseOrderItem[] из актуальной вьюхи warehouse_orders_view
// TODO: Проверить соответствие структуры WarehouseOrderItem и warehouse_orders_view глобальному типу (fields: nomenclature_code, description: string, batch_number, expiry_date и др.)
import type { WarehouseOrderItem } from '@/lib/types';
export async function getCustomerOrders(): Promise<WarehouseOrderItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('warehouse_orders_view')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching warehouse orders:', error);
    return [];
  }

  // Явное преобразование и заполнение обязательных полей WarehouseOrderItem
  return (data ?? []).map((item: any) => ({
    purchase_order_id: item.purchase_order_id || item.order_id || '', // Use purchase_order_id, fallback to order_id
    created_at: item.created_at || '',
    shipped_at: item.shipped_at || null,
    status: item.status || '',
    customer_name: item.customer_name || '',
    customer: null, // The view does not provide full customer object
    order_item_id: item.order_item_id || '',
    quantity: item.quantity ?? 0, // Correct top-level field
    price_per_unit: item.price_per_unit ?? 0,
    final_price: item.final_price ?? 0,
    product: {
      id: item.product_id || '', // The view does not provide product_id
      title: item.product_name || 'Название не указано', // Correct field from view
      nomenclature_code: item.sku || 'Артикул не указан', // Correct field from view
      description: item.description || '',
      category: item.category || '',
      unit: item.unit || '',
      expiry_date: item.expiry_date || null,
      batch_number: item.batch_number || '',
      // These fields are not in the view, so we set them to default values
      purchase_price: null,
      selling_price: null, 
      created_at: '',
      supplier_id: null,
      available_quantity: item.quantity ?? 0, // available_quantity is part of product
    },
  })) as WarehouseOrderItem[];
}

/**
 * Fetches current inventory with customer order reservations accounted for.
 * Uses the new RPC function that provides real-time available quantities.
 */
import type { BatchInventoryItem } from '@/lib/types';

export async function getInventory(): Promise<BatchInventoryItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_inventory_with_reservations');

  if (error) {
    console.error('Error fetching warehouse inventory:', error);
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
      description: item.description ?? '', // FIX: Access description directly
    },
    available_quantity: item.available_quantity,
    purchase_price: item.purchase_price,
    final_price: item.final_price,
    characteristics: item.characteristics,
    total_received: item.total_received,
    total_reserved: item.total_reserved
  })) as BatchInventoryItem[];
}

/**
 * Fetches the full details for a single purchase order for the receiving page.
 */
export async function getPurchaseOrderDetails(id: string): Promise<PurchaseOrder | null> {
  const supabase = await createClient();
  // 1. Получить заказ
  const { data: order, error: orderError } = await supabase
    .from('purchase_orders')
    .select(`id, expected_delivery_date, status, created_at, supplier_id, supplier:suppliers!inner(name)`)
    .eq('id', id)
    .single();

  if (orderError) {
    console.error(`Error fetching PO #${id}:`, orderError);
    return null;
  }

  // 2. Получить связанные purchase_order_items с join по product_id
  const { data: items, error: itemsError } = await supabase
    .from('purchase_order_items')
    .select(`id, product_id, quantity_ordered, product:products(id, title, nomenclature_code, unit, description, category, purchase_price, selling_price)`)
    .eq('purchase_order_id', id);

  if (itemsError) {
    console.error(`Error fetching items for PO #${id}:`, itemsError);
    return null;
  }

  return {
    id: order.id,
    created_at: order.created_at ?? '',
    expected_delivery_date: order.expected_delivery_date ?? null,
    status: order.status,
    supplier_id: order.supplier_id ?? '',
    supplier: order.supplier ?? null,
    purchase_order_items: (items ?? []).map((item: any) => ({
      id: item.id,
      purchase_order_id: order.id,
      product_id: item.product_id,
      quantity_ordered: item.quantity_ordered,
      price_per_unit: item.price_per_unit ?? null,
      product: item.product ?? null
    }))
  } as PurchaseOrder;
}

//==============================================================================
// Data Mutation Functions
//==============================================================================

/**
 * Deletes customer orders by their IDs.
 * This function should only be callable by warehouse managers (owners).
 */
export async function deleteCustomerOrders(orderIds: string[]) {
  const supabase = await createClient();

  // First, delete associated order items to avoid foreign key constraint violations
  const { error: itemsError } = await supabase
    .from('customer_order_items')
    .delete()
    .in('customer_order_id', orderIds);

  if (itemsError) {
    console.error('Error deleting customer order items:', itemsError);
    return { success: false, message: `Ошибка при удалении позиций заказа: ${itemsError.message}` };
  }

  // Then delete the orders themselves
  const { error: ordersError } = await supabase
    .from('customer_orders')
    .delete()
    .in('id', orderIds);

  if (ordersError) {
    console.error('Error deleting customer orders:', ordersError);
    return { success: false, message: `Ошибка при удалении заказов: ${ordersError.message}` };
  }

  revalidatePath('/warehouse/customer-orders');
  return { success: true, message: `Успешно удалено ${orderIds.length} заказ(ов).` };
}

/**
 * Inserts customer order items, automatically assigning goods_receipt_item_id (batch) for each product.
 * Assumes: products are selected from available inventory (goods_receipt_items with quantity > 0)
 */
export async function insertCustomerOrderItemsWithBatch(
  customer_order_id: string,
  items: { product_id: string; qty: number; price_per_unit: number; product_name?: string }[],
) {
  const supabase = await createClient();
  const orderItemsToInsert = [];

  for (const item of items) {
    // Вызываем новую RPC-функцию для получения доступных партий с учётом резервов
    const { data: availableBatches, error: rpcError } = await supabase.rpc(
      'get_available_batches_for_product',
      { p_product_id: item.product_id, p_required_qty: item.qty },
    );

    if (rpcError) {
      console.error('Error calling get_available_batches_for_product:', rpcError);
      throw new Error('Произошла ошибка при проверке остатков на складе.');
    }

    // Функция возвращает массив. Нам нужна первая партия (FIFO)
    const selectedBatch = availableBatches && availableBatches.length > 0 ? availableBatches[0] : null;

    if (!selectedBatch) {
      // Для более информативного сообщения об ошибке, получим название товара
      const { data: product } = await supabase
        .from('products')
        .select('title')
        .eq('id', item.product_id)
        .single();
      const productName = product?.title || `(ID: ${item.product_id})`;
      throw new Error(`Недостаточно товара на складе для "${productName}". Запрошено: ${item.qty}. Возможно, весь товар уже зарезервирован в других заказах.`);
    }

    // Добавляем проверку, что price_per_unit не NaN или undefined
    const pricePerUnit = isNaN(item.price_per_unit) || item.price_per_unit === undefined ? 0 : item.price_per_unit;

    orderItemsToInsert.push({
      customer_order_id,
      product_id: item.product_id,
      quantity: item.qty,
      price_per_unit: pricePerUnit,
      goods_receipt_item_id: selectedBatch.batch_id, // Присваиваем ID найденной партии
    });
  }

  // Вставляем все позиции заказа одним пакетом
  const { error: insertError } = await supabase
    .from('customer_order_items')
    .insert(orderItemsToInsert);

  if (insertError) {
    console.error('Error inserting customer order items:', insertError);
    throw new Error(`Не удалось добавить позиции в заказ: ${insertError.message}`);
  }
}

/**
 * Processes a goods receipt by calling a PostgreSQL RPC function.
 */
// import type { ReceiptData } from '@/lib/types';
export async function processReceipt(receiptData: any): Promise<{ success: boolean; message: string; }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: 'Ошибка: Сессия истекла или пользователь не авторизован. Пожалуйста, войдите снова.',
    };
  }

  const p_receipt_data = {
    purchase_order_id: receiptData.purchase_order_id,
    user_id: user.id, // This was the missing piece of the puzzle
    items: receiptData.items,
  };
  const p_is_draft = receiptData.status === 'draft';

  const { error } = await supabase.rpc('process_goods_receipt', {
    p_receipt_data,
    p_is_draft,
  });

  if (error) {
    console.error('Error processing receipt:', error);
    if (error.message.includes('violates row-level security policy')) {
      return {
        success: false,
        message: 'Ошибка прав доступа. У вас нет разрешения на выполнение этой операции.',
      };
    }
    return {
      success: false,
      message: `Произошла ошибка при обработке приёмки: ${error.message}`,
    };
  }

  return {
    success: true,
    message: `Приёмка по заказу ${receiptData.purchase_order_id} успешно обработана.`,
  };
}
