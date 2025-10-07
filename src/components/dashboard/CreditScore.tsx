import { Card } from "@/components/ui/card";

interface CreditScoreProps {
  score: number;
  percentage: number;
  lastCheck: string;
}

export const CreditScore = ({ score, percentage, lastCheck }: CreditScoreProps) => {
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="glass border-border p-6">
      <h3 className="text-lg font-semibold mb-6">Your credit score</h3>
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="hsl(var(--primary))"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground mb-1">{percentage}%</span>
            <span className="text-5xl font-bold">{score}</span>
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Last Check on {lastCheck}</p>
        <p className="text-sm text-muted-foreground mt-1">Your credit score is average</p>
      </div>
    </Card>
  );
};
