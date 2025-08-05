import { NextApiRequest, NextApiResponse } from 'next';
import { createProductFromWishlist } from '@/app/manager/create-purchase-order/actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const fields = req.body;
    const result = await createProductFromWishlist(fields);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(200).json({ product: result.product });
  } catch (e) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
