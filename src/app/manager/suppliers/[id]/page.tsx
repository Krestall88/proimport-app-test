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
  return <SupplierDetail supplier={supplier} canEdit={canEdit} />;
}
ManagerSupplierDetailPage.displayName = 'ManagerSupplierDetailPage';
export default ManagerSupplierDetailPage;
