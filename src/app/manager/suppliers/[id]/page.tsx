import React from 'react';
import { Supplier } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import SupplierDetail from './SupplierDetail';
import { notFound } from 'next/navigation';

const ManagerSupplierDetailPage = async function (props: any) {
  const { params } = props;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const { data: supplier } = await supabase.from('suppliers').select('*').eq('id', params.id).single();
  if (!supplier) return notFound();
  const canEdit = profile?.role === 'owner';

  // Нормализация полей supplier
  const normalizedSupplier = {
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
  };

  return <SupplierDetail supplier={normalizedSupplier} canEdit={canEdit} />;
}
ManagerSupplierDetailPage.displayName = 'ManagerSupplierDetailPage';
export default ManagerSupplierDetailPage;
