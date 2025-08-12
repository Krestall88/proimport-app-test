"use client";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ApplicationToCartDialog, RequiredProductFields } from "@/components/ApplicationToCartDialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { deleteApplication } from './actions';

// Типы для заявки
// Временный тип для сырых данных из таблицы
interface ApplicationRow {
  id: string;
  customer_id: string;
  agent_id: string;
  application_items: any; // JSONB поле, оставляем any для простоты
  created_at: string;
  updated_at: string;
}

interface Application extends ApplicationRow {
  id: string;
  customer_id: string;
  agent_id: string;
  application_items: {
    name: string;
    qty: number;
    unit?: string;
    category?: string;
    comment?: string;
  }[];
  created_at: string;
  updated_at: string;
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
  };
  agent: { full_name: string | null };
}

export default function ManagerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogState, setDialogState] = useState({ isOpen: false, applicationId: '' });

  // Загрузка всех заявок для руководителя
  useEffect(() => {
    const supabase = createClient();

    async function fetchAndCombineData() {
      try {
        // 1. Получаем все заявки
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('customer_wishlist')
          .select<`*`, ApplicationRow>('*');

        if (applicationsError) throw applicationsError;
        if (!applicationsData) {
          setApplications([]);
          return;
        }

        const customerIds = [...new Set(applicationsData.map(app => app.customer_id))];
        const agentIds = [...new Set(applicationsData.map(app => app.agent_id))];

        // 2. Получаем всех нужных клиентов и агентов
        const [
          { data: customersData, error: customersError },
          { data: agentsData, error: agentsError }
        ] = await Promise.all([
          supabase.from('customers').select('id, name, contacts, tin, kpp, delivery_address, payment_terms').in('id', customerIds),
          supabase.from('profiles').select('id, full_name').in('id', agentIds)
        ]);

        if (customersError) throw customersError;
        if (agentsError) throw agentsError;

        const customersMap = new Map(customersData?.map(c => [c.id, c]));
        const agentsMap = new Map(agentsData?.map(a => [a.id, a]));

        // 3. Объединяем данные
        const combinedApplications = applicationsData.map(app => ({
          ...app,
          customer: customersMap.get(app.customer_id) || { name: 'Клиент не найден' },
          agent: agentsMap.get(app.agent_id) || { full_name: 'Агент не найден' },
        }));

        setApplications(combinedApplications as Application[]);

      } catch (error: any) {
        toast.error(`Ошибка при загрузке данных: ${error.message}`);
        setApplications([]);
      }
    }

    fetchAndCombineData();
  }, []);

  // Проверить, есть ли позиция в корзине руководителя
  const isInManagerCart = (subItem: { name: string; qty: number; unit?: string; category?: string; comment?: string }) => {
    try {
      const managerCart = JSON.parse(localStorage.getItem('managerPurchaseOrderCart') || '[]');
      return managerCart.some((item: any) => item.title === subItem.name && item.quantity === subItem.qty);
    } catch {
      return false;
    }
  };

  // Добавить позицию в корзину руководителя через создание продукта
  const addToPurchaseOrder = async (fields: RequiredProductFields) => {
    try {
      const res = await fetch('/api/manager/create-product-from-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      const result = await res.json();
      if (result.error || !result.product) {
        toast.error(`Ошибка при создании товара из заявки: ${result.error?.message || 'Неизвестная ошибка'}`);
        return;
      }
      // Добавляем в корзину руководителя
      const managerCart = JSON.parse(localStorage.getItem('managerPurchaseOrderCart') || '[]');
      const newItem = {
        ...result.product,
        quantity: fields.qty,
        fromApplication: true
      };
      localStorage.setItem('managerPurchaseOrderCart', JSON.stringify([...managerCart, newItem]));
      // Генерируем customEvent для синхронизации корзины в других компонентах
      window.dispatchEvent(new CustomEvent('managerCartUpdated'));
      toast.success(`Товар "${fields.title}" добавлен в корзину поставки`);
    } catch (e) {
      toast.error('Ошибка при добавлении товара из заявки');
    }
  };

  // Перейти к созданию поставки
  const goToPurchaseOrder = () => {
    router.push('/manager/create-purchase-order');
  };

  const handleDeleteConfirm = () => {
    if (!dialogState.applicationId) return;

    startTransition(async () => {
      const result = await deleteApplication(dialogState.applicationId);
      if (result.success) {
        toast.success(result.message);
        setApplications(prev => prev.filter(item => item.id !== dialogState.applicationId));
      } else {
        toast.error(result.message);
      }
      setDialogState({ isOpen: false, applicationId: '' });
    });
  };

  return (
    <div className="space-y-8 p-6">
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, applicationId: '' })}
        onConfirm={handleDeleteConfirm}
        title="Подтвердите удаление"
        description="Вы уверены, что хотите удалить эту заявку? Это действие необратимо."
      />
      <h1 className="text-2xl font-bold mb-4">Заявки клиентов</h1>
      <div className="space-y-6">
        {applications.map((applicationGroup) => (
          <div key={applicationGroup.id} className="border rounded-lg p-4">
            <div className="mb-4">
              <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Заявка для клиента: {applicationGroup.customer.name}
              </h3>
              <Button 
                variant="destructive"
                size="icon"
                onClick={() => setDialogState({ isOpen: true, applicationId: applicationGroup.id })}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
              <div className="text-sm text-gray-600">
                <p>Агент: {applicationGroup.agent.full_name || 'Не указан'} | 
                Создано: {new Date(applicationGroup.created_at).toLocaleDateString()}</p>
                <div className="mt-1">
                  {applicationGroup.customer.contacts?.phone && <p>Тел: {applicationGroup.customer.contacts.phone}</p>}
                  {applicationGroup.customer.contacts?.email && <p>Email: {applicationGroup.customer.contacts.email}</p>}
                  {applicationGroup.customer.tin && <p>ИНН: {applicationGroup.customer.tin}</p>}
                  {applicationGroup.customer.kpp && <p>КПП: {applicationGroup.customer.kpp}</p>}
                  {applicationGroup.customer.delivery_address && <p>Адрес доставки: {applicationGroup.customer.delivery_address}</p>}
                  {applicationGroup.customer.payment_terms && <p>Условия оплаты: {applicationGroup.customer.payment_terms}</p>}
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Кол-во</TableHead>
                  <TableHead>Ед. изм.</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Комментарий</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicationGroup.application_items.map((subItem, idx) => {
  const used = isInManagerCart(subItem);
  return (
    <TableRow key={idx} className={used ? 'opacity-60 bg-gray-100' : ''}>
      <TableCell>{subItem.name}</TableCell>
      <TableCell>{subItem.qty}</TableCell>
      <TableCell>{subItem.unit || "-"}</TableCell>
      <TableCell>{subItem.category || "-"}</TableCell>
      <TableCell>{subItem.comment || "-"}</TableCell>
      <TableCell>
        {used ? (
          <span className="text-green-700 font-semibold">Использовано в заказе</span>
        ) : (
          <ApplicationToCartDialog
            trigger={<Button size="sm">Добавить в поставку</Button>}
            initial={subItem}
            onSubmit={addToPurchaseOrder}
          />
        )}
      </TableCell>
    </TableRow>
  );
})}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>

      {/* Действия */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Управление поставками</h2>
        <p className="text-sm text-gray-600 mb-4">
          Позиции из заявок добавляются в общую корзину поставки. 
          Перейдите на страницу создания поставки, чтобы продолжить оформление.
        </p>
        <Button onClick={goToPurchaseOrder} className="w-full">
          Перейти к созданию поставки
        </Button>
      </div>
    </div>
  );
}
