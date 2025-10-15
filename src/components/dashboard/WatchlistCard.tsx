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
    <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-all cursor-pointer group">
      {/* Top section - Icon and Name */}
      <div className="flex items-center gap-3 mb-3">
        <img src={icon} alt={name} className="w-10 h-10 rounded-full" />
        <div className="flex flex-col min-w-0 flex-1">
          <h4 className="text-sm font-medium text-white truncate">{name}</h4>
          <p className="text-xs text-gray-400 uppercase">{symbol}</p>
        </div>
      </div>
      
      {/* Chart section */}
      <div className="mb-3">
        <div className="h-12 w-full">
          <Sparklines data={chartData} width={200} height={48} margin={0}>
            <SparklinesLine color={isPositive ? "#22c55e" : "#ef4444"} style={{ strokeWidth: 2, fill: "none" }} />
          </Sparklines>
        </div>
      </div>
      
      {/* Bottom section - Price and Change */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-white">{price}</div>
        <div className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <span>{isPositive ? '↗' : '↘'}</span>
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
};
