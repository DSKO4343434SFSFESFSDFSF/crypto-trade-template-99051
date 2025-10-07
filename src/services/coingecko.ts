import axios from 'axios';

const COINLORE_API = 'https://api.coinlore.net/api';

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
    const response = await axios.get(`${COINLORE_API}/tickers/`, {
      params: {
        start: 0,
        limit: limit
      }
    });
    
    return response.data.data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: `https://www.coinlore.com/img/${coin.nameid}.png`,
      current_price: parseFloat(coin.price_usd || '0'),
      market_cap: parseFloat(coin.market_cap_usd || '0'),
      market_cap_rank: coin.rank,
      total_volume: parseFloat(coin.volume24 || '0'),
      price_change_percentage_24h: parseFloat(coin.percent_change_24h || '0'),
      price_change_percentage_1h: parseFloat(coin.percent_change_1h || '0'),
      price_change_percentage_7d: parseFloat(coin.percent_change_7d || '0'),
      high_24h: parseFloat(coin.price_usd || '0') * (1 + Math.abs(parseFloat(coin.percent_change_24h || '0')) / 100),
      low_24h: parseFloat(coin.price_usd || '0') * (1 - Math.abs(parseFloat(coin.percent_change_24h || '0')) / 100),
    }));
  } catch (error: any) {
    console.error('Error fetching coins:', error);
    return [];
  }
};

// Generate realistic historical price data based on current price and percentage changes
export const fetchCoinChart = async (coinId: string, days: number = 1): Promise<ChartData> => {
  try {
    const response = await axios.get(`${COINLORE_API}/ticker/`, {
      params: {
        id: coinId
      }
    });
    
    const coin = response.data[0];
    const currentPrice = parseFloat(coin.price_usd);
    const change24h = parseFloat(coin.percent_change_24h || '0');
    const change7d = parseFloat(coin.percent_change_7d || '0');
    
    // Generate historical price data with realistic patterns
    const prices: [number, number][] = [];
    const candlesticks: CandlestickData[] = [];
    const now = Date.now();
    const dataPoints = days === 1 ? 48 : days === 7 ? 84 : 90;
    const interval = (days * 24 * 60 * 60 * 1000) / dataPoints;
    
    // Calculate base change for the period
    let baseChange: number;
    if (days === 1) {
      baseChange = change24h;
    } else if (days === 7) {
      baseChange = change7d;
    } else if (days === 30) {
      baseChange = change7d * 3.5;
    } else {
      baseChange = change7d * (days / 7) * 0.9;
    }
    
    // Generate OHLC candles
    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = now - (i * interval);
      const progress = i / dataPoints;
      
      // Base price calculation
      const basePriceChange = (currentPrice * baseChange) / 100;
      let basePrice = currentPrice - (basePriceChange * progress);
      
      // Add realistic wave patterns
      const wave1 = Math.sin(progress * Math.PI * (days === 1 ? 6 : days === 7 ? 10 : 15)) * (currentPrice * 0.008);
      const wave2 = Math.sin(progress * Math.PI * (days === 1 ? 12 : days === 7 ? 20 : 30)) * (currentPrice * 0.004);
      const wave3 = Math.cos(progress * Math.PI * (days === 1 ? 8 : days === 7 ? 15 : 20)) * (currentPrice * 0.006);
      
      basePrice += wave1 + wave2 + wave3;
      
      // Generate OHLC for this candle
      const volatility = days === 1 ? 0.015 : days === 7 ? 0.02 : days === 30 ? 0.03 : 0.035;
      const open = Math.max(basePrice * (1 + (Math.random() - 0.5) * volatility), currentPrice * 0.3);
      const close = Math.max(basePrice * (1 + (Math.random() - 0.5) * volatility), currentPrice * 0.3);
      const high = Math.max(open, close) * (1 + Math.random() * volatility);
      const low = Math.min(open, close) * (1 - Math.random() * volatility);
      
      prices.push([timestamp, close]);
      candlesticks.push({ time: timestamp, open, high, low, close });
    }
    
    return { prices, candlesticks };
  } catch (error: any) {
    console.error('Error fetching chart:', error);
    return { prices: [], candlesticks: [] };
  }
};

export const fetchGlobalData = async () => {
  try {
    const response = await axios.get(`${COINLORE_API}/global/`);
    const data = response.data[0];
    return {
      total_market_cap: { usd: parseFloat(data.total_mcap || '0') },
      total_volume: { usd: parseFloat(data.total_volume || '0') },
      market_cap_percentage: { 
        btc: parseFloat(data.btc_d || '0'),
        eth: parseFloat(data.eth_d || '0')
      },
      market_cap_change_percentage_24h_usd: parseFloat(data.mcap_change || '0')
    };
  } catch (error: any) {
    console.error('Error fetching global data:', error);
    return null;
  }
};
