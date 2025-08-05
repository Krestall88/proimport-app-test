'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useRouter } from 'next/navigation';
import { deleteSupplier } from '@/lib/actions/suppliers';

interface Supplier {
  id: string;
  name: string;
  tin?: string;
  kpp?: string;
  delivery_address?: string;
  contacts?: { phone?: string; email?: string };
  payment_terms?: string;
}

export default function SupplierTableClient({ suppliers, canDelete }: { suppliers: Supplier[]; canDelete: boolean; }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogState, setDialogState] = useState({ isOpen: false, supplierId: '', supplierName: '' });

  const openDeleteDialog = (supplierId: string, supplierName: string) => {
    setDialogState({ isOpen: true, supplierId, supplierName });
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const result = await deleteSupplier(dialogState.supplierId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
      setDialogState({ isOpen: false, supplierId: '', supplierName: '' });
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, supplierId: '', supplierName: '' })}
        onConfirm={confirmDelete}
        title="Подтвердите удаление"
        description={`Вы уверены, что хотите удалить поставщика ${dialogState.supplierName}? Это действие необратимо.`}
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление поставщиками</h1>
        <Link 
          href="/manager/suppliers/create"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Добавить поставщика
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
                <th className="p-4">Адрес доставки</th>
                <th className="p-4">Телефон</th>
                <th className="p-4">Email</th>
                <th className="p-4">Условия оплаты</th>
                {canDelete && <th className="p-4">Действия</th>}
              </tr>
            </thead>
            <tbody>
              {suppliers?.map((supplier) => (
                <tr key={supplier.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4 font-medium">
                    <Link href={`/manager/suppliers/${supplier.id}`} className="text-blue-400 hover:underline">
                      {supplier.name}
                    </Link>
                  </td>
                  <td className="p-4">{supplier.tin || '-'}</td>
                  <td className="p-4">{supplier.kpp || '-'}</td>
                  <td className="p-4">{supplier.delivery_address || '-'}</td>
                  <td className="p-4">{supplier.contacts?.phone || '-'}</td>
                  <td className="p-4">{supplier.contacts?.email || '-'}</td>
                  <td className="p-4">{supplier.payment_terms || '-'}</td>
                  {canDelete && (
                    <td className="p-4">
                      <button
                        onClick={() => openDeleteDialog(supplier.id, supplier.name)}
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
