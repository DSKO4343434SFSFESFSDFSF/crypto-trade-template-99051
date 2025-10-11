-- Sample cryptocurrency data
-- Run this to populate the cryptocurrencies table with initial data
-- You can modify or add more cryptocurrencies as needed

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

-- Note: The prices above are sample data. In production, you would:
-- 1. Fetch real-time data from CoinGecko or similar API
-- 2. Set up a scheduled job to update prices regularly
-- 3. Use the existing coingecko.ts service to sync data
