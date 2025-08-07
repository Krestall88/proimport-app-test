import { getPurchaseOrderDetails } from '@/lib/actions/warehouse';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ReceivingForm from './ReceivingForm'; // Import the new component

// Это серверный компонент, который загружает данные для конкретного заказа на закупку
// и отображает интерактивную форму для приёмки товаров.

export default async function (props: any) {
  let orderId;
  const params = typeof props.params === 'function' ? await props.params() : props.params;
  orderId = params?.id;

  if (!orderId) {
    notFound();
  }

  let orderDetails;
  try {
    // Use the async version of getPurchaseOrderDetails
    orderDetails = await getPurchaseOrderDetails(orderId);
  } catch (error) {
    console.error('Error in ReceivingPage:', error);
    return (
      <div className="p-8 text-center text-red-500">
        Не удалось загрузить данные заказа. Пожалуйста, попробуйте еще раз.
      </div>
    );
  }

  if (!orderDetails) {
    notFound();
  }

  return (
    <div className="w-full px-4 md:px-8">
      <div className="flex items-center mb-6 gap-4">
        <Link href="/warehouse/pending-shipments" passHref legacyBehavior>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            Назад к заявкам
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Приёмка товара</h1>
      </div>
      <p className="text-muted-foreground">
        Заказ на закупку: <span className="font-mono text-sm">{orderDetails.id}</span>
      </p>
      <p className="text-muted-foreground">
        Поставщик: <span className="font-semibold">{orderDetails.supplier?.name ?? '—'}</span>
      </p>

      {/* Заменяем статический список на интерактивную форму */}
      <ReceivingForm order={orderDetails} />

    </div>
  );
}
