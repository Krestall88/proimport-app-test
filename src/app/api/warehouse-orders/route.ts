import { NextResponse } from 'next/server';
import { getCustomerOrders } from '@/lib/actions/warehouse';

import { cookies } from 'next/headers';

export async function GET() {
  const allCookies = await cookies();
  const orders = await getCustomerOrders(allCookies);
  return NextResponse.json(orders);
}
