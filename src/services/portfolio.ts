// Portfolio management using localStorage

export interface PortfolioCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  addedAt: number;
  addedPrice: number;
}

const PORTFOLIO_KEY = 'nexbit_portfolio';

export const getPortfolio = (): PortfolioCoin[] => {
  try {
    const stored = localStorage.getItem(PORTFOLIO_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addToPortfolio = (coin: {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
}): void => {
  const portfolio = getPortfolio();
  
  // Check if coin already exists
  if (portfolio.some(c => c.id === coin.id)) {
    throw new Error('Coin already in portfolio');
  }
  
  const newCoin: PortfolioCoin = {
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    image: coin.image,
    addedAt: Date.now(),
    addedPrice: coin.current_price,
  };
  
  portfolio.push(newCoin);
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
};

export const removeFromPortfolio = (coinId: string): void => {
  const portfolio = getPortfolio();
  const filtered = portfolio.filter(c => c.id !== coinId);
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(filtered));
};

export const isInPortfolio = (coinId: string): boolean => {
  const portfolio = getPortfolio();
  return portfolio.some(c => c.id === coinId);
};

export const clearPortfolio = (): void => {
  localStorage.removeItem(PORTFOLIO_KEY);
};
