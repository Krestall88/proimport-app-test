'use server';
import { confirmOrderShipped } from '@/lib/actions/driver-orders';

export async function confirmShippedAction(orderId: string) {
  'use server';
  return confirmOrderShipped(orderId);
}
