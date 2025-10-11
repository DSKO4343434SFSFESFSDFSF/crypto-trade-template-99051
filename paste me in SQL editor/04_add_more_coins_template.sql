-- ============================================
-- HOW TO ADD NEW CRYPTOCURRENCIES
-- ============================================
-- Use this template to add new coins to your database
-- Just copy, modify the values, and paste into Supabase SQL Editor

-- Single Coin Insert
INSERT INTO public.cryptocurrencies (
  id,                    -- Unique identifier (lowercase, no spaces, use hyphens)
  name,                  -- Full name of the cryptocurrency
  symbol,                -- Ticker symbol (uppercase)
  image_url,             -- URL to coin logo/image
  current_price,         -- Current price in USD
  market_cap,            -- Market capitalization
  market_cap_rank,       -- Rank by market cap
  total_volume,          -- 24h trading volume
  price_change_percentage_24h,  -- 24h price change %
  price_change_percentage_7d,   -- 7d price change %
  high_24h,              -- 24h high price
  low_24h,               -- 24h low price
  is_active              -- Whether coin is active for trading
)
VALUES (
  'uniswap',             -- id
  'Uniswap',             -- name
  'UNI',                 -- symbol
  'https://www.coinlore.com/img/uniswap.png',  -- image_url
  6.50,                  -- current_price
  5000000000,            -- market_cap
  16,                    -- market_cap_rank
  150000000,             -- total_volume
  2.5,                   -- price_change_percentage_24h
  5.2,                   -- price_change_percentage_7d
  6.70,                  -- high_24h
  6.30,                  -- low_24h
  true                   -- is_active
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
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
-- BULK INSERT TEMPLATE
-- ============================================
-- To add multiple coins at once, use this format:

INSERT INTO public.cryptocurrencies (id, name, symbol, image_url, current_price, market_cap, market_cap_rank, total_volume, price_change_percentage_24h, price_change_percentage_7d, high_24h, low_24h, is_active)
VALUES 
  ('shiba-inu', 'Shiba Inu', 'SHIB', 'https://www.coinlore.com/img/shiba-inu.png', 0.0000088, 5200000000, 15, 120000000, 1.2, 3.5, 0.0000090, 0.0000085, true),
  ('pepe', 'Pepe', 'PEPE', 'https://www.coinlore.com/img/pepe.png', 0.000012, 4800000000, 19, 95000000, 8.5, 15.2, 0.000013, 0.000011, true),
  ('near', 'NEAR Protocol', 'NEAR', 'https://www.coinlore.com/img/near.png', 5.20, 5600000000, 20, 180000000, 3.1, 7.8, 5.40, 5.00, true)
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
-- UPDATE EXISTING COIN PRICES
-- ============================================
-- Use this to update prices for an existing coin:

UPDATE public.cryptocurrencies
SET 
  current_price = 44000.00,
  market_cap = 860000000000,
  price_change_percentage_24h = 3.2,
  high_24h = 44500.00,
  low_24h = 43500.00,
  last_updated = NOW()
WHERE id = 'bitcoin';

-- ============================================
-- DEACTIVATE A COIN
-- ============================================
-- To remove a coin from active trading:

UPDATE public.cryptocurrencies
SET is_active = false
WHERE id = 'coin-id-here';

-- ============================================
-- VIEW ALL COINS
-- ============================================
-- To see all cryptocurrencies in your database:

SELECT 
  id,
  name,
  symbol,
  current_price,
  market_cap_rank,
  is_active
FROM public.cryptocurrencies
ORDER BY market_cap_rank;

-- ============================================
-- POPULAR COIN IDS FOR REFERENCE
-- ============================================
-- Here are some popular coin IDs you might want to add:
-- 
-- 'bitcoin' (BTC)
-- 'ethereum' (ETH)
-- 'binancecoin' (BNB)
-- 'ripple' (XRP)
-- 'cardano' (ADA)
-- 'solana' (SOL)
-- 'polkadot' (DOT)
-- 'dogecoin' (DOGE)
-- 'avalanche-2' (AVAX)
-- 'chainlink' (LINK)
-- 'polygon' (MATIC)
-- 'litecoin' (LTC)
-- 'shiba-inu' (SHIB)
-- 'cosmos' (ATOM)
-- 'near' (NEAR)
-- 'uniswap' (UNI)
-- 'tron' (TRX)
-- 'stellar' (XLM)
-- 'aptos' (APT)
-- 'optimism' (OP)
-- 
-- Image URLs follow the pattern:
-- https://www.coinlore.com/img/[coin-id].png
-- ============================================
