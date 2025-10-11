import { Sparklines, SparklinesLine } from 'react-sparklines';

interface WatchlistCardProps {
  name: string;
  symbol: string;
  icon: string;
  price: string;
  change: string;
  isPositive: boolean;
  chartData: number[];
}

export const WatchlistCard = ({ name, symbol, icon, price, change, isPositive, chartData }: WatchlistCardProps) => {
  return (
    <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-3 hover:border-green-500/50 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <img src={icon} alt={name} className="w-6 h-6 rounded-full" />
          <div>
            <h4 className="text-sm font-medium text-white">{name}</h4>
            <p className="text-xs text-gray-500 uppercase">{symbol}</p>
          </div>
        </div>
        <div className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '↗' : '↘'} {change}
        </div>
      </div>
      
      <div className="h-8 mb-2 -mx-1">
        <Sparklines data={chartData} width={180} height={32} margin={0}>
          <SparklinesLine color={isPositive ? "#22c55e" : "#ef4444"} style={{ strokeWidth: 1.5, fill: "none" }} />
        </Sparklines>
      </div>
      
      <div className="text-sm font-semibold text-white">{price}</div>
    </div>
  );
};
