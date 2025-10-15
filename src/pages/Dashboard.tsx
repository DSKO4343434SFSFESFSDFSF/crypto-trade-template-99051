import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, ChevronDown, Search, Grid3x3, TrendingUp, Zap, Heart } from "lucide-react";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { PromoBanner } from "@/components/dashboard/PromoBanner";
import { WatchlistCard } from "@/components/dashboard/WatchlistCard";
import { BuyCoinModal } from "@/components/dashboard/BuyCoinModal";
import { SellCoinModal } from "@/components/dashboard/SellCoinModal";
import { SwapCoinModal } from "@/components/dashboard/SwapCoinModal";
import { CoinData } from "@/services/coingecko";
import { useCoinData } from "@/contexts/CoinDataContext";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const navigate = useNavigate();
  const { coins, loading: coinsLoading, refreshing: coinsRefreshing } = useCoinData();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "convert">("buy");
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [portfolioVersion, setPortfolioVersion] = useState(0);

  useEffect(() => {
    // Check authentication and fetch user profile
    const fetchUserProfile = async (userId: string) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", userId)
        .single();
      
      if (profile && profile.first_name && profile.last_name) {
        setUserName(`${profile.first_name} ${profile.last_name}`);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const loadPortfolioData = async () => {
      if (!user || coins.length === 0) return;
      
      setPortfolioLoading(true);
      try {
        // Fetch portfolio value if user is authenticated
        const { data: portfolioData } = await supabase
          .from('user_portfolio_summary')
          .select('cryptocurrency_id, symbol, total_amount')
          .eq('user_id', user.id);
        
        if (portfolioData && portfolioData.length > 0) {
          // Create a map of real-time prices by symbol
          const coinPriceMap = new Map<string, number>();
          coins.forEach(coin => {
            coinPriceMap.set(coin.symbol.toUpperCase(), coin.current_price);
          });
          
          // Calculate total portfolio value with real-time prices
          const totalValue = portfolioData.reduce((sum, holding) => {
            const realTimePrice = coinPriceMap.get(holding.symbol.toUpperCase()) || 0;
            return sum + (holding.total_amount * realTimePrice);
          }, 0);
          
          setPortfolioValue(totalValue);
        } else {
          setPortfolioValue(0);
        }
      } catch (error) {
        console.error('Error loading portfolio data:', error);
      } finally {
        setPortfolioLoading(false);
      }
    };

    loadPortfolioData();
  }, [user, coins, portfolioVersion]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Generate sparkline data for charts (mock data based on price change)
  const generateSparklineData = (priceChange: number) => {
    const baseValue = 100;
    const data = [];
    const trend = priceChange > 0 ? 1 : -1;
    
    for (let i = 0; i < 20; i++) {
      const variation = Math.random() * 10 - 5;
      const value = baseValue + (i * trend * 0.5) + variation;
      data.push(value);
    }
    
    return data;
  };

  const loading = coinsLoading || portfolioLoading;
  const refreshing = coinsRefreshing;

  if (coinsLoading && coins.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <Sidebar className="w-64 fixed left-0 top-0 bottom-0 z-40" />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64">
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-[#0A0A0A]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <h1 className="text-xl font-bold text-white">Nexbit</h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search for assets, markets & more" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-20 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-green-500/50"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-white/10 rounded text-xs text-muted-foreground">
                  Ctrl K
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                <TrendingUp className="w-4 h-4 mr-2" />
                Transfer
              </Button>
              <Grid3x3 className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground" />
              {user && <NotificationBell userId={user.id} />}
              <div className="flex items-center gap-3 ml-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">{userName ? userName[0].toUpperCase() : user?.email?.[0].toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-8 py-8">
        {/* Promo Banner */}
        <PromoBanner />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Portfolio & Watchlist */}
          <div className="lg:col-span-2 space-y-6">
              {/* Portfolio Value */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Portfolio value</p>
              <div className="flex items-center gap-4 mb-6">
                {portfolioLoading ? (
                  <Skeleton className="h-12 w-48" />
                ) : (
                  <h2 className={`text-4xl font-bold text-white transition-opacity ${refreshing ? 'opacity-75' : ''}`}>
                    ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                )}
                <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/5 text-white">
                  <span className="text-sm">↓</span>
                  <span className="ml-1">Deposit</span>
                </Button>
              </div>
            </div>

            {/* Watchlist */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Watchlist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {coinsLoading && coins.length === 0 ? (
                  // Skeleton loading for watchlist cards
                  Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-6 h-6 rounded-full" />
                          <div>
                            <Skeleton className="h-3 w-12 mb-1" />
                            <Skeleton className="h-2 w-8" />
                          </div>
                        </div>
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ))
                ) : (
                  coins.slice(0, 9).map((coin) => (
                    <div key={coin.id} className={`transition-opacity ${refreshing ? 'opacity-75' : ''}`}>
                      <WatchlistCard
                        name={coin.name}
                        symbol={coin.symbol.toUpperCase()}
                        icon={coin.image}
                        price={`$${coin.current_price.toLocaleString()}`}
                        change={`${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%`}
                        isPositive={coin.price_change_percentage_24h > 0}
                        chartData={generateSparklineData(coin.price_change_percentage_24h)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Most Popular Global Markets */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                Most Popular Global Markets <Heart className="w-6 h-6 text-green-500 fill-green-500" />
              </h3>
              <p className="text-sm text-gray-400">Discover all the most popular assets on Nexbit</p>
            </div>
          </div>

          {/* Right Column - Trading Panel */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-6 sticky top-24">
              {/* Tabs */}
              <div className="flex gap-3 mb-6 border-b border-white/10">
                <button 
                  onClick={() => setActiveTab("buy")}
                  className={`text-xs font-medium pb-2 px-2 border-b-2 transition-colors ${
                    activeTab === "buy" ? "border-green-500 text-white" : "border-transparent text-gray-400"
                  }`}
                >
                  Buy
                </button>
                <button 
                  onClick={() => setActiveTab("sell")}
                  className={`text-xs font-medium pb-2 px-2 border-b-2 transition-colors ${
                    activeTab === "sell" ? "border-green-500 text-white" : "border-transparent text-gray-400"
                  }`}
                >
                  Sell
                </button>
                <button 
                  onClick={() => setActiveTab("convert")}
                  className={`text-xs font-medium pb-2 px-2 border-b-2 transition-colors ${
                    activeTab === "convert" ? "border-green-500 text-white" : "border-transparent text-gray-400"
                  }`}
                >
                  Convert
                </button>
              </div>

              {/* Coin Selector */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 mb-2">Select cryptocurrency</p>
                <Select 
                  value={selectedCoin?.id || ""} 
                  onValueChange={(value) => {
                    const coin = coins.find(c => c.id === value);
                    setSelectedCoin(coin || null);
                  }}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-white/10 hover:border-green-500/50 text-white">
                    <SelectValue placeholder="Choose a coin" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-white/10">
                    {coins.slice(0, 20).map((coin) => (
                      <SelectItem key={coin.id} value={coin.id} className="text-white hover:bg-white/5">
                        <div className="flex items-center gap-2">
                          <img src={coin.image} alt={coin.name} className="w-5 h-5" />
                          <span>{coin.name}</span>
                          <span className="text-gray-400 text-xs">({coin.symbol.toUpperCase()})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCoin && (
                <>
                  {/* Selected Coin Info */}
                  <div className="mb-6 p-4 bg-[#0A0A0A] border border-white/10 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={selectedCoin.image} alt={selectedCoin.name} className="w-10 h-10" />
                      <div>
                        <p className="text-sm font-medium text-white">{selectedCoin.name}</p>
                        <p className="text-xs text-gray-400">{selectedCoin.symbol.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Current Price</span>
                      <span className="text-sm font-semibold text-white">
                        ${selectedCoin.current_price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">24h Change</span>
                      <span className={`text-sm font-semibold ${
                        selectedCoin.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"
                      }`}>
                        {selectedCoin.price_change_percentage_24h > 0 ? "+" : ""}
                        {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                    onClick={() => {
                      if (activeTab === "buy") {
                        setIsBuyModalOpen(true);
                      } else if (activeTab === "sell") {
                        setIsSellModalOpen(true);
                      } else {
                        setIsSwapModalOpen(true);
                      }
                    }}
                  >
                    {activeTab === "buy" ? "Buy Now" : activeTab === "sell" ? "Sell Now" : "Convert Now"}
                  </Button>
                </>
              )}

              {!selectedCoin && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Select a cryptocurrency to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
      </div>

      {/* Trading Modals */}
      {selectedCoin && (
        <>
          <BuyCoinModal
            coin={selectedCoin}
            isOpen={isBuyModalOpen}
            onClose={() => setIsBuyModalOpen(false)}
            onSuccess={() => setPortfolioVersion(v => v + 1)}
          />
          <SellCoinModal
            coin={selectedCoin}
            isOpen={isSellModalOpen}
            onClose={() => setIsSellModalOpen(false)}
            onSuccess={() => setPortfolioVersion(v => v + 1)}
          />
          <SwapCoinModal
            initialCoin={selectedCoin}
            isOpen={isSwapModalOpen}
            onClose={() => setIsSwapModalOpen(false)}
            onSuccess={() => setPortfolioVersion(v => v + 1)}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
