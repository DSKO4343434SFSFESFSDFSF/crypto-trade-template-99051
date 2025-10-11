import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Crown, Medal, Award } from "lucide-react";

interface CoinPerformance {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  market_cap_rank: number;
}

interface TopCoinsProps {
  coins: CoinPerformance[];
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-slate-400" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
  }
};

export const TopCoins = ({ coins }: TopCoinsProps) => {
  // Sort by 24h change percentage to show top performers
  const topPerformers = [...coins]
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5);

  return (
    <Card className="glass border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Top Performing Coins</h3>
            <p className="text-xs text-muted-foreground">Best performers in the last 24 hours</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {topPerformers.map((coin, index) => {
          const isPositive = coin.price_change_percentage_24h > 0;
          const changeAbs = Math.abs(coin.price_change_percentage_24h);
          
          return (
            <div
              key={coin.id}
              className="group relative p-4 rounded-xl border border-border bg-background/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className="w-8 flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Coin info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <img 
                        src={coin.image} 
                        alt={coin.name} 
                        className="w-10 h-10 rounded-full ring-2 ring-border group-hover:ring-primary/50 transition-all" 
                      />
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-[8px]">🔥</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">{coin.name}</span>
                        <span className="text-xs text-muted-foreground font-medium uppercase">{coin.symbol}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Vol: ${(coin.total_volume / 1000000000).toFixed(2)}B
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price and change */}
                <div className="text-right">
                  <div className="font-semibold text-foreground text-lg">
                    ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 justify-end text-sm font-medium",
                    isPositive ? "text-green-500" : "text-red-500"
                  )}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {isPositive ? '+' : '-'}{changeAbs.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Progress bar showing performance */}
              <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isPositive 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                      : "bg-gradient-to-r from-red-500 to-rose-500"
                  )}
                  style={{ 
                    width: `${Math.min(100, (changeAbs / Math.max(...topPerformers.map(c => Math.abs(c.price_change_percentage_24h)))) * 100)}%` 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary card */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Market Cap</span>
          <span className="font-semibold">
            ${(coins.reduce((sum, coin) => sum + coin.market_cap, 0) / 1000000000000).toFixed(2)}T
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-muted-foreground">24h Volume</span>
          <span className="font-semibold">
            ${(coins.reduce((sum, coin) => sum + coin.total_volume, 0) / 1000000000).toFixed(2)}B
          </span>
        </div>
      </div>
    </Card>
  );
};
