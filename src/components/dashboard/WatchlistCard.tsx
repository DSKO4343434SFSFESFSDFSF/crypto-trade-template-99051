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
    <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4 hover:border-purple-500/50 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img src={icon} alt={name} className="w-8 h-8 rounded-full" />
          <div>
            <h4 className="font-medium text-white">{name}</h4>
            <p className="text-xs text-gray-500 uppercase">{symbol}</p>
          </div>
        </div>
        <div className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '↗' : '↘'} {change}
        </div>
      </div>
      
      <div className="h-10 mb-3 -mx-2">
        <Sparklines data={chartData} width={200} height={40} margin={0}>
          <SparklinesLine color={isPositive ? "#22c55e" : "#ef4444"} style={{ strokeWidth: 1.5, fill: "none" }} />
        </Sparklines>
      </div>
      
      <div className="text-base font-semibold text-white">{price}</div>
    </div>
  );
};
