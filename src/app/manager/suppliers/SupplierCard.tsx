import React from 'react';

interface SupplierCardProps {
  supplier: any;
}

export default function SupplierCard({ supplier }: SupplierCardProps) {
  const contacts = supplier.contacts || {};
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-md flex flex-col gap-2">
      <h2 className="text-xl font-bold mb-2">{supplier.name}</h2>
      <div className="text-sm text-gray-400">ИНН: {supplier.tin || '-'}</div>
      <div className="text-sm text-gray-400">КПП: {supplier.kpp || '-'}</div>
      <div className="text-sm text-gray-400">Адрес доставки: {supplier.delivery_address || '-'}</div>
      <div className="text-sm text-gray-400">Условия оплаты: {supplier.payment_terms || '-'}</div>
      <div className="text-sm text-gray-400">Телефон: {contacts.phone || '-'}</div>
      <div className="text-sm text-gray-400">Email: {contacts.email || '-'}</div>
      <div className="text-sm text-gray-400">Комментарий: {supplier.comments || supplier.comment || '-'}</div>
    </div>
  );
}
