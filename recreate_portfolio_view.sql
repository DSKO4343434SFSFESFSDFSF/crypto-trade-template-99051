-- ============================================
-- RECREATE PORTFOLIO VIEW
-- Run this if the view is corrupted or not working
-- ============================================

-- Drop and recreate the view
DROP VIEW IF EXISTS public.user_portfolio_summary;

CREATE VIEW public.user_portfolio_summary AS
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

COMMENT ON VIEW public.user_portfolio_summary IS 'Aggregated view of user portfolio with profit/loss calculations';

-- Test the view
SELECT * FROM public.user_portfolio_summary 
WHERE user_id = auth.uid();
