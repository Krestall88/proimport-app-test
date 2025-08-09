'use client';
import { useEffect, useState } from 'react';
import { getSuppliers } from '@/lib/actions/suppliers';
import SupplierCard from './SupplierCard';

// Импортируйте SupplierInfo, если он определён в другом месте, либо определите локально:
interface SupplierInfo {
  id: string;
  name: string;
  tin?: string;
  kpp?: string;
  contacts?: { phone?: string; email?: string };
  delivery_address?: string;
  payment_terms?: string;
}

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuppliers().then(data => {
      setSuppliers(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (!suppliers.length) return <div>Поставщики не найдены</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {suppliers.map((supplier: any) => (
        <SupplierCard key={supplier.id} supplier={supplier} />
      ))}
    </div>
  );
}
