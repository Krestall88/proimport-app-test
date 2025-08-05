import { redirect } from 'next/navigation';

export default function WarehousePage() {
  // Redirect to the first page in the warehouse module
  redirect('/warehouse/pending-shipments');
}

