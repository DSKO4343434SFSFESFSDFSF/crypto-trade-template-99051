import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchTopCoins, CoinData } from "@/services/coingecko";

interface Holding {
  cryptocurrency_id: string;
  name: string;
  symbol: string;
  image_url: string;
  total_amount: number;
  current_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
  total_invested: number;
}

interface YourHoldingsProps {
  userId: string;
}

export const YourHoldings = ({ userId }: YourHoldingsProps) => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const loadHoldings = async () => {
      setLoading(true);
      try {
        // Fetch user holdings from database
        const { data: portfolioData, error } = await supabase
          .from("user_portfolio_summary")
          .select("*")
          .eq("user_id", userId);

        if (error) throw error;

        // Fetch real-time prices from CoinLore API
        const coins = await fetchTopCoins(100);
        const coinPriceMap = new Map<string, CoinData>();
        
        // Map coins by SYMBOL (not ID) for quick lookup - this matches database symbols with API data
        coins.forEach(coin => {
          coinPriceMap.set(coin.symbol.toUpperCase(), coin);
        });

        // Calculate current values with real-time prices
        const updatedHoldings = (portfolioData || []).map(holding => {
          // Match by symbol instead of ID (database uses text IDs, CoinLore uses numeric IDs)
          const coin = coinPriceMap.get(holding.symbol.toUpperCase());
          const realTimePrice = coin?.current_price || holding.current_price;
          const currentValue = holding.total_amount * realTimePrice;
          const profitLoss = currentValue - holding.total_invested;
          const profitLossPercentage = holding.total_invested > 0 
            ? (profitLoss / holding.total_invested) * 100 
            : 0;

          return {
            ...holding,
            current_value: currentValue,
            profit_loss: profitLoss,
            profit_loss_percentage: profitLossPercentage
          };
        });

        // Sort by current value and take top 5
        const sortedHoldings = updatedHoldings
          .sort((a, b) => b.current_value - a.current_value)
          .slice(0, 5);

        setHoldings(sortedHoldings);
        const total = sortedHoldings.reduce((sum, h) => sum + h.current_value, 0);
        setTotalValue(total);
      } catch (error) {
        console.error("Error loading holdings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHoldings();

    // Refresh holdings every minute to keep prices up-to-date
    const interval = setInterval(loadHoldings, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <Card className="glass border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Your Holdings</h3>
            <p className="text-xs text-muted-foreground">Top cryptocurrencies you own</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total Value</p>
          <p className="text-lg font-bold">${totalValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</p>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading holdings...
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No holdings yet</p>
            <p className="text-xs mt-1">Start buying cryptocurrencies to build your portfolio</p>
          </div>
        ) : (
          holdings.map((holding) => {
            const isPositive = holding.profit_loss >= 0;
            
            return (
              <div
                key={holding.cryptocurrency_id}
                className="group relative p-4 rounded-xl border border-border bg-background/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Coin image */}
                    <img 
                      src={holding.image_url} 
                      alt={holding.name} 
                      className="w-10 h-10 rounded-full ring-2 ring-border group-hover:ring-primary/50 transition-all" 
                    />
                    
                    {/* Coin info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">{holding.name}</span>
                        <span className="text-xs text-muted-foreground font-medium uppercase">
                          {holding.symbol}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {holding.total_amount.toFixed(6)} {holding.symbol.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Value and P/L */}
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      ${holding.current_value.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 justify-end text-xs font-medium",
                      isPositive ? "text-green-500" : "text-red-500"
                    )}>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isPositive ? '+' : ''}{holding.profit_loss_percentage.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
