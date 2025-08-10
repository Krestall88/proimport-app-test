// Вкладка поставщиков для руководителя, аналог clients/page.tsx

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import SupplierList from '@/app/manager/SupplierList';
import { getSuppliers } from '@/lib/actions/suppliers';

interface Supplier {
  id: string;
  name: string;
  tin?: string;
  kpp?: string;
  contacts?: { phone?: string; email?: string };
  delivery_address?: string;
  payment_terms?: string;
}

import { createClient } from '@/lib/supabase/server';

import SupplierTableClient from './SupplierTableClient';

export default async function ManagerSuppliersPage() {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const { data: suppliers, error } = await supabase.from('suppliers').select('*').order('name', { ascending: true });
  if (error) return <p className="text-red-500">Не удалось загрузить список поставщиков.</p>;
  const canDelete = profile?.role === 'owner';

  // Нормализация массива suppliers
  const normalizedSuppliers = (suppliers || []).map((supplier: any) => ({
    ...supplier,
    tin: supplier.tin ?? '',
    kpp: supplier.kpp ?? '',
    delivery_address: supplier.delivery_address ?? '',
    payment_terms: supplier.payment_terms ?? '',
    comments: supplier.comments ?? '',
    contacts: (() => {
      if (supplier.contacts && typeof supplier.contacts === 'object' && !Array.isArray(supplier.contacts)) {
        return {
          phone: (supplier.contacts as any).phone ?? '',
          email: (supplier.contacts as any).email ?? '',
        };
      }
      return { phone: '', email: '' };
    })(),
  }));

  return <SupplierTableClient suppliers={normalizedSuppliers} canDelete={canDelete} />;
}

