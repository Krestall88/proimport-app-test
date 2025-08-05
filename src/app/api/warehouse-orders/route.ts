import { NextResponse } from 'next/server';
import { getCustomerOrders } from '@/lib/actions/warehouse';

export async function GET() {
  const orders = await getCustomerOrders();
  return NextResponse.json(orders);
}
