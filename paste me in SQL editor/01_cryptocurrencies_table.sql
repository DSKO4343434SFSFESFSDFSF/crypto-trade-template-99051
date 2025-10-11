-- Create cryptocurrencies table
-- This table stores all available cryptocurrencies that users can purchase

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cryptocurrencies_symbol ON public.cryptocurrencies(symbol);
CREATE INDEX IF NOT EXISTS idx_cryptocurrencies_market_cap_rank ON public.cryptocurrencies(market_cap_rank);
CREATE INDEX IF NOT EXISTS idx_cryptocurrencies_is_active ON public.cryptocurrencies(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cryptocurrencies ENABLE ROW LEVEL SECURITY;

-- Create policies for cryptocurrencies table
-- Allow all authenticated users to read cryptocurrencies
CREATE POLICY "Allow authenticated users to read cryptocurrencies" 
ON public.cryptocurrencies 
FOR SELECT 
TO authenticated 
USING (true);

-- Only allow admins to insert/update/delete (you can modify this based on your needs)
-- For now, we'll allow inserts from authenticated users
CREATE POLICY "Allow authenticated users to manage cryptocurrencies" 
ON public.cryptocurrencies 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

COMMENT ON TABLE public.cryptocurrencies IS 'Stores information about available cryptocurrencies';
