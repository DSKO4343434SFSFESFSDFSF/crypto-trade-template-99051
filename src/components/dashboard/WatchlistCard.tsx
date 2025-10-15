import { useEffect, useRef, useState } from 'react';
import { Sparklines, SparklinesLine, SparklinesReferenceLine } from 'react-sparklines';

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
  const [displayPrice, setDisplayPrice] = useState(price);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPriceRef = useRef(price);

  // Animate price changes
  useEffect(() => {
    if (prevPriceRef.current !== price) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayPrice(price);
        setIsAnimating(false);
      }, 300);
      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    }
  }, [price]);

  return (
    <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-2 hover:bg-white/5 transition-all duration-300 cursor-pointer group">
      {/* Top section - Icon and Name (20% bigger) */}
      <div className="flex items-center gap-2 mb-2">
        <img src={icon} alt={name} className="w-[17.3px] h-[17.3px] rounded-full flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <h4 className="text-[13px] font-medium text-white truncate leading-tight">{name}</h4>
          <p className="text-[11px] text-gray-400 uppercase leading-tight">{symbol}</p>
        </div>
      </div>
      
      {/* Chart section - minimal axis lines (1/4 length) */}
      <div className="mb-2 relative">
        <div className="h-12 w-full">
          <Sparklines 
            data={chartData} 
            width={120} 
            height={48} 
            margin={4}
          >
            <SparklinesLine 
              color={isPositive ? "#22c55e" : "#ef4444"} 
              style={{ 
                strokeWidth: 1.5, 
                fill: "none",
                filter: "drop-shadow(0 0 2px rgba(34, 197, 94, 0.3))"
              }} 
            />
            {/* Minimal reference line - subtle and non-intrusive */}
            <SparklinesReferenceLine 
              type="mean" 
              style={{ 
                stroke: 'rgba(255, 255, 255, 0.1)', 
                strokeWidth: 0.5,
                strokeDasharray: '2, 2'
              }} 
            />
          </Sparklines>
        </div>
      </div>
      
      {/* Bottom section - Price and Change with animations */}
      <div className="flex items-center justify-between">
        <div className={
          `text-[17px] font-semibold transition-all duration-500 ease-out ${
            isPositive ? 'text-green-500' : 'text-red-500'
          } ${
            isAnimating ? 'scale-110 opacity-70' : 'scale-100 opacity-100'
          }`
        }>
          {displayPrice}
        </div>
        <div className={
          `text-sm font-medium flex items-center gap-1 transition-all duration-300 ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`
        }>
          <span className="transition-transform duration-300 group-hover:scale-125">
            {isPositive ? '↗' : '↘'}
          </span>
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
};
