-- ============================================
-- DIAGNOSTIC QUERY - Find Why Holdings Don't Show
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check if you have any purchases at all
SELECT 'Total purchases count' as check_name, COUNT(*) as count
FROM public.user_purchases
WHERE status = 'completed'

UNION ALL

-- 2. Check your user_purchases records
SELECT 'Your completed purchases' as check_name, COUNT(*) as count
FROM public.user_purchases
WHERE status = 'completed' AND user_id = auth.uid()

UNION ALL

-- 3. Check cryptocurrencies table
SELECT 'Total cryptocurrencies' as check_name, COUNT(*) as count
FROM public.cryptocurrencies

UNION ALL

-- 4. Check matching records (this shows the problem)
SELECT 'Matching purchases (in portfolio)' as check_name, COUNT(*) as count
FROM public.user_purchases up
JOIN public.cryptocurrencies c ON up.cryptocurrency_id = c.id
WHERE up.status = 'completed' AND up.user_id = auth.uid();

-- ============================================
-- DETAILED VIEW: Show your purchases and whether they match
-- ============================================
SELECT 
  'Your purchases detail' as section,
  up.cryptocurrency_id,
  up.amount,
  up.purchase_price,
  up.status,
  up.purchase_date,
  CASE 
    WHEN c.id IS NOT NULL THEN '✅ Coin exists in cryptocurrencies table'
    ELSE '❌ MISSING - This coin ID is NOT in cryptocurrencies table'
  END as coin_status,
  c.name as coin_name,
  c.symbol as coin_symbol,
  c.current_price
FROM public.user_purchases up
LEFT JOIN public.cryptocurrencies c ON up.cryptocurrency_id = c.id
WHERE up.user_id = auth.uid()
ORDER BY up.purchase_date DESC;

-- ============================================
-- SOLUTION: If coins are missing, see what IDs are available
-- ============================================
SELECT 
  'Available coin IDs' as section,
  id as cryptocurrency_id,
  name,
  symbol,
  current_price,
  is_active
FROM public.cryptocurrencies
WHERE is_active = true
ORDER BY market_cap_rank;
