-- Add Tether (USDT) to cryptocurrencies table
-- Run this in your Supabase SQL Editor

INSERT INTO public.cryptocurrencies (id, name, symbol, image_url, current_price, market_cap, market_cap_rank, total_volume, price_change_percentage_24h, price_change_percentage_7d, high_24h, low_24h, is_active)
VALUES 
  ('tether', 'Tether', 'USDT', 'https://www.coinlore.com/img/tether.png', 1.0005, 149670000000, 3, 372800000000, 0.06, -0.02, 1.08, 1.0052, true)
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

-- Verify the insertion
SELECT * FROM public.cryptocurrencies WHERE id = 'tether';
