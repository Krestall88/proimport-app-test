// Вкладка поставщиков для руководителя, аналог clients/page.tsx

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import SupplierList from '@/app/manager/SupplierList';
import { getSuppliers } from '@/lib/actions/suppliers';

interface SupplierInfo {
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
  return <SupplierTableClient suppliers={suppliers || []} canDelete={canDelete} />;
}

