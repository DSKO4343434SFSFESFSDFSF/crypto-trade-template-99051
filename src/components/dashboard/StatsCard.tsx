import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  className?: string;
}

export const StatsCard = ({ label, value, change, isPositive, className }: StatsCardProps) => {
  return (
    <Card className={cn("glass border-border p-4", className)}>
      <p className="text-xs text-muted-foreground uppercase mb-1">{label}</p>
      <p className="text-2xl font-semibold mb-1">{value}</p>
      {change && (
        <p className={cn(
          "text-sm font-medium",
          isPositive ? "text-primary" : "text-destructive"
        )}>
          {isPositive ? "+" : ""}{change}
        </p>
      )}
    </Card>
  );
};
