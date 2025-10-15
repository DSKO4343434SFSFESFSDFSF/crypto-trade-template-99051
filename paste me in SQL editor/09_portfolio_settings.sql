-- ============================================
-- PORTFOLIO SETTINGS TABLE
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create portfolio_settings table
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Trading Preferences
  default_trading_amount DECIMAL(20, 8) DEFAULT 100.00,
  preferred_currency TEXT DEFAULT 'USD' CHECK (preferred_currency IN ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD')),
  risk_tolerance TEXT DEFAULT 'medium' CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  
  -- Portfolio Management
  auto_rebalancing BOOLEAN DEFAULT false,
  rebalancing_frequency TEXT DEFAULT 'monthly' CHECK (rebalancing_frequency IN ('weekly', 'monthly', 'quarterly')),
  target_allocation JSONB DEFAULT '{}', -- Store target allocation percentages for different coins
  
  -- Trading Limits & Risk Management
  daily_trading_limit DECIMAL(20, 8) DEFAULT 1000.00,
  stop_loss_percentage DECIMAL(5, 2) DEFAULT 10.00 CHECK (stop_loss_percentage >= 0 AND stop_loss_percentage <= 100),
  take_profit_percentage DECIMAL(5, 2) DEFAULT 25.00 CHECK (take_profit_percentage >= 0),
  max_portfolio_exposure DECIMAL(5, 2) DEFAULT 80.00 CHECK (max_portfolio_exposure >= 0 AND max_portfolio_exposure <= 100),
  
  -- Notifications & Alerts
  price_alerts_enabled BOOLEAN DEFAULT true,
  portfolio_alerts_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  alert_thresholds JSONB DEFAULT '{"price_change": 5, "portfolio_change": 10}',
  
  -- Display Preferences
  theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark', 'auto')),
  chart_type TEXT DEFAULT 'candlestick' CHECK (chart_type IN ('line', 'candlestick', 'area')),
  default_time_range TEXT DEFAULT '24h' CHECK (default_time_range IN ('1h', '24h', '7d', '30d', '1y')),
  show_portfolio_value BOOLEAN DEFAULT true,
  show_profit_loss BOOLEAN DEFAULT true,
  
  -- Advanced Features
  paper_trading_mode BOOLEAN DEFAULT false,
  api_trading_enabled BOOLEAN DEFAULT false,
  two_factor_required BOOLEAN DEFAULT false,
  session_timeout_minutes INTEGER DEFAULT 60 CHECK (session_timeout_minutes >= 15 AND session_timeout_minutes <= 1440),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one settings record per user
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_settings_user_id ON public.portfolio_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_settings_updated_at ON public.portfolio_settings(updated_at DESC);

-- Enable RLS
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read their own settings" ON public.portfolio_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.portfolio_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.portfolio_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.portfolio_settings;

-- Create policies
CREATE POLICY "Users can read their own settings" 
ON public.portfolio_settings 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.portfolio_settings 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.portfolio_settings 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
ON public.portfolio_settings 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create update trigger
DROP TRIGGER IF EXISTS update_portfolio_settings_updated_at ON public.portfolio_settings;
CREATE TRIGGER update_portfolio_settings_updated_at
  BEFORE UPDATE ON public.portfolio_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get or create user settings
CREATE OR REPLACE FUNCTION public.get_or_create_user_settings(user_uuid UUID)
RETURNS public.portfolio_settings AS $$
DECLARE
  settings_record public.portfolio_settings;
BEGIN
  -- Try to get existing settings
  SELECT * INTO settings_record 
  FROM public.portfolio_settings 
  WHERE user_id = user_uuid;
  
  -- If no settings exist, create default ones
  IF NOT FOUND THEN
    INSERT INTO public.portfolio_settings (user_id)
    VALUES (user_uuid)
    RETURNING * INTO settings_record;
  END IF;
  
  RETURN settings_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update target allocation
CREATE OR REPLACE FUNCTION public.update_target_allocation(
  user_uuid UUID,
  allocation_data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate that allocations sum to 100 or less
  IF (
    SELECT SUM((value->>'percentage')::DECIMAL) 
    FROM jsonb_each(allocation_data)
  ) > 100 THEN
    RAISE EXCEPTION 'Total allocation cannot exceed 100%%';
  END IF;
  
  -- Update the target allocation
  UPDATE public.portfolio_settings
  SET 
    target_allocation = allocation_data,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PORTFOLIO SETTINGS SETUP COMPLETE!
-- ============================================
-- Features included:
-- 1. Trading preferences (amount, currency, risk tolerance)
-- 2. Portfolio management (auto-rebalancing, target allocation)
-- 3. Risk management (limits, stop-loss, take-profit)
-- 4. Notifications and alerts
-- 5. Display preferences
-- 6. Advanced features (paper trading, API trading, 2FA)
-- 7. Helper functions for settings management
-- ============================================