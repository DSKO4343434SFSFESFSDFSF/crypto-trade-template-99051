-- ============================================
-- TEST NOTE FUNCTIONALITY IN TRANSACTIONS
-- Run this in your SQL editor to test the note feature
-- ============================================

-- First, let's check your current transactions to see if notes are there
SELECT 
  id,
  amount,
  total_cost,
  notes,
  created_at,
  status
FROM public.user_purchases 
WHERE user_id = 'cea3d84d-7e5e-4fa3-b0b1-c131f043953b'::UUID
ORDER BY created_at DESC
LIMIT 5;

-- If you want to add a note to an existing transaction, you can update it:
-- (Uncomment and replace TRANSACTION_ID_HERE with an actual transaction ID from above)
/*
UPDATE public.user_purchases 
SET notes = 'Updated note - test hover functionality'
WHERE id = 'TRANSACTION_ID_HERE'::UUID 
AND user_id = 'cea3d84d-7e5e-4fa3-b0b1-c131f043953b'::UUID;
*/

-- Add a new test transaction with a note to see the icon:
SELECT add_balance_to_user(
  'cea3d84d-7e5e-4fa3-b0b1-c131f043953b'::UUID,
  'bitcoin',
  0.001,
  'Test note - hover over the note icon to see this message!'
);

-- Add another test transaction with a longer note:
SELECT add_balance_to_user(
  'cea3d84d-7e5e-4fa3-b0b1-c131f043953b'::UUID,
  'ethereum',
  0.01,
  'This is a longer note to test how the tooltip displays with more text. It should wrap nicely and be readable on hover.'
);

-- Add a transaction without a note (should not show the icon):
SELECT add_balance_to_user(
  'cea3d84d-7e5e-4fa3-b0b1-c131f043953b'::UUID,
  'solana',
  1.0
);

-- Verify all transactions now have the correct data:
SELECT 
  up.id,
  up.amount,
  up.total_cost,
  up.notes,
  up.created_at,
  up.status,
  c.name as cryptocurrency_name,
  c.symbol as cryptocurrency_symbol
FROM public.user_purchases up
JOIN public.cryptocurrencies c ON up.cryptocurrency_id = c.id
WHERE up.user_id = 'cea3d84d-7e5e-4fa3-b0b1-c131f043953b'::UUID
ORDER BY up.created_at DESC
LIMIT 10;