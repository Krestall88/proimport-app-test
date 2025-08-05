'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Customer } from '@/lib/types';
import { deleteClient } from '@/app/clients/actions';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useRouter } from 'next/navigation';

export default function ClientsPageClient({ customers, canDelete }: { customers: Customer[]; canDelete: boolean; }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogState, setDialogState] = useState({ isOpen: false, clientId: '', clientName: '' });

  const openDeleteDialog = (clientId: string, clientName: string) => {
    setDialogState({ isOpen: true, clientId, clientName });
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const result = await deleteClient(dialogState.clientId);
      if (result.success) {
        toast.success(result.message);
        // Обновляем страницу
        router.refresh();
      } else {
        toast.error(result.message);
      }
      setDialogState({ isOpen: false, clientId: '', clientName: '' });
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, clientId: '', clientName: '' })}
        onConfirm={confirmDelete}
        title="Подтвердите удаление"
        description={`Вы уверены, что хотите удалить клиента ${dialogState.clientName}? Это действие необратимо.`}
      />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление клиентами</h1>
        <Link 
          href="/agent/clients/create"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Добавить клиента
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4">Название компании</th>
                <th className="p-4">ИНН</th>
                <th className="p-4">КПП</th>
                <th className="p-4">Адрес</th>
                <th className="p-4">Адрес доставки</th>
                <th className="p-4">Телефон</th>
                <th className="p-4">Email</th>
                <th className="p-4">Условия оплаты</th>
                {canDelete && <th className="p-4">Действия</th>}
              </tr>
            </thead>
            <tbody>
              {customers?.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4 font-medium">
                    <Link href={`/agent/clients/${customer.id}`} className="text-blue-400 hover:underline">
                      {customer.name}
                    </Link>
                  </td>
                  <td className="p-4">{customer.tin || '-'}</td>
                  <td className="p-4">{customer.kpp || '-'}</td>
                  <td className="p-4 text-gray-400">{customer.address || '-'}</td>
                  <td className="p-4">{customer.delivery_address || '-'}</td>
                  <td className="p-4">{customer.contacts?.phone || '-'}</td>
                  <td className="p-4">{customer.contacts?.email || '-'}</td>
                  <td className="p-4">{customer.payment_terms || '-'}</td>
                  {canDelete && (
                    <td className="p-4">
                      <button
                        onClick={() => openDeleteDialog(customer.id, customer.name)}
                        disabled={isPending}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        Удалить
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
