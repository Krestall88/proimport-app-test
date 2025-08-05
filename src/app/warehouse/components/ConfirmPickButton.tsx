'use client';

'use client';

import { confirmOrderPicked } from '../customer-orders/actions';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface ConfirmPickButtonProps {
  orderId: string;
  currentStatus: string;
}

export default function ConfirmPickButton({ orderId, currentStatus }: ConfirmPickButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const actionText = currentStatus === 'new' ? 'Начать сборку' : 'Завершить сборку';
  const pendingText = currentStatus === 'new' ? 'Начинаем...' : 'Завершаем...';

  const handleClick = () => {
    startTransition(async () => {
      const nextStatus = currentStatus === 'new' ? 'picking' : 'ready_for_shipment';
      const result = await confirmOrderPicked(orderId, nextStatus);
      if (result?.error) {
        toast.error(`Ошибка: ${result.error}`);
      } else {
        toast.success(`Статус заказа обновлен.`);
        router.refresh(); // Обновляем данные на странице
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500"
    >
      {isPending ? pendingText : actionText}
    </button>
  );
}
