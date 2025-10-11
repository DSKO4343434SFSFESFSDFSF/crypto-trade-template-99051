# 🚀 Quick Start Guide

## Setup Instructions (5 minutes)

### Step 1: Database Setup
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Copy the entire contents of `00_COMPLETE_SETUP.sql`
5. Paste into SQL Editor
6. Click **RUN** ▶️
7. Wait for "Success" message

✅ Your database is now ready!

---

## Testing the App

### Buy Your First Coin
1. Start the app: `npm run dev`
2. Login to your account
3. Navigate to **Cryptocurrencies** page
4. Click on any coin (e.g., Bitcoin)
5. Click the **"Buy"** button
6. Enter amount (e.g., `0.5`)
7. Click **"Buy Now"**
8. See success message! 🎉

---

## Verify Your Purchase

### Option 1: In Supabase Dashboard
1. Go to **Table Editor** in Supabase
2. Select `user_purchases` table
3. See your purchase record

### Option 2: Using SQL
1. Go to **SQL Editor**
2. Use queries from `05_useful_queries.sql`
3. Run: `SELECT auth.uid()` to get your user ID
4. Replace `YOUR_USER_ID` in queries with your actual ID
5. Run the portfolio summary query

---

## Adding More Coins

### Quick Add
```sql
-- Copy this to SQL Editor and modify values
INSERT INTO public.cryptocurrencies (id, name, symbol, image_url, current_price, market_cap_rank, is_active)
VALUES ('sui', 'Sui', 'SUI', 'https://www.coinlore.com/img/sui.png', 1.80, 21, true);
```

See `04_add_more_coins_template.sql` for more examples.

---

## Folder Structure

```
paste me in SQL editor/
├── 00_COMPLETE_SETUP.sql          ⭐ START HERE - Run this first!
├── 01_cryptocurrencies_table.sql  📊 Cryptocurrencies schema
├── 02_user_purchases.sql          💰 Purchases & portfolio schema
├── 03_sample_data.sql             🪙 15 sample coins
├── 04_add_more_coins_template.sql ➕ How to add coins
├── 05_useful_queries.sql          🔍 Portfolio analytics queries
├── 06_add_tether_usdt.sql         💵 Add Tether (USDT) coin
└── README.md                      📖 This file
```

---

## What Was Fixed/Added

### ✅ Fixed Issues
- **Top Performing Coins icons** now display correctly
- **Cryptocurrencies page** now has buy functionality
- Fixed `portfolioVersion` state error

### ✅ New Features
- **Buy Coin Modal** with real-time cost calculation
- **Database integration** for purchases
- **Portfolio tracking** with profit/loss
- **Complete SQL schema** with RLS security
- **Sample data** for 15 popular coins

---

## Database Schema

```
auth.users (Supabase built-in)
     │
     ├─► profiles (existing)
     │
     └─► user_purchases (NEW!)
              │
              ├─► cryptocurrencies (NEW!)
              │
              └─► user_portfolio_summary (VIEW)
```

---

## Key Features

### Security
- ✅ Row Level Security (RLS)
- ✅ Users see only their data
- ✅ Automatic user authentication
- ✅ Foreign key constraints

### Functionality  
- ✅ Buy coins with any amount
- ✅ Track purchase history
- ✅ Calculate profit/loss
- ✅ Portfolio analytics
- ✅ Real-time totals

### User Experience
- ✅ Beautiful modern UI
- ✅ Real-time calculations
- ✅ Loading states
- ✅ Success/error toasts
- ✅ Mobile responsive

---

## Common Questions

### Q: Where do I get my user ID?
**A:** Run this in SQL Editor:
```sql
SELECT auth.uid();
```

### Q: How do I update coin prices?
**A:** 
```sql
UPDATE public.cryptocurrencies 
SET current_price = 45000.00 
WHERE id = 'bitcoin';
```

### Q: Can I add unlimited coins?
**A:** Yes! Use the template in `04_add_more_coins_template.sql`

### Q: How do I view my purchases?
**A:** Use queries from `05_useful_queries.sql`

### Q: What if I make a test purchase?
**A:** Delete it:
```sql
DELETE FROM public.user_purchases 
WHERE id = 'purchase-id-here';
```

---

## Next Steps (Optional)

Want to extend the platform? Consider:
- 🔹 Add a Portfolio page showing all holdings
- 🔹 Create a Sell functionality
- 🔹 Add transaction history page
- 🔹 Implement price alerts
- 🔹 Add charts for portfolio performance
- 🔹 Create a favorites/watchlist
- 🔹 Add export to CSV
- 🔹 Implement recurring buys

---

## Support Files

All files in this folder are ready to use:

| File | Purpose | Run Order |
|------|---------|-----------|
| `00_COMPLETE_SETUP.sql` | Complete database setup | **1st** |
| `01_cryptocurrencies_table.sql` | Individual table (optional) | - |
| `02_user_purchases.sql` | Individual table (optional) | - |
| `03_sample_data.sql` | Sample coins (already in #00) | - |
| `04_add_more_coins_template.sql` | Templates for adding coins | As needed |
| `05_useful_queries.sql` | Portfolio analytics | As needed |
| `06_add_tether_usdt.sql` | Add Tether/USDT coin | As needed |

---

## Troubleshooting

### Build fails?
```bash
npm install
npm run build
```

### Can't see purchases?
- Check you're logged in
- Verify purchase in `user_purchases` table
- Check RLS policies are enabled

### Coin not showing?
- Verify `is_active = true` in database
- Check `cryptocurrencies` table for the coin

### Buy button not working?
- Check browser console for errors
- Verify database connection
- Check Supabase policies

---

## 🎉 You're All Set!

The platform is now fully functional with:
- ✅ Coin browsing
- ✅ Coin purchasing  
- ✅ Portfolio tracking
- ✅ Database management
- ✅ Secure authentication

**Happy Trading!** 🚀
