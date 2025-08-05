BEGIN;

-- Add new columns if they don't exist
ALTER TABLE public.goods_receipt_items
ADD COLUMN IF NOT EXISTS batch_number TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS characteristics JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now() NOT NULL;

-- Drop the unnecessary column
ALTER TABLE public.goods_receipt_items
DROP COLUMN IF EXISTS storage_location;

COMMIT;
