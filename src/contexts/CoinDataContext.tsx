import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchTopCoins, CoinData } from '@/services/coingecko';
import { toast } from 'sonner';

interface CoinDataContextType {
  coins: CoinData[];
  loading: boolean;
  refreshing: boolean;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
}

const CoinDataContext = createContext<CoinDataContextType | undefined>(undefined);

interface CoinDataProviderProps {
  children: ReactNode;
}

export const CoinDataProvider: React.FC<CoinDataProviderProps> = ({ children }) => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadCoins = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const coinsData = await fetchTopCoins();
      setCoins(coinsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching coins:', error);
      if (!isRefresh) {
        toast.error('Failed to load market data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    await loadCoins(true);
  };

  useEffect(() => {
    // Initial load
    loadCoins();

    // Set up interval for automatic refresh every minute
    const interval = setInterval(() => {
      loadCoins(true);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const value: CoinDataContextType = {
    coins,
    loading,
    refreshing,
    lastUpdated,
    refreshData,
  };

  return (
    <CoinDataContext.Provider value={value}>
      {children}
    </CoinDataContext.Provider>
  );
};

export const useCoinData = (): CoinDataContextType => {
  const context = useContext(CoinDataContext);
  if (!context) {
    throw new Error('useCoinData must be used within a CoinDataProvider');
  }
  return context;
};