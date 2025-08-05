BEGIN;

-- Ensure the moddatetime extension is enabled for auto-updating timestamps
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

-- Add all required columns to the table
ALTER TABLE public.goods_receipt_items
ADD COLUMN IF NOT EXISTS batch_number TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS characteristics JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Drop the unnecessary column
ALTER TABLE public.goods_receipt_items
DROP COLUMN IF EXISTS storage_location;

-- Create the trigger for automatically updating the 'updated_at' timestamp
DROP TRIGGER IF EXISTS handle_updated_at ON public.goods_receipt_items;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.goods_receipt_items
  FOR EACH ROW
  EXECUTE PROCEDURE extensions.moddatetime (updated_at);

COMMIT;
