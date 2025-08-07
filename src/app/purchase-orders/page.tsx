import { createClient } from '@/lib/supabase/server';
import PurchaseOrdersTable from './PurchaseOrdersTable';

export default async function PurchaseOrdersPage() {
  const supabase = await createClient();

  // Загружаем заказы и связанные с ними данные
  const { data: orders, error } = await supabase
    .from('purchase_orders')
    .select(`
      id,
      expected_delivery_date,
      status,
      supplier ( name ),
      purchase_order_items (
        quantity_ordered,
        product:products ( title, purchase_price )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchase orders:', error);
    return <p>Не удалось загрузить закупочные заказы. Ошибка: {error.message}</p>;
  }

  // Преобразуем expected_delivery_date к string, если оно null
  const safeOrders = (orders || []).map(order => ({
    ...order,
    expected_delivery_date: order.expected_delivery_date || '',
    supplier: order.supplier && typeof order.supplier.name === 'string' ? order.supplier : { name: '' },
  }));

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
