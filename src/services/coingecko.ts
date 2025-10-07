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

// Fetch real OHLC historical price data from CoinGecko when available
export const fetchCoinChart = async (coinId: string, days: number = 1): Promise<ChartData> => {
  try {
    // Prefer the OHLC endpoint for true candlestick data
    const ohlcRes = await axios.get(`${COINGECKO_API}/coins/${coinId}/ohlc`, {
      params: {
        vs_currency: 'usd',
        days
      }
    });

    if (Array.isArray(ohlcRes.data) && ohlcRes.data.length > 0) {
      const candlesticks = ohlcRes.data.map((row: [number, number, number, number, number]) => ({
        time: row[0],
        open: row[1],
        high: row[2],
        low: row[3],
        close: row[4],
      }));

      const prices: [number, number][] = candlesticks.map((c) => [c.time, c.close]);
      return { prices, candlesticks };
    }

    // Fallback: market_chart (close prices)
    const response = await axios.get(`${COINGECKO_API}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days,
        interval: days === 1 ? 'hourly' : 'daily'
      }
    });

    const prices = response.data.prices as [number, number][];
    return { prices, candlesticks: prices.map(([t, p], i, arr) => ({
      time: t,
      open: i > 0 ? arr[i - 1][1] : p,
      high: p,
      low: p,
      close: p,
    })) };
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
