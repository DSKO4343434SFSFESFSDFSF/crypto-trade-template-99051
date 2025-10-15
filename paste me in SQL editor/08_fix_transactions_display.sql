-- ============================================
-- FIX TRANSACTIONS DISPLAY ISSUE
-- This fixes the "Failed to load transactions" error
-- ============================================

-- The issue is that the frontend is looking for 'usd_amount' field 
-- but the database has 'total_cost'. We'll add an alias to fix this.

-- First, let's check if there are any records in user_purchases
-- (Uncomment to check your data)
-- SELECT COUNT(*) as total_purchases FROM public.user_purchases;
-- SELECT * FROM public.user_purchases ORDER BY created_at DESC LIMIT 5;

-- ============================================
-- OPTION 1: Add usd_amount as an alias (RECOMMENDED)
-- ============================================

-- This creates a view that the frontend can use with the correct field names
CREATE OR REPLACE VIEW public.user_transactions_view AS
SELECT 
  up.id,
  up.user_id,
  up.amount,
  up.total_cost as usd_amount,  -- This fixes the frontend issue
  up.purchase_price,
  up.purchase_date,
  up.created_at,
  up.updated_at,
  up.status,
  up.notes,
  up.transaction_hash,
  c.id as cryptocurrency_id,
  c.name as cryptocurrency_name,
  c.symbol as cryptocurrency_symbol,
  c.image_url as cryptocurrency_image
FROM public.user_purchases up
JOIN public.cryptocurrencies c ON up.cryptocurrency_id = c.id
ORDER BY up.created_at DESC;

-- Enable RLS on the view
ALTER VIEW public.user_transactions_view SET (security_invoker = true);

-- Grant permissions
GRANT SELECT ON public.user_transactions_view TO authenticated;

-- ============================================
-- OPTION 2: Add actual usd_amount column (Alternative)
-- ============================================

-- If you prefer to add the actual column instead of using a view:
-- ALTER TABLE public.user_purchases ADD COLUMN IF NOT EXISTS usd_amount DECIMAL(20, 8);
-- UPDATE public.user_purchases SET usd_amount = total_cost WHERE usd_amount IS NULL;

-- ============================================
-- VERIFY THE FIX
-- ============================================

-- Test the view with your user ID (replace with your actual user ID)
-- SELECT * FROM public.user_transactions_view 
-- WHERE user_id = 'cea3d84d-7e5e-4fa3-b0b1-c131f043953b'::UUID
-- ORDER BY created_at DESC;

-- ============================================
-- ADDITIONAL DEBUGGING QUERIES
-- ============================================

-- Check if the user exists
-- SELECT id, email FROM auth.users WHERE id = 'cea3d84d-7e5e-4fa3-b0b1-c131f043953b'::UUID;

-- Check user's purchases directly
-- SELECT 
--   up.*,
--   c.name,
--   c.symbol
-- FROM public.user_purchases up
-- JOIN public.cryptocurrencies c ON up.cryptocurrency_id = c.id
-- WHERE up.user_id = 'cea3d84d-7e5e-4fa3-b0b1-c131f043953b'::UUID
-- ORDER BY up.created_at DESC;

-- Check user's portfolio summary
-- SELECT * FROM public.user_portfolio_summary 
-- WHERE user_id = 'cea3d84d-7e5e-4fa3-b0b1-c131f043953b'::UUID;

-- ============================================
-- INSTRUCTIONS FOR FRONTEND UPDATE
-- ============================================

-- OPTION A: Update the frontend to use the new view
-- Change the query in Transactions.tsx from:
-- .from('user_purchases')
-- TO:
-- .from('user_transactions_view')

-- OPTION B: Update the frontend query to use total_cost
-- Change the select in Transactions.tsx from:
-- usd_amount,
-- TO:
-- total_cost as usd_amount,

-- ============================================
-- TEST THE ADD BALANCE FUNCTION AGAIN
-- ============================================

-- Now try adding balance again (replace with your user ID):
SELECT add_balance_to_user(
  'cea3d84d-7e5e-4fa3-b0b1-c131f043953b'::UUID,
  'bitcoin',
  0.001,
  'Test balance - should show in transactions'
);

-- Check if it appears in the view:
-- SELECT * FROM public.user_transactions_view 
-- WHERE user_id = 'cea3d84d-7e5e-4fa3-b0b1-c131f043953b'::UUID
-- ORDER BY created_at DESC
-- LIMIT 3;