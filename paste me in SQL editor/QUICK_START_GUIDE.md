# Quick Start Guide - Admin Balance Management

## 🚀 Step-by-Step: Add Balance to a User

### Step 1: Run the Setup Script
In your Supabase SQL Editor, run this file:
```
07_admin_add_balances.sql
```

This will create:
- `user_notifications` table
- `add_balance_to_user()` function
- All necessary policies

### Step 2: Find a User's ID

```sql
-- Get all users with their emails
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

Copy the `id` (UUID) of the user you want to give balance to.

### Step 3: See Available Coins

```sql
-- List all available cryptocurrencies
SELECT id, name, symbol, current_price 
FROM public.cryptocurrencies 
WHERE is_active = true 
ORDER BY market_cap_rank;
```

Common coin IDs:
- `bitcoin` - Bitcoin (BTC)
- `ethereum` - Ethereum (ETH)
- `solana` - Solana (SOL)
- `ripple` - XRP
- `litecoin` - Litecoin (LTC)
- `binancecoin` - Binance Coin (BNB)
- `cardano` - Cardano (ADA)

### Step 4: Add Balance

```sql
-- Replace USER_ID_HERE with the actual UUID from Step 2
SELECT add_balance_to_user(
  'USER_ID_HERE'::UUID,    -- User's UUID
  'bitcoin',                -- Coin ID
  1.0,                      -- Amount
  'Welcome bonus'           -- Optional note
);
```

Example with a real user:
```sql
SELECT add_balance_to_user(
  '123e4567-e89b-12d3-a456-426614174000'::UUID,
  'bitcoin',
  0.5,
  'New user welcome bonus'
);
```

### Step 5: Verify It Worked

```sql
-- Check user's holdings (replace USER_ID)
SELECT * 
FROM public.user_portfolio_summary 
WHERE user_id = 'USER_ID_HERE'::UUID;

-- Check user's notifications (replace USER_ID)
SELECT * 
FROM public.user_notifications 
WHERE user_id = 'USER_ID_HERE'::UUID 
ORDER BY created_at DESC;
```

## 📝 Common Use Cases

### Give Multiple Coins to One User

```sql
DO $$
DECLARE
  v_user_id UUID := 'USER_ID_HERE'::UUID;
BEGIN
  PERFORM add_balance_to_user(v_user_id, 'bitcoin', 0.1, 'Welcome package');
  PERFORM add_balance_to_user(v_user_id, 'ethereum', 5.0, 'Welcome package');
  PERFORM add_balance_to_user(v_user_id, 'solana', 50.0, 'Welcome package');
END $$;
```

### Give Same Coin to Multiple Users

```sql
-- User 1
SELECT add_balance_to_user('USER_ID_1'::UUID, 'bitcoin', 0.01, 'Promotion');

-- User 2
SELECT add_balance_to_user('USER_ID_2'::UUID, 'bitcoin', 0.01, 'Promotion');

-- User 3
SELECT add_balance_to_user('USER_ID_3'::UUID, 'bitcoin', 0.01, 'Promotion');
```

### Give Bonus Based on Current Price

```sql
-- This will automatically use the current market price
-- If Bitcoin is $43,000, giving 0.5 BTC = $21,500 value
SELECT add_balance_to_user(
  'USER_ID_HERE'::UUID,
  'bitcoin',
  0.5,
  'Trading competition winner'
);
```

## 🔍 Useful Queries

### View All User Transactions
```sql
SELECT 
  up.user_id,
  u.email,
  c.name as coin,
  up.amount,
  up.purchase_price,
  up.total_cost,
  up.purchase_date,
  up.notes
FROM user_purchases up
JOIN auth.users u ON u.id = up.user_id
JOIN cryptocurrencies c ON c.id = up.cryptocurrency_id
WHERE up.status = 'completed'
ORDER BY up.purchase_date DESC
LIMIT 50;
```

### View User Portfolio Summary
```sql
SELECT 
  u.email,
  ups.name as coin,
  ups.total_amount,
  ups.current_value,
  ups.profit_loss,
  ups.profit_loss_percentage
FROM user_portfolio_summary ups
JOIN auth.users u ON u.id = ups.user_id
ORDER BY ups.current_value DESC;
```

### View All Unread Notifications
```sql
SELECT 
  u.email,
  n.title,
  n.message,
  n.created_at
FROM user_notifications n
JOIN auth.users u ON u.id = n.user_id
WHERE n.is_read = false
ORDER BY n.created_at DESC;
```

### Find Users with No Holdings
```sql
SELECT id, email 
FROM auth.users 
WHERE id NOT IN (
  SELECT DISTINCT user_id 
  FROM user_purchases 
  WHERE status = 'completed'
);
```

## ⚠️ Important Notes

1. **User IDs are UUIDs** - Always use the format `'uuid-here'::UUID`

2. **Coin IDs are lowercase** - Use `'bitcoin'` not `'Bitcoin'`

3. **Amounts are decimals** - Use `1.0` or `0.5`, not just `1`

4. **Users see notifications immediately** - No need to refresh their page

5. **Prices are automatic** - The function uses current market prices

6. **All transactions are tracked** - Check `user_purchases` table for history

## 🎯 Quick Reference

| Coin Name | Coin ID | Symbol |
|-----------|---------|--------|
| Bitcoin | `bitcoin` | BTC |
| Ethereum | `ethereum` | ETH |
| Solana | `solana` | SOL |
| XRP | `ripple` | XRP |
| Litecoin | `litecoin` | LTC |
| Binance Coin | `binancecoin` | BNB |
| Cardano | `cardano` | ADA |
| Dogecoin | `dogecoin` | DOGE |
| Polkadot | `polkadot` | DOT |
| Avalanche | `avalanche-2` | AVAX |

## 🆘 Troubleshooting

### Error: "Cryptocurrency not found"
- Check the coin ID is correct and lowercase
- Run: `SELECT id FROM cryptocurrencies WHERE is_active = true;`

### Error: "User not found" 
- Verify the UUID is correct
- Run: `SELECT id FROM auth.users WHERE email = 'user@example.com';`

### Balance not showing up
- Check if the transaction was created:
  ```sql
  SELECT * FROM user_purchases 
  WHERE user_id = 'USER_ID_HERE'::UUID 
  ORDER BY created_at DESC;
  ```

### Notification not appearing
- Check notifications table:
  ```sql
  SELECT * FROM user_notifications 
  WHERE user_id = 'USER_ID_HERE'::UUID;
  ```
- User might need to refresh the page once

## 🎉 Success!

When everything works, the user will:
1. See a notification bell badge (🔔 with number)
2. Get a toast popup saying "New Cryptocurrency Added! 🎉"
3. See the coin in their "Your Holdings" widget
4. See the transaction in "Recent Activity"
5. Be able to sell or swap the coin immediately

That's it! You're now ready to manage user balances. 🚀
