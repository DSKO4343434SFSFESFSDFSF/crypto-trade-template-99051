import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Cache to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1500; // 1.5 seconds between requests

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getCached = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCache = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Retry with exponential backoff for rate limits
const fetchWithRetry = async (url: string, params: any, retries = 2): Promise<any> => {
  // Check cache first
  const cacheKey = `${url}-${JSON.stringify(params)}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  // Rate limiting - ensure minimum interval between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { params });
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429 && i < retries - 1) {
        // Rate limited - wait before retry with exponential backoff
        const waitTime = Math.pow(2, i) * 2000; // 2s, 4s, 8s...
        console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
      } else {
        throw error;
      }
    }
  }
};

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
    const data = await fetchWithRetry(`${COINGECKO_API}/coins/markets`, {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: limit,
      page: 1,
      sparkline: false,
      price_change_percentage: '1h,24h,7d'
    });
    
    return data.map((coin: any) => ({
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
  } catch (error: any) {
    console.error('Error fetching coins:', error);
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment before refreshing.');
    }
    return [];
  }
};

// Fetch real OHLC historical price data from CoinGecko when available
export const fetchCoinChart = async (coinId: string, days: number = 1): Promise<ChartData> => {
  try {
    // Prefer the OHLC endpoint for true candlestick data
    const ohlcData = await fetchWithRetry(`${COINGECKO_API}/coins/${coinId}/ohlc`, {
      vs_currency: 'usd',
      days
    });

    if (Array.isArray(ohlcData) && ohlcData.length > 0) {
      const candlesticks = ohlcData.map((row: [number, number, number, number, number]) => ({
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
    const chartData = await fetchWithRetry(`${COINGECKO_API}/coins/${coinId}/market_chart`, {
      vs_currency: 'usd',
      days,
      interval: days === 1 ? 'hourly' : 'daily'
    });

    const prices = chartData.prices as [number, number][];
    return { prices, candlesticks: prices.map(([t, p], i, arr) => ({
      time: t,
      open: i > 0 ? arr[i - 1][1] : p,
      high: p,
      low: p,
      close: p,
    })) };
  } catch (error: any) {
    console.error('Error fetching chart:', error);
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before changing time ranges.');
    }
    return { prices: [], candlesticks: [] };
  }
};

export const fetchGlobalData = async () => {
  try {
    const data = await fetchWithRetry(`${COINGECKO_API}/global`, {});
    return data.data;
  } catch (error: any) {
    console.error('Error fetching global data:', error);
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded.');
    }
    return null;
  }
};
