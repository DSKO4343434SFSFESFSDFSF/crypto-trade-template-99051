-- ============================================
-- ADMIN SCRIPT: Add Balances to Users
-- Use this to add cryptocurrency balances directly to users
-- ============================================

-- First, let's create a notifications table for user notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'coin_added')),
  is_read BOOLEAN DEFAULT FALSE,
  related_coin_id TEXT,
  related_amount DECIMAL(20, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read);

-- Enable RLS for notifications
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.user_notifications;
CREATE POLICY "Users can read their own notifications" 
ON public.user_notifications 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.user_notifications;
CREATE POLICY "Users can update their own notifications" 
ON public.user_notifications 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Add balance to user
-- This function adds a cryptocurrency balance to a user and creates a notification
-- ============================================

CREATE OR REPLACE FUNCTION add_balance_to_user(
  p_user_id UUID,
  p_cryptocurrency_id TEXT,
  p_amount DECIMAL(20, 8),
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_current_price DECIMAL(20, 8);
  v_total_cost DECIMAL(20, 8);
  v_coin_name TEXT;
  v_coin_symbol TEXT;
  v_purchase_id UUID;
BEGIN
  -- Get the current price of the cryptocurrency
  SELECT current_price, name, symbol 
  INTO v_current_price, v_coin_name, v_coin_symbol
  FROM public.cryptocurrencies
  WHERE id = p_cryptocurrency_id;
  
  IF v_current_price IS NULL THEN
    RAISE EXCEPTION 'Cryptocurrency % not found', p_cryptocurrency_id;
  END IF;
  
  -- Calculate total cost
  v_total_cost := p_amount * v_current_price;
  
  -- Insert the purchase record
  INSERT INTO public.user_purchases (
    user_id,
    cryptocurrency_id,
    amount,
    purchase_price,
    total_cost,
    status,
    notes
  ) VALUES (
    p_user_id,
    p_cryptocurrency_id,
    p_amount,
    v_current_price,
    v_total_cost,
    'completed',
    COALESCE(p_notes, 'Admin added balance')
  )
  RETURNING id INTO v_purchase_id;
  
  -- Create a notification for the user
  INSERT INTO public.user_notifications (
    user_id,
    title,
    message,
    type,
    related_coin_id,
    related_amount
  ) VALUES (
    p_user_id,
    'New Cryptocurrency Added! 🎉',
    format('%s %s has been added to your wallet!', p_amount, v_coin_symbol),
    'coin_added',
    p_cryptocurrency_id,
    p_amount
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', v_purchase_id,
    'amount', p_amount,
    'coin', v_coin_name,
    'symbol', v_coin_symbol,
    'price', v_current_price,
    'total_cost', v_total_cost
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- Example 1: Add 0.5 Bitcoin to a user
-- Replace 'USER_ID_HERE' with actual user UUID from auth.users table
/*
SELECT add_balance_to_user(
  'USER_ID_HERE'::UUID,
  'bitcoin',
  0.5,
  'Welcome bonus'
);
*/

-- Example 2: Add 10 Ethereum to a user
/*
SELECT add_balance_to_user(
  'USER_ID_HERE'::UUID,
  'ethereum',
  10.0,
  'Promotional credit'
);
*/

-- Example 3: Add multiple coins to a user
/*
DO $$
DECLARE
  v_user_id UUID := 'USER_ID_HERE'::UUID;
BEGIN
  PERFORM add_balance_to_user(v_user_id, 'bitcoin', 0.1, 'Welcome bonus');
  PERFORM add_balance_to_user(v_user_id, 'ethereum', 5.0, 'Welcome bonus');
  PERFORM add_balance_to_user(v_user_id, 'solana', 50.0, 'Welcome bonus');
END $$;
*/

-- ============================================
-- HELPER QUERIES
-- ============================================

-- Get all users (to find user IDs)
-- SELECT id, email FROM auth.users ORDER BY created_at DESC;

-- Get all available cryptocurrencies
-- SELECT id, name, symbol, current_price FROM public.cryptocurrencies WHERE is_active = true ORDER BY market_cap_rank;

-- View user's current holdings
-- SELECT * FROM public.user_portfolio_summary WHERE user_id = 'USER_ID_HERE'::UUID;

-- View user's notifications
-- SELECT * FROM public.user_notifications WHERE user_id = 'USER_ID_HERE'::UUID ORDER BY created_at DESC;

-- ============================================
-- QUICK ADD TEMPLATE
-- Copy this and replace USER_ID and values:
-- ============================================
/*
SELECT add_balance_to_user(
  'USER_ID_HERE'::UUID,  -- Get from auth.users table
  'bitcoin',              -- Coin ID (bitcoin, ethereum, solana, etc.)
  1.0,                    -- Amount
  'Admin bonus'           -- Optional note
);
*/
