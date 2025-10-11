import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from "recharts";
import { Sparkles, TrendingUp } from "lucide-react";

interface PriceChartProps {
  data: { time: string; btc: number; eth: number }[];
  portfolioData?: { time: string; [key: string]: any }[];
  portfolioCoins?: Array<{ id: string; name: string; symbol: string; color: string }>;
}

const chartConfig = {
  btc: {
    label: "1BTC",
    color: "hsl(var(--primary))",
  },
  eth: {
    label: "1ETH",
    color: "#fbbf24",
  },
};

const COIN_COLORS = [
  "hsl(var(--primary))",
  "#fbbf24",
  "#8b5cf6", 
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#06b6d4",
  "#6366f1",
];

export const PriceChart = ({ data, portfolioData, portfolioCoins }: PriceChartProps) => {
  const hasPortfolioData = portfolioData && portfolioData.length > 0 && portfolioCoins && portfolioCoins.length > 0;

  return (
    <Card className="glass border-border p-6 relative overflow-hidden">
      {/* Decorative background gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            {hasPortfolioData ? (
              <Sparkles className="w-5 h-5 text-primary" />
            ) : (
              <TrendingUp className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {hasPortfolioData ? 'Portfolio Performance' : 'Market Overview'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {hasPortfolioData 
                ? `Tracking ${portfolioCoins.length} coin${portfolioCoins.length !== 1 ? 's' : ''}`
                : 'Top cryptocurrencies'
              }
            </p>
          </div>
        </div>
        {hasPortfolioData && (
          <div className="flex flex-wrap gap-2">
            {portfolioCoins.slice(0, 4).map((coin, index) => (
              <div key={coin.id} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50 border border-border">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: COIN_COLORS[index % COIN_COLORS.length] }}
                />
                <span className="text-xs font-medium">{coin.symbol.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        {hasPortfolioData ? (
          <LineChart data={portfolioData}>
            <defs>
              {portfolioCoins.map((coin, index) => (
                <linearGradient key={coin.id} id={`gradient-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COIN_COLORS[index % COIN_COLORS.length]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COIN_COLORS[index % COIN_COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {portfolioCoins.map((coin, index) => (
              <Line
                key={coin.id}
                type="monotone"
                dataKey={coin.symbol}
                stroke={COIN_COLORS[index % COIN_COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        ) : (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="btcGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ethGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="btc"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#btcGradient)"
            />
            <Area
              type="monotone"
              dataKey="eth"
              stroke="#fbbf24"
              strokeWidth={2}
              fill="url(#ethGradient)"
            />
          </AreaChart>
        )}
      </ChartContainer>
    </Card>
  );
};
