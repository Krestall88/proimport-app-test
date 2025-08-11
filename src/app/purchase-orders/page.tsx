import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';
import { PurchaseOrder } from '@/lib/types';
import PurchaseOrdersTable from './PurchaseOrdersTable';

export default async function PurchaseOrdersPage() {
  const supabase = await createClient();

  // Загружаем заказы и связанные с ними данные
  const { data: orders, error } = await supabase
    .from('purchase_orders')
    .select(`
      id,
      created_at,
      expected_delivery_date,
      status,
      supplier_id,
      supplier:suppliers(*),
      purchase_order_items (
        id,
        purchase_order_id,
        product_id,
        quantity_ordered,
        product:products(*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchase orders:', error);
    return <p>Не удалось загрузить закупочные заказы. Ошибка: {error.message}</p>;
  }

  const safeOrders = (orders || []).map(order => {
    let supplierContacts: { phone?: string | null; email?: string | null; } | null = null;

    if (typeof order.supplier?.contacts === 'string') {
      try {
        supplierContacts = JSON.parse(order.supplier.contacts);
      } catch (e) {
        supplierContacts = null; // В случае ошибки парсинга
      }
    } else if (typeof order.supplier?.contacts === 'object' && order.supplier?.contacts !== null) {
      supplierContacts = order.supplier.contacts as any;
    }

    return {
      ...order,
      supplier: order.supplier ? {
        ...order.supplier,
        contacts: supplierContacts,
      } : null,
      purchase_order_items: order.purchase_order_items || [],
    };
  }) as PurchaseOrder[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-2xl font-bold tracking-tight">Закупочные заказы</h3>
            <p className="text-sm text-muted-foreground">
                Список всех созданных закупочных заказов.
            </p>
        </div>
      </div>

      <PurchaseOrdersTable orders={safeOrders} />
    </div>
  );
}
