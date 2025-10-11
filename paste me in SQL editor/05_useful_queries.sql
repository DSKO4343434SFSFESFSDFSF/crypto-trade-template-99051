-- ============================================
-- USEFUL QUERIES FOR MANAGING PURCHASES
-- ============================================
-- Run these queries in Supabase SQL Editor to view and manage purchase data

-- ============================================
-- 1. VIEW ALL YOUR PURCHASES
-- ============================================
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- You can get your user ID from the Supabase dashboard or from the app console

SELECT 
  up.id,
  up.cryptocurrency_id,
  c.name as coin_name,
  c.symbol,
  up.amount,
  up.purchase_price,
  up.total_cost,
  up.purchase_date,
  up.status
FROM public.user_purchases up
JOIN public.cryptocurrencies c ON up.cryptocurrency_id = c.id
WHERE up.user_id = 'YOUR_USER_ID'
ORDER BY up.purchase_date DESC;

-- ============================================
-- 2. VIEW YOUR PORTFOLIO SUMMARY
-- ============================================
-- This shows aggregated holdings with profit/loss

SELECT 
  name,
  symbol,
  total_amount as holdings,
  average_purchase_price as avg_buy_price,
  current_price,
  total_invested,
  current_value,
  profit_loss,
  ROUND(profit_loss_percentage::numeric, 2) as profit_loss_percent
FROM public.user_portfolio_summary
WHERE user_id = 'YOUR_USER_ID'
ORDER BY current_value DESC;

-- ============================================
-- 3. TOTAL PORTFOLIO VALUE
-- ============================================
-- Get your total investment vs current value

SELECT 
  SUM(total_invested) as total_invested,
  SUM(current_value) as total_current_value,
  SUM(profit_loss) as total_profit_loss,
  ROUND((SUM(profit_loss) / NULLIF(SUM(total_invested), 0) * 100)::numeric, 2) as total_return_percent
FROM public.user_portfolio_summary
WHERE user_id = 'YOUR_USER_ID';

-- ============================================
-- 4. PURCHASE HISTORY BY COIN
-- ============================================
-- View all purchases for a specific cryptocurrency

SELECT 
  up.purchase_date,
  up.amount,
  up.purchase_price,
  up.total_cost,
  c.current_price,
  (c.current_price * up.amount) as current_value,
  ((c.current_price * up.amount) - up.total_cost) as profit_loss
FROM public.user_purchases up
JOIN public.cryptocurrencies c ON up.cryptocurrency_id = c.id
WHERE up.user_id = 'YOUR_USER_ID'
  AND up.cryptocurrency_id = 'bitcoin'  -- Change to desired coin ID
ORDER BY up.purchase_date DESC;

-- ============================================
-- 5. TOP PERFORMING COINS IN YOUR PORTFOLIO
-- ============================================
-- See which coins are making you the most money

SELECT 
  name,
  symbol,
  total_amount,
  profit_loss,
  ROUND(profit_loss_percentage::numeric, 2) as return_percent
FROM public.user_portfolio_summary
WHERE user_id = 'YOUR_USER_ID'
  AND profit_loss > 0
ORDER BY profit_loss_percentage DESC;

-- ============================================
-- 6. WORST PERFORMING COINS IN YOUR PORTFOLIO
-- ============================================
-- See which coins are losing money

SELECT 
  name,
  symbol,
  total_amount,
  profit_loss,
  ROUND(profit_loss_percentage::numeric, 2) as return_percent
FROM public.user_portfolio_summary
WHERE user_id = 'YOUR_USER_ID'
  AND profit_loss < 0
ORDER BY profit_loss_percentage ASC;

-- ============================================
-- 7. RECENT PURCHASES (LAST 7 DAYS)
-- ============================================

SELECT 
  c.name,
  c.symbol,
  up.amount,
  up.purchase_price,
  up.total_cost,
  up.purchase_date
FROM public.user_purchases up
JOIN public.cryptocurrencies c ON up.cryptocurrency_id = c.id
WHERE up.user_id = 'YOUR_USER_ID'
  AND up.purchase_date >= NOW() - INTERVAL '7 days'
ORDER BY up.purchase_date DESC;

-- ============================================
-- 8. MONTHLY SPENDING SUMMARY
-- ============================================
-- See how much you've spent each month

SELECT 
  DATE_TRUNC('month', purchase_date) as month,
  COUNT(*) as number_of_purchases,
  SUM(total_cost) as total_spent
FROM public.user_purchases
WHERE user_id = 'YOUR_USER_ID'
  AND status = 'completed'
GROUP BY DATE_TRUNC('month', purchase_date)
ORDER BY month DESC;

-- ============================================
-- 9. MOST PURCHASED COINS
-- ============================================
-- See which coins you buy the most

SELECT 
  c.name,
  c.symbol,
  COUNT(*) as number_of_purchases,
  SUM(up.amount) as total_amount,
  SUM(up.total_cost) as total_spent
FROM public.user_purchases up
JOIN public.cryptocurrencies c ON up.cryptocurrency_id = c.id
WHERE up.user_id = 'YOUR_USER_ID'
  AND up.status = 'completed'
GROUP BY c.name, c.symbol
ORDER BY number_of_purchases DESC;

-- ============================================
-- 10. DELETE A PURCHASE (USE CAREFULLY!)
-- ============================================
-- Only delete if you made a mistake

DELETE FROM public.user_purchases
WHERE id = 'PURCHASE_ID_HERE'
  AND user_id = 'YOUR_USER_ID';

-- ============================================
-- 11. CANCEL A PENDING PURCHASE
-- ============================================

UPDATE public.user_purchases
SET status = 'cancelled'
WHERE id = 'PURCHASE_ID_HERE'
  AND user_id = 'YOUR_USER_ID'
  AND status = 'pending';

-- ============================================
-- 12. GET YOUR USER ID
-- ============================================
-- Run this to find your user ID
-- (You need to be logged in for this to work)

SELECT auth.uid() as my_user_id;

-- Or view all users (if you have access):
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- TIPS:
-- ============================================
-- - Always replace 'YOUR_USER_ID' with your actual user ID
-- - You can get your user ID from the browser console when logged in
--   (it's in the user object after authentication)
-- - The user_portfolio_summary view automatically updates when prices change
-- - All calculations use current_price from the cryptocurrencies table
-- - To update prices, modify the cryptocurrencies table
-- ============================================
