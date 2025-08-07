import { NextRequest, NextResponse } from 'next/server';
import { createProductFromWishlist } from '@/app/manager/create-purchase-order/actions';

export async function POST(request: NextRequest) {
  try {
    const fields = await request.json();
    const result = await createProductFromWishlist(fields);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ product: result.product });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
