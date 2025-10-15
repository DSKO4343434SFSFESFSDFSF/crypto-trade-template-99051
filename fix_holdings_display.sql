-- ============================================
-- FIX SCRIPT - Make Your Holdings Display
-- Run this in Supabase SQL Editor
-- ============================================

-- OPTION 1: Add missing cryptocurrencies
-- This ensures all common coins exist in the cryptocurrencies table
-- ============================================
INSERT INTO public.cryptocurrencies (id, name, symbol, image_url, current_price, market_cap, market_cap_rank, total_volume, price_change_percentage_24h, price_change_percentage_7d, high_24h, low_24h, is_active)
VALUES 
  ('bitcoin', 'Bitcoin', 'BTC', 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', 43000.00, 840000000000, 1, 28000000000, 2.5, 5.3, 43500.00, 42000.00, true),
  ('ethereum', 'Ethereum', 'ETH', 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', 2250.00, 270000000000, 2, 15000000000, 1.8, 4.2, 2300.00, 2200.00, true),
  ('binancecoin', 'Binance Coin', 'BNB', 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', 305.00, 47000000000, 4, 800000000, 0.9, 2.1, 310.00, 300.00, true),
  ('cardano', 'Cardano', 'ADA', 'https://assets.coingecko.com/coins/images/975/small/cardano.png', 0.52, 18000000000, 7, 350000000, 3.2, 6.8, 0.54, 0.50, true),
  ('solana', 'Solana', 'SOL', 'https://assets.coingecko.com/coins/images/4128/small/solana.png', 98.50, 42000000000, 5, 2500000000, 4.1, 8.5, 102.00, 95.00, true),
  ('ripple', 'XRP', 'XRP', 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', 0.62, 33000000000, 6, 1200000000, 1.5, 3.7, 0.64, 0.60, true),
  ('polkadot', 'Polkadot', 'DOT', 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png', 7.20, 9500000000, 11, 280000000, 2.8, 5.9, 7.40, 7.00, true),
  ('dogecoin', 'Dogecoin', 'DOGE', 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png', 0.085, 12000000000, 9, 580000000, 5.6, 12.3, 0.090, 0.080, true),
  ('avalanche-2', 'Avalanche', 'AVAX', 'https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png', 36.50, 13500000000, 8, 450000000, 3.9, 7.2, 38.00, 35.00, true),
  ('chainlink', 'Chainlink', 'LINK', 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png', 14.80, 8200000000, 12, 420000000, 2.3, 4.8, 15.20, 14.40, true),
  ('litecoin', 'Litecoin', 'LTC', 'https://assets.coingecko.com/coins/images/2/small/litecoin.png', 72.50, 5400000000, 14, 380000000, 1.2, 2.9, 74.00, 71.00, true),
  ('polygon', 'Polygon', 'MATIC', 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png', 0.85, 7900000000, 13, 320000000, 4.5, 9.1, 0.88, 0.82, true),
  ('tron', 'TRON', 'TRX', 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png', 0.105, 9300000000, 10, 290000000, 0.8, 1.9, 0.108, 0.102, true),
  ('stellar', 'Stellar', 'XLM', 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png', 0.125, 3500000000, 18, 95000000, 2.1, 4.5, 0.130, 0.120, true),
  ('cosmos', 'Cosmos', 'ATOM', 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png', 9.80, 3800000000, 17, 180000000, 3.6, 7.8, 10.20, 9.50, true),
  ('tether', 'Tether', 'USDT', 'https://assets.coingecko.com/coins/images/325/small/Tether.png', 1.00, 91000000000, 3, 45000000000, 0.01, 0.02, 1.001, 0.999, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  symbol = EXCLUDED.symbol,
  image_url = EXCLUDED.image_url,
  current_price = EXCLUDED.current_price,
  market_cap = EXCLUDED.market_cap,
  market_cap_rank = EXCLUDED.market_cap_rank,
  total_volume = EXCLUDED.total_volume,
  price_change_percentage_24h = EXCLUDED.price_change_percentage_24h,
  price_change_percentage_7d = EXCLUDED.price_change_percentage_7d,
  high_24h = EXCLUDED.high_24h,
  low_24h = EXCLUDED.low_24h,
  is_active = EXCLUDED.is_active,
  last_updated = NOW();

-- ============================================
-- OPTION 2: Fix mismatched IDs
-- If your user_purchases has different IDs, this will show you
-- ============================================
-- Run this to see if there are any purchases with unknown coin IDs:
SELECT DISTINCT 
  up.cryptocurrency_id as purchase_coin_id,
  'This ID is NOT in cryptocurrencies table' as issue
FROM public.user_purchases up
LEFT JOIN public.cryptocurrencies c ON up.cryptocurrency_id = c.id
WHERE c.id IS NULL
  AND up.status = 'completed';

-- ============================================  
-- OPTION 3: If you see mismatched IDs above,
-- you can manually add them to cryptocurrencies table:
-- ============================================
-- Example: If you have purchases with ID 'btc' but cryptocurrencies has 'bitcoin'
-- Uncomment and modify this:
/*
INSERT INTO public.cryptocurrencies (id, name, symbol, image_url, current_price, market_cap_rank, is_active)
VALUES 
  ('YOUR_COIN_ID_HERE', 'Coin Name', 'SYMBOL', 'https://example.com/image.png', 1000.00, 1, true)
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================
-- VERIFY THE FIX
-- ============================================
-- After running the fix, check your portfolio:
SELECT * FROM public.user_portfolio_summary 
WHERE user_id = auth.uid();

-- You should now see your holdings!
