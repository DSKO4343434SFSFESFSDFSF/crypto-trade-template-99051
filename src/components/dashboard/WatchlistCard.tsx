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
    <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-2 hover:bg-white/5 transition-all cursor-pointer group">
      {/* Top section - Icon and Name */}
      <div className="flex items-center gap-2 mb-2">
        <img src={icon} alt={name} className="w-4 h-4 rounded-full flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <h4 className="text-xs font-medium text-white truncate leading-tight">{name}</h4>
          <p className="text-[10px] text-gray-400 uppercase leading-tight">{symbol}</p>
        </div>
      </div>
      
      {/* Chart section */}
      <div className="mb-2">
        <div className="h-3 w-full">
          <Sparklines data={chartData} width={50} height={12} margin={0}>
            <SparklinesLine color={isPositive ? "#22c55e" : "#ef4444"} style={{ strokeWidth: 1, fill: "none" }} />
          </Sparklines>
        </div>
      </div>
      
      {/* Bottom section - Price and Change */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white">{price}</div>
        <div className={`text-xs font-medium flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <span>{isPositive ? '↗' : '↘'}</span>
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
};
