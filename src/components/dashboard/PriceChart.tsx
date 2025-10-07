import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface PriceChartProps {
  data: { time: string; btc: number; eth: number }[];
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

export const PriceChart = ({ data }: PriceChartProps) => {
  return (
    <Card className="glass border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Active credit</h3>
      </div>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
      </ChartContainer>
    </Card>
  );
};
