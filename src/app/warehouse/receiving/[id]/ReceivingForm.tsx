'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PurchaseOrderDetails } from '@/lib/types';
import { processReceipt } from '@/lib/actions/warehouse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ReceivingFormProps {
  order: PurchaseOrderDetails;
}

type FormItemState = {
  quantity_received: number | string;
  batch_number: string;
  expiry_date: string;
  description: string;
  notes: string;
  nomenclature_code: string;
  title: string;
  category: string;
  unit: string;
};

type FormState = {
  [itemId: string]: FormItemState;
};

import { formatCurrency } from '@/app/utils/formatCurrency';

export default function ReceivingForm({ order }: ReceivingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = order.purchase_order_items.reduce((acc, item) => {
    acc[item.id] = {
      quantity_received: item.quantity_ordered || '',
      batch_number: '',
      expiry_date: '',
      description: item.product.description,
      notes: '',
      nomenclature_code: item.product?.nomenclature_code ?? '-' ?? '',
      title: item.product?.title ?? '-' ?? '',
      category: item.product?.category ?? '-' ?? '',
      unit: item.product?.unit ?? '-' ?? '',
    };
    return acc;
  }, {} as FormState);

  const [formState, setFormState] = useState<FormState>(initialFormState);
  // Чекпоинты для каждого поля каждой позиции
  const [checkpoints, setCheckpoints] = useState<{[itemId: string]: {[field in keyof FormItemState]?: boolean}}>({});
  // Изменения для notes обязательности
  const [isFieldChanged, setIsFieldChanged] = useState<{[itemId: string]: boolean}>({});
  // --- Новый state для подтверждения строки ---
  const [isRowConfirmed, setIsRowConfirmed] = useState<Record<string, boolean>>({});

  const handleInputChange = (itemId: string, field: keyof FormItemState, value: string | number) => {
    setFormState(prevState => ({
      ...prevState,
      [itemId]: { ...prevState[itemId], [field]: value },
    }));
    // Если изменено поле (не expiry_date/notes), то отмечаем как изменённое
    if (field !== 'expiry_date' && field !== 'notes') {
      setIsFieldChanged(prev => ({ ...prev, [itemId]: true }));
    }
  };

  const handleCheckpointChange = (itemId: string, field: keyof FormItemState, checked: boolean) => {
    setCheckpoints(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: checked },
    }));
  };

  const handleSubmit = async (isFinal: boolean) => {
    // Проверка: все строки должны быть подтверждены (isRowConfirmed)
    for (const item of order.purchase_order_items) {
      if (!isRowConfirmed[item.id]) {
        toast.error('Поставьте чекпоинт подтверждения для каждой позиции!');
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(true);

    const itemsToProcess = order.purchase_order_items
      .map(item => ({
        purchase_order_item_id: item.id,
        product_id: item.product_id,
        quantity_received: Number(formState[item.id].quantity_received) || 0,
        batch_number: formState[item.id].batch_number || order.id,
        category: formState[item.id].category,
        unit: formState[item.id].unit,
        expiry_date: formState[item.id].expiry_date || null,
        description: formState[item.id].description,
        notes: formState[item.id].notes,
      }))
      .filter(item => item.quantity_received > 0);

    // Проверка: если есть хотя бы одна изменённая характеристика и пустое примечание — ошибка
    if (isFinal) {
      let missingBatchOrChar = false;
      let changedWithoutNote = false;

    }

    if (itemsToProcess.length === 0) {
      toast.info('Не выбрано ни одного товара для приемки.');
      setIsSubmitting(false);
      return;
    }

    const receiptData = {
      purchase_order_id: order.id,
      status: (isFinal ? 'completed' : 'draft') as 'completed' | 'draft',
      items: itemsToProcess,
    };

    const result = await processReceipt(receiptData);

    if (result.success) {
      toast.success(result.message);
      if (isFinal) {
        router.push('/warehouse');
        router.refresh();
      }
    } else {
      toast.error('Произошла ошибка при обработке приёмки:', { description: result.message });
    }

    setIsSubmitting(false);
  };

  // --- Валидация строки ---
  function validateRow(itemId: string) {
    const item = formState[itemId];
    if (!item) return false;
    const product = order.purchase_order_items.find(poItem => poItem.id === itemId)?.products;
    // expiry_date обязателен всегда
    if (!item.expiry_date) return false;
    // Если не было изменений, чекпоинт можно ставить только по expiry_date
    if (!isFieldChanged[itemId]) return true;
    // Если были изменения, комментарий обязателен
    if (!item.notes) return false;
    // Проверяем, что хотя бы одно из ключевых полей изменено
    // Получаем дефолтное количество из purchase_order_items
    const poItem = order.purchase_order_items.find(po => po.id === itemId);
    const changed = (
      (item.description !== (product?.description ?? '')) ||
      (item.batch_number !== '') ||
      (item.quantity_received !== (poItem?.quantity_ordered ?? '')) ||
      (item.nomenclature_code !== (product?.nomenclature_code ?? '')) ||
      (item.title !== (product?.title ?? '')) ||
      (item.category !== (product?.category ?? '')) ||
      (item.unit !== (product?.unit ?? ''))
    );
    return changed;
  }

  // --- Обработчик чекпоинта строки ---
  function handleRowConfirm(itemId: string, checked: boolean) {
    if (checked) {
      // Валидация перед подтверждением
      if (!validateRow(itemId)) {
        toast.error('Заполните все обязательные поля и комментарий, если были изменения');
        return;
      }
    }
    setIsRowConfirmed(prev => ({ ...prev, [itemId]: checked }));
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full table-auto border-separate border-spacing-0">
          <thead>
            <tr className="bg-muted">
              <th className="px-3 py-2 text-left">Артикул</th>
              <th className="px-3 py-2 text-left">Наименование</th>
              <th className="px-3 py-2 text-left">Описание</th>
              <th className="px-3 py-2 text-left">Категория</th>
              <th className="px-3 py-2 text-left">Кол-во</th>
              <th className="px-3 py-2 text-left">Ед. изм.</th>
              <th className="px-3 py-2 text-left">Номер партии</th>
              <th className="px-3 py-2 text-left">Срок годности</th>
              <th className="px-3 py-2 text-left">Комментарий</th>
              <th className="px-3 py-2 text-center">Подтвердить</th>
            </tr>
          </thead>
          <tbody>
            {order.purchase_order_items.map(item => (
              <tr key={item.id} className="border-b border-muted">
                {/* Артикул */}
                <td className="px-3 py-2 align-middle">
                  <Input
                    id={`sku-${item.id}`}
                    value={formState[item.id].nomenclature_code}
                    onChange={e => handleInputChange(item.id, 'nomenclature_code', e.target.value)}
                    disabled={isSubmitting || isRowConfirmed[item.id]}
                    className="w-full min-w-[100px]"
                  />
                </td>
                {/* Наименование */}
                <td className="px-3 py-2 align-middle">
                  <Input
                    id={`title-${item.id}`}
                    value={formState[item.id].title}
                    onChange={e => handleInputChange(item.id, 'title', e.target.value)}
                    disabled={isSubmitting || isRowConfirmed[item.id]}
                    className="w-full min-w-[120px]"
                  />
                </td>
                {/* Описание */}
                <td className="px-3 py-2 align-middle">
                  <Input
                    id={`description-${item.id}`}
                    placeholder="Описание..."
                    value={formState[item.id].description || item.product?.description ?? '-' || ''}
                    onChange={e => handleInputChange(item.id, 'description', e.target.value)}
                    disabled={isSubmitting || isRowConfirmed[item.id]}
                    required
                    className="w-full min-w-[180px]"
                  />
                </td>
                {/* Категория */}
                <td className="px-3 py-2 align-middle">
                  <Input
                    id={`category-${item.id}`}
                    value={formState[item.id].category}
                    onChange={e => handleInputChange(item.id, 'category', e.target.value)}
                    disabled={isSubmitting || isRowConfirmed[item.id]}
                    className="w-full min-w-[100px]"
                  />
                </td>
                {/* Количество */}
                <td className="px-3 py-2 align-middle">
                  <Input
                    id={`quantity-${item.id}`}
                    type="number"
                    value={formState[item.id].quantity_received}
                    onChange={e => handleInputChange(item.id, 'quantity_received', e.target.value)}
                    min="0"
                    max={item.quantity_ordered}
                    disabled={isSubmitting || isRowConfirmed[item.id]}
                    required
                    className="w-full min-w-[60px]"
                  />
                </td>
                {/* Ед. изм. */}
                <td className="px-3 py-2 align-middle">
                  <Input
                    id={`unit-${item.id}`}
                    value={formState[item.id].unit}
                    onChange={e => handleInputChange(item.id, 'unit', e.target.value)}
                    disabled={isSubmitting || isRowConfirmed[item.id]}
                    className="w-full min-w-[60px]"
                  />
                </td>
                {/* Номер партии (по умолчанию — order.id) */}
                <td className="px-3 py-2 align-middle">
                  <Input
                    id={`batch-${item.id}`}
                    value={formState[item.id].batch_number || order.id}
                    onChange={e => handleInputChange(item.id, 'batch_number', e.target.value)}
                    disabled={isSubmitting || isRowConfirmed[item.id]}
                    required
                    className="w-full min-w-[120px]"
                  />
                </td>
                {/* Срок годности */}
                <td className="px-3 py-2 align-middle">
                  <Input
                    id={`expiry_date-${item.id}`}
                    type="date"
                    value={formState[item.id].expiry_date}
                    onChange={e => handleInputChange(item.id, 'expiry_date', e.target.value)}
                    disabled={isSubmitting || isRowConfirmed[item.id]}
                    required
                    className="w-full min-w-[120px]"
                  />
                </td>
                {/* Комментарий */}
                <td className="px-3 py-2 align-middle">
                  <Textarea
                    id={`notes-${item.id}`}
                    placeholder="Повреждения, несоответствия..."
                    value={formState[item.id].notes}
                    onChange={e => handleInputChange(item.id, 'notes', e.target.value)}
                    disabled={isSubmitting || isRowConfirmed[item.id]}
                    required={!!isFieldChanged[item.id]}
                    className="w-full min-w-[150px]"
                  />
                </td>
                {/* Общий чекпоинт подтверждения строки */}
                <td className="px-3 py-2 align-middle text-center">
                  <Checkbox
                    checked={!!isRowConfirmed[item.id]}
                    onCheckedChange={checked => handleRowConfirm(item.id, !!checked)}
                    disabled={isSubmitting}
                    aria-label="Подтвердить позицию"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end space-x-4 mt-8">
        <Button variant="outline" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить черновик'}
        </Button>
        <Button onClick={() => handleSubmit(true)} disabled={isSubmitting}>
          {isSubmitting ? 'Завершение...' : 'Завершить приёмку'}
        </Button>
      </div>
    </div>
  );
}
