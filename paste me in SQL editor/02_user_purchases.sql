-- Create user_purchases table
-- This table tracks all cryptocurrency purchases made by users

CREATE TABLE IF NOT EXISTS public.user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cryptocurrency_id TEXT NOT NULL REFERENCES public.cryptocurrencies(id) ON DELETE RESTRICT,
  amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
  purchase_price DECIMAL(20, 8) NOT NULL,
  total_cost DECIMAL(20, 8) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  transaction_hash TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON public.user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_cryptocurrency_id ON public.user_purchases(cryptocurrency_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_purchase_date ON public.user_purchases(purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON public.user_purchases(status);

-- Create a composite index for user-specific queries
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_crypto ON public.user_purchases(user_id, cryptocurrency_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for user_purchases table
-- Users can only read their own purchases
CREATE POLICY "Users can read their own purchases" 
ON public.user_purchases 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can insert their own purchases
CREATE POLICY "Users can insert their own purchases" 
ON public.user_purchases 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own purchases
CREATE POLICY "Users can update their own purchases" 
ON public.user_purchases 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own purchases
CREATE POLICY "Users can delete their own purchases" 
ON public.user_purchases 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_purchases_updated_at ON public.user_purchases;
CREATE TRIGGER update_user_purchases_updated_at
  BEFORE UPDATE ON public.user_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a view for user portfolio summary
CREATE OR REPLACE VIEW public.user_portfolio_summary AS
SELECT 
  up.user_id,
  up.cryptocurrency_id,
  c.name,
  c.symbol,
  c.image_url,
  SUM(up.amount) as total_amount,
  AVG(up.purchase_price) as average_purchase_price,
  SUM(up.total_cost) as total_invested,
  c.current_price,
  (c.current_price * SUM(up.amount)) as current_value,
  ((c.current_price * SUM(up.amount)) - SUM(up.total_cost)) as profit_loss,
  (((c.current_price * SUM(up.amount)) - SUM(up.total_cost)) / NULLIF(SUM(up.total_cost), 0) * 100) as profit_loss_percentage
FROM public.user_purchases up
JOIN public.cryptocurrencies c ON up.cryptocurrency_id = c.id
WHERE up.status = 'completed'
GROUP BY up.user_id, up.cryptocurrency_id, c.name, c.symbol, c.image_url, c.current_price;

COMMENT ON TABLE public.user_purchases IS 'Stores user cryptocurrency purchase transactions';
COMMENT ON VIEW public.user_portfolio_summary IS 'Aggregated view of user portfolio with profit/loss calculations';
