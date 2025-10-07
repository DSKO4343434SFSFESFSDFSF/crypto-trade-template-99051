import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CoinCardProps {
  name: string;
  symbol: string;
  icon: string;
  price: string;
  change: string;
  isPositive: boolean;
  rewardRate?: string;
}

export const CoinCard = ({ name, symbol, icon, price, change, isPositive, rewardRate }: CoinCardProps) => {
  return (
    <Card className="glass border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <img src={icon} alt={name} className="w-8 h-8" />
          </div>
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{symbol}</p>
          </div>
        </div>
        {rewardRate && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Reward Rate</p>
            <p className="text-sm font-medium text-muted-foreground">{rewardRate}</p>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold">{price}</p>
        <p className={cn(
          "text-sm font-medium flex items-center gap-1",
          isPositive ? "text-primary" : "text-destructive"
        )}>
          {isPositive ? "+" : ""}{change}
          <span className="text-xs">{isPositive ? "↗" : "↘"}</span>
        </p>
      </div>
    </Card>
  );
};
