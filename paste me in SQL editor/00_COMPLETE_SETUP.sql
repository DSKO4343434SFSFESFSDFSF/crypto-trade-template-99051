-- ============================================
-- COMPLETE DATABASE SETUP SCRIPT
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE CRYPTOCURRENCIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.cryptocurrencies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  image_url TEXT,
  current_price DECIMAL(20, 8),
  market_cap BIGINT,
  market_cap_rank INTEGER,
  total_volume BIGINT,
  price_change_percentage_24h DECIMAL(10, 4),
  price_change_percentage_7d DECIMAL(10, 4),
  high_24h DECIMAL(20, 8),
  low_24h DECIMAL(20, 8),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cryptocurrencies_symbol ON public.cryptocurrencies(symbol);
CREATE INDEX IF NOT EXISTS idx_cryptocurrencies_market_cap_rank ON public.cryptocurrencies(market_cap_rank);
CREATE INDEX IF NOT EXISTS idx_cryptocurrencies_is_active ON public.cryptocurrencies(is_active);

-- Enable RLS
ALTER TABLE public.cryptocurrencies ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow authenticated users to read cryptocurrencies" ON public.cryptocurrencies;
CREATE POLICY "Allow authenticated users to read cryptocurrencies" 
ON public.cryptocurrencies 
FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage cryptocurrencies" ON public.cryptocurrencies;
CREATE POLICY "Allow authenticated users to manage cryptocurrencies" 
ON public.cryptocurrencies 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- ============================================
-- 2. CREATE USER PURCHASES TABLE
-- ============================================
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON public.user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_cryptocurrency_id ON public.user_purchases(cryptocurrency_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_purchase_date ON public.user_purchases(purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON public.user_purchases(status);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_crypto ON public.user_purchases(user_id, cryptocurrency_id);

-- Enable RLS
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read their own purchases" ON public.user_purchases;
DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.user_purchases;
DROP POLICY IF EXISTS "Users can update their own purchases" ON public.user_purchases;
DROP POLICY IF EXISTS "Users can delete their own purchases" ON public.user_purchases;

-- Create policies
CREATE POLICY "Users can read their own purchases" 
ON public.user_purchases 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" 
ON public.user_purchases 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases" 
ON public.user_purchases 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchases" 
ON public.user_purchases 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- ============================================
-- 3. CREATE UPDATE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_purchases_updated_at ON public.user_purchases;
CREATE TRIGGER update_user_purchases_updated_at
  BEFORE UPDATE ON public.user_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. CREATE PORTFOLIO VIEW
-- ============================================
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

-- ============================================
-- 5. INSERT SAMPLE DATA
-- ============================================
INSERT INTO public.cryptocurrencies (id, name, symbol, image_url, current_price, market_cap, market_cap_rank, total_volume, price_change_percentage_24h, price_change_percentage_7d, high_24h, low_24h, is_active)
VALUES 
  ('bitcoin', 'Bitcoin', 'BTC', 'https://www.coinlore.com/img/bitcoin.png', 43000.00, 840000000000, 1, 28000000000, 2.5, 5.3, 43500.00, 42000.00, true),
  ('ethereum', 'Ethereum', 'ETH', 'https://www.coinlore.com/img/ethereum.png', 2250.00, 270000000000, 2, 15000000000, 1.8, 4.2, 2300.00, 2200.00, true),
  ('binancecoin', 'Binance Coin', 'BNB', 'https://www.coinlore.com/img/binance-coin.png', 305.00, 47000000000, 4, 800000000, 0.9, 2.1, 310.00, 300.00, true),
  ('cardano', 'Cardano', 'ADA', 'https://www.coinlore.com/img/cardano.png', 0.52, 18000000000, 7, 350000000, 3.2, 6.8, 0.54, 0.50, true),
  ('solana', 'Solana', 'SOL', 'https://www.coinlore.com/img/solana.png', 98.50, 42000000000, 5, 2500000000, 4.1, 8.5, 102.00, 95.00, true),
  ('ripple', 'XRP', 'XRP', 'https://www.coinlore.com/img/ripple.png', 0.62, 33000000000, 6, 1200000000, 1.5, 3.7, 0.64, 0.60, true),
  ('polkadot', 'Polkadot', 'DOT', 'https://www.coinlore.com/img/polkadot.png', 7.20, 9500000000, 11, 280000000, 2.8, 5.9, 7.40, 7.00, true),
  ('dogecoin', 'Dogecoin', 'DOGE', 'https://www.coinlore.com/img/dogecoin.png', 0.085, 12000000000, 9, 580000000, 5.6, 12.3, 0.090, 0.080, true),
  ('avalanche-2', 'Avalanche', 'AVAX', 'https://www.coinlore.com/img/avalanche.png', 36.50, 13500000000, 8, 450000000, 3.9, 7.2, 38.00, 35.00, true),
  ('chainlink', 'Chainlink', 'LINK', 'https://www.coinlore.com/img/chainlink.png', 14.80, 8200000000, 12, 420000000, 2.3, 4.8, 15.20, 14.40, true),
  ('litecoin', 'Litecoin', 'LTC', 'https://www.coinlore.com/img/litecoin.png', 72.50, 5400000000, 14, 380000000, 1.2, 2.9, 74.00, 71.00, true),
  ('polygon', 'Polygon', 'MATIC', 'https://www.coinlore.com/img/polygon.png', 0.85, 7900000000, 13, 320000000, 4.5, 9.1, 0.88, 0.82, true),
  ('tron', 'TRON', 'TRX', 'https://www.coinlore.com/img/tron.png', 0.105, 9300000000, 10, 290000000, 0.8, 1.9, 0.108, 0.102, true),
  ('stellar', 'Stellar', 'XLM', 'https://www.coinlore.com/img/stellar.png', 0.125, 3500000000, 18, 95000000, 2.1, 4.5, 0.130, 0.120, true),
  ('cosmos', 'Cosmos', 'ATOM', 'https://www.coinlore.com/img/cosmos.png', 9.80, 3800000000, 17, 180000000, 3.6, 7.8, 10.20, 9.50, true)
ON CONFLICT (id) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  market_cap_rank = EXCLUDED.market_cap_rank,
  total_volume = EXCLUDED.total_volume,
  price_change_percentage_24h = EXCLUDED.price_change_percentage_24h,
  price_change_percentage_7d = EXCLUDED.price_change_percentage_7d,
  high_24h = EXCLUDED.high_24h,
  low_24h = EXCLUDED.low_24h,
  last_updated = NOW();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- You can now:
-- 1. View cryptocurrencies in the cryptocurrencies table
-- 2. Purchase coins through the app (they'll be stored in user_purchases)
-- 3. View your portfolio summary in the user_portfolio_summary view
-- 4. Add more cryptocurrencies by inserting into the cryptocurrencies table
-- ============================================
