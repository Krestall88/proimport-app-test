'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Customer } from '@/lib/types';
import { updateClient, deleteClient } from '@/app/clients/actions';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ClientDetailProps {
  client: Customer;
  canEdit: boolean;
}

export default function ClientDetail({ client, canEdit }: ClientDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [dialogState, setDialogState] = useState({ isOpen: false, action: '' as 'delete' | '' });
  
  const [formData, setFormData] = useState({
    name: client.name || '',
    tin: client.tin || '',
    kpp: client.kpp || '',
    delivery_address: client.delivery_address || '',
    payment_terms: client.payment_terms || '',
    'contacts.phone': client.contacts?.phone || '',
    'contacts.email': client.contacts?.email || '',
    comments: client.comments || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      const result = await updateClient(client.id, form);
      if (result.success) {
        toast.success(result.message);
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const openDeleteDialog = () => {
    setDialogState({ isOpen: true, action: 'delete' });
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const result = await deleteClient(client.id);
      if (result.success) {
        toast.success(result.message);
        router.push('/agent/clients');
      } else {
        toast.error(result.message);
      }
      setDialogState({ isOpen: false, action: '' });
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, action: '' })}
        onConfirm={confirmDelete}
        title="Подтвердите удаление"
        description="Вы уверены, что хотите удалить этого клиента? Это действие необратимо."
      />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isEditing ? 'Редактирование клиента' : 'Карточка клиента'}</h1>
        <div className="flex space-x-2">
          {canEdit && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Редактировать
              </button>
              <button
                onClick={openDeleteDialog}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Удалить
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isPending}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Сохранить
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium">Название компании *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>
            
            <div>
              <label htmlFor="tin" className="block mb-2 text-sm font-medium">ИНН</label>
              <input
                type="text"
                id="tin"
                name="tin"
                value={formData.tin}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="kpp" className="block mb-2 text-sm font-medium">КПП</label>
              <input
                type="text"
                id="kpp"
                name="kpp"
                value={formData.kpp}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="contacts.phone" className="block mb-2 text-sm font-medium">Телефон</label>
              <input
                type="tel"
                id="contacts.phone"
                name="contacts.phone"
                value={formData['contacts.phone']}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="contacts.email" className="block mb-2 text-sm font-medium">Email</label>
              <input
                type="email"
                id="contacts.email"
                name="contacts.email"
                value={formData['contacts.email']}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label htmlFor="delivery_address" className="block mb-2 text-sm font-medium">Адрес доставки</label>
              <input
                type="text"
                id="delivery_address"
                name="delivery_address"
                value={formData.delivery_address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="payment_terms" className="block mb-2 text-sm font-medium">Условия оплаты</label>
              <input
                type="text"
                id="payment_terms"
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="comments" className="block mb-2 text-sm font-medium">Комментарии</label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                rows={3}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
