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
    <div className="flex items-center justify-between py-3 px-4 hover:bg-white/5 transition-all cursor-pointer group">
      {/* Left side - Icon and Name */}
      <div className="flex items-center gap-3 flex-1">
        <img src={icon} alt={name} className="w-8 h-8 rounded-full" />
        <div className="flex flex-col">
          <h4 className="text-sm font-medium text-white">{name}</h4>
          <p className="text-xs text-gray-400 uppercase">{symbol}</p>
        </div>
      </div>
      
      {/* Center - Mini Chart */}
      <div className="flex-1 flex justify-center">
        <div className="h-6 w-20">
          <Sparklines data={chartData} width={80} height={24} margin={0}>
            <SparklinesLine color={isPositive ? "#22c55e" : "#ef4444"} style={{ strokeWidth: 1.5, fill: "none" }} />
          </Sparklines>
        </div>
      </div>
      
      {/* Right side - Price and Change */}
      <div className="flex flex-col items-end flex-1">
        <div className="text-sm font-semibold text-white">{price}</div>
        <div className={`text-xs font-medium flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <span>{isPositive ? '↗' : '↘'}</span>
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
};
