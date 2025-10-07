import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export interface ChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export const fetchTopCoins = async (): Promise<CoinData[]> => {
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        sparkline: false,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching coins:', error);
    return [];
  }
};

export const fetchCoinChart = async (coinId: string, days: number = 1): Promise<ChartData> => {
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chart:', error);
    return { prices: [], market_caps: [], total_volumes: [] };
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
