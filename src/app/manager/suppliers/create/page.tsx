'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createSupplier } from '@/lib/actions/suppliers';
import { toast } from 'sonner';

export default function CreateSupplierPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    tin: '',
    kpp: '',
    delivery_address: '',
    payment_terms: '',
    'contacts.phone': '',
    'contacts.email': '',
    comments: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });
      const result = await createSupplier(form);
      if (result.success) {
        toast.success(result.message);
        router.push('/manager/suppliers');
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Добавить поставщика</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg shadow">
        <div>
          <label htmlFor="name" className="block mb-2 text-sm font-medium">Название</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500" />
        </div>
        <div>
          <label htmlFor="tin" className="block mb-2 text-sm font-medium">ИНН</label>
          <input type="text" id="tin" name="tin" value={formData.tin} onChange={handleInputChange} className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400" />
        </div>
        <div>
          <label htmlFor="kpp" className="block mb-2 text-sm font-medium">КПП</label>
          <input type="text" id="kpp" name="kpp" value={formData.kpp} onChange={handleInputChange} className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400" />
        </div>
        <div>
          <label htmlFor="delivery_address" className="block mb-2 text-sm font-medium">Адрес доставки</label>
          <input type="text" id="delivery_address" name="delivery_address" value={formData.delivery_address} onChange={handleInputChange} className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400" />
        </div>
        <div>
          <label htmlFor="payment_terms" className="block mb-2 text-sm font-medium">Условия оплаты</label>
          <input type="text" id="payment_terms" name="payment_terms" value={formData.payment_terms} onChange={handleInputChange} className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400" />
        </div>
        <div>
          <label htmlFor="contacts.phone" className="block mb-2 text-sm font-medium">Телефон</label>
          <input type="tel" id="contacts.phone" name="contacts.phone" value={formData['contacts.phone']} onChange={handleInputChange} className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400" />
        </div>
        <div>
          <label htmlFor="contacts.email" className="block mb-2 text-sm font-medium">Email</label>
          <input type="email" id="contacts.email" name="contacts.email" value={formData['contacts.email']} onChange={handleInputChange} className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400" />
        </div>
        <div>
          <label htmlFor="comments" className="block mb-2 text-sm font-medium">Комментарии</label>
          <textarea id="comments" name="comments" value={formData.comments} onChange={handleInputChange} className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400" rows={3} />
        </div>
        <button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
          {isPending ? 'Добавление...' : 'Добавить'}
        </button>
      </form>
    </div>
  );
}
