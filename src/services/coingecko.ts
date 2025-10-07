import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h?: number;
  price_change_percentage_7d?: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  image: string;
  high_24h: number;
  low_24h: number;
}

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ChartData {
  prices: [number, number][];
  candlesticks?: CandlestickData[];
}

export const fetchTopCoins = async (limit: number = 100): Promise<CoinData[]> => {
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false,
        price_change_percentage: '1h,24h,7d'
      }
    });
    
    return response.data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      total_volume: coin.total_volume,
      price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      price_change_percentage_1h: coin.price_change_percentage_1h_in_currency || 0,
      price_change_percentage_7d: coin.price_change_percentage_7d_in_currency || 0,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
    }));
  } catch (error) {
    console.error('Error fetching coins:', error);
    return [];
  }
};

// Fetch real historical price data from CoinGecko
export const fetchCoinChart = async (coinId: string, days: number = 1): Promise<ChartData> => {
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: days === 1 ? 'hourly' : 'daily'
      }
    });
    
    const prices = response.data.prices;
    
    // Convert to candlestick data for better visualization
    const candlesticks: CandlestickData[] = [];
    const interval = days === 1 ? 4 : days === 7 ? 24 : days === 30 ? 96 : 288; // Group prices into candles
    
    for (let i = 0; i < prices.length; i += interval) {
      const candle = prices.slice(i, i + interval);
      if (candle.length > 0) {
        const open = candle[0][1];
        const close = candle[candle.length - 1][1];
        const high = Math.max(...candle.map((p: any) => p[1]));
        const low = Math.min(...candle.map((p: any) => p[1]));
        const time = candle[0][0];
        
        candlesticks.push({ time, open, high, low, close });
      }
    }
    
    return { prices, candlesticks };
  } catch (error) {
    console.error('Error fetching chart:', error);
    return { prices: [], candlesticks: [] };
  }
};

export const fetchGlobalData = async () => {
  try {
    const response = await axios.get(`${COINGECKO_API}/global`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching global data:', error);
    return null;
  }
};
