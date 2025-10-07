import axios from 'axios';

const COINLORE_API = 'https://api.coinlore.net/api';

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  nameid: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h: number;
  price_change_percentage_7d: number;
  market_cap: number;
  total_volume: number;
  image: string;
  rank: number;
}

export interface ChartData {
  prices: [number, number][];
}

export const fetchTopCoins = async (limit: number = 100): Promise<CoinData[]> => {
  try {
    const response = await axios.get(`${COINLORE_API}/tickers/`, {
      params: {
        start: 0,
        limit: limit
      }
    });
    
    // Transform CoinLore data to match our interface
    return response.data.data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      nameid: coin.nameid,
      image: `https://www.coinlore.com/img/${coin.nameid}.png`,
      current_price: parseFloat(coin.price_usd),
      market_cap: parseFloat(coin.market_cap_usd || '0'),
      rank: coin.rank,
      total_volume: parseFloat(coin.volume24 || '0'),
      price_change_percentage_24h: parseFloat(coin.percent_change_24h || '0'),
      price_change_percentage_1h: parseFloat(coin.percent_change_1h || '0'),
      price_change_percentage_7d: parseFloat(coin.percent_change_7d || '0'),
    }));
  } catch (error) {
    console.error('Error fetching coins:', error);
    return [];
  }
};

// Generate realistic historical price data based on current price and percentage changes
export const fetchCoinChart = async (coinId: string, days: number = 1): Promise<ChartData> => {
  try {
    // Fetch current coin data
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
    const now = Date.now();
    const dataPoints = 100;
    const interval = (days * 24 * 60 * 60 * 1000) / dataPoints;
    
    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = now - (i * interval);
      const percentComplete = i / dataPoints;
      let price: number;
      
      if (days === 1) {
        // For 24h, use linear interpolation with the 24h change
        const priceChange = (currentPrice * change24h) / 100;
        price = currentPrice - (priceChange * percentComplete);
        // Add wave pattern for realism
        const waveEffect = Math.sin((percentComplete * Math.PI * 4)) * (currentPrice * 0.005);
        price += waveEffect;
      } else if (days === 7) {
        // For 7 days, use 7d change
        const priceChange = (currentPrice * change7d) / 100;
        price = currentPrice - (priceChange * percentComplete);
        const waveEffect = Math.sin((percentComplete * Math.PI * 8)) * (currentPrice * 0.01);
        price += waveEffect;
      } else {
        // For longer periods, extrapolate from 7d change
        const estimatedChange = change7d * (days / 7) * 0.8; // Dampen for longer periods
        const priceChange = (currentPrice * estimatedChange) / 100;
        price = currentPrice - (priceChange * percentComplete);
        const waveEffect = Math.sin((percentComplete * Math.PI * 6)) * (currentPrice * 0.015);
        price += waveEffect;
      }
      
      // Ensure price is never negative
      prices.push([timestamp, Math.max(price, 0.000001)]);
    }
    
    return { prices };
  } catch (error) {
    console.error('Error fetching chart:', error);
    return { prices: [] };
  }
};

export const fetchGlobalData = async () => {
  try {
    const response = await axios.get(`${COINLORE_API}/global/`);
    const data = response.data[0];
    return {
      total_market_cap: { usd: data.total_mcap },
      total_volume: { usd: data.total_volume },
      market_cap_percentage: { 
        btc: parseFloat(data.btc_d),
        eth: parseFloat(data.eth_d)
      },
      market_cap_change_percentage_24h_usd: parseFloat(data.mcap_change)
    };
  } catch (error) {
    console.error('Error fetching global data:', error);
    return null;
  }
};
