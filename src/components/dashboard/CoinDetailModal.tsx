import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { fetchCoinChart, CoinData } from "@/services/coingecko";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface CoinDetailModalProps {
  coin: CoinData;
  isOpen: boolean;
  onClose: () => void;
}

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
};

export const CoinDetailModal = ({ coin, isOpen, onClose }: CoinDetailModalProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) return;

    const loadChartData = async () => {
      setLoading(true);
      try {
        const data = await fetchCoinChart(coin.id, timeRange);
        
        if (data.candlesticks && data.candlesticks.length > 0) {
          // Use candlestick data with OHLC values
          const formatted = data.candlesticks.map((candle) => ({
            time: new Date(candle.time).toLocaleString('en-US', { 
              month: 'short',
              day: 'numeric',
              ...(timeRange === 1 && { hour: 'numeric' })
            }),
            price: candle.close,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            // Color for candlestick body
            fill: candle.close >= candle.open ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
          }));
          setChartData(formatted);
        } else {
          // Fallback to line chart if no candlestick data
          const formatted = data.prices.map((price) => ({
            time: new Date(price[0]).toLocaleString('en-US', { 
              month: 'short',
              day: 'numeric',
              ...(timeRange === 1 && { hour: 'numeric' })
            }),
            price: price[1],
          }));
          setChartData(formatted);
        }
      } catch (error: any) {
        console.error('Error loading chart:', error);
        if (error.message?.includes('Rate limit')) {
          toast.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [coin.id, isOpen, timeRange]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img src={coin.image} alt={coin.name} className="w-10 h-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{coin.name}</span>
                <span className="text-lg text-muted-foreground">{coin.symbol.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-bold">${coin.current_price.toLocaleString()}</span>
                <span className={cn(
                  "text-sm font-medium flex items-center gap-1",
                  coin.price_change_percentage_24h > 0 ? "text-primary" : "text-destructive"
                )}>
                  {coin.price_change_percentage_24h > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="1" onValueChange={(value) => setTimeRange(Number(value))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="1">24H</TabsTrigger>
            <TabsTrigger value="7">7D</TabsTrigger>
            <TabsTrigger value="30">30D</TabsTrigger>
            <TabsTrigger value="365">ALL</TabsTrigger>
          </TabsList>

          <TabsContent value="1" className="mt-6">
            <ChartSection loading={loading} chartData={chartData} />
          </TabsContent>
          <TabsContent value="7" className="mt-6">
            <ChartSection loading={loading} chartData={chartData} />
          </TabsContent>
          <TabsContent value="30" className="mt-6">
            <ChartSection loading={loading} chartData={chartData} />
          </TabsContent>
          <TabsContent value="365" className="mt-6">
            <ChartSection loading={loading} chartData={chartData} />
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard label="Market Cap" value={`$${(coin.market_cap / 1000000000).toFixed(2)}B`} />
          <StatCard label="24h Volume" value={`$${(coin.total_volume / 1000000000).toFixed(2)}B`} />
          <StatCard 
            label="24h High" 
            value={coin.high_24h ? `$${coin.high_24h.toLocaleString()}` : 'N/A'} 
          />
          <StatCard 
            label="24h Low" 
            value={coin.low_24h ? `$${coin.low_24h.toLocaleString()}` : 'N/A'} 
          />
        </div>

        <Card className="glass border-border p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">About {coin.name}</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Symbol:</span> {coin.symbol.toUpperCase()}
            </p>
            <p>
              <span className="font-medium text-foreground">Market Cap Rank:</span> #{coin.market_cap_rank}
            </p>
            <p className="mt-4">
              {coin.name} is a leading cryptocurrency with a current market cap of ${(coin.market_cap / 1000000000).toFixed(2)}B 
              and 24-hour trading volume of ${(coin.total_volume / 1000000000).toFixed(2)}B.
            </p>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

const ChartSection = ({ loading, chartData }: { loading: boolean; chartData: any[] }) => {
  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading chart...</p>
      </div>
    );
  }

  const hasCandlestickData = chartData.length > 0 && chartData[0].open !== undefined;

  return (
    <Card className="glass border-border p-6">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          {hasCandlestickData ? (
            <>
              <Area
                type="monotone"
                dataKey="high"
                stroke="hsl(var(--primary))"
                strokeWidth={1}
                fill="transparent"
                strokeDasharray="3 3"
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
              <Area
                type="monotone"
                dataKey="low"
                stroke="hsl(var(--destructive))"
                strokeWidth={1}
                fill="transparent"
                strokeDasharray="3 3"
              />
            </>
          ) : (
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          )}
        </AreaChart>
      </ChartContainer>
    </Card>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <Card className="glass border-border p-4">
    <p className="text-xs text-muted-foreground uppercase mb-1">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </Card>
);
