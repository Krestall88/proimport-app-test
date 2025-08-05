ALTER TABLE public.customer_wishlist
ADD COLUMN IF NOT EXISTS wishlist_items jsonb;
