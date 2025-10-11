import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, Search, Grid3x3, TrendingUp, Zap, Heart } from "lucide-react";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { PromoBanner } from "@/components/dashboard/PromoBanner";
import { ForYouCard } from "@/components/dashboard/ForYouCard";
import { WatchlistCard } from "@/components/dashboard/WatchlistCard";
import { fetchTopCoins, CoinData } from "@/services/coingecko";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "convert">("buy");

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
    const loadData = async () => {
      setLoading(true);
      try {
        const coinsData = await fetchTopCoins();
        setCoins(coinsData);
      } catch (error) {
        toast.error("Failed to load market data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-[#0A0A0A]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
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
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-20 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-white/10 rounded text-xs text-muted-foreground">
                  Ctrl K
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                <TrendingUp className="w-4 h-4 mr-2" />
                Transfer
              </Button>
              <Grid3x3 className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground" />
              {user && <NotificationBell userId={user.id} />}
              <div className="flex items-center gap-3 ml-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">{userName ? userName[0].toUpperCase() : user?.email?.[0].toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container px-6 py-8">
        {/* Promo Banner */}
        <PromoBanner />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Portfolio & Watchlist */}
          <div className="lg:col-span-2 space-y-6">
              {/* Portfolio Value */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Portfolio value</p>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-4xl font-bold text-white">${portfolioValue.toFixed(2)}</h2>
                <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/5 text-white">
                  <span className="text-sm">↓</span>
                  <span className="ml-1">Deposit</span>
                </Button>
              </div>
            </div>

            {/* Watchlist */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Watchlist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coins.slice(0, 9).map((coin) => (
                  <WatchlistCard
                    key={coin.id}
                    name={coin.name}
                    symbol={coin.symbol.toUpperCase()}
                    icon={coin.image}
                    price={`$${coin.current_price.toLocaleString()}`}
                    change={`${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%`}
                    isPositive={coin.price_change_percentage_24h > 0}
                    chartData={generateSparklineData(coin.price_change_percentage_24h)}
                  />
                ))}
              </div>
            </div>

            {/* Most Popular Global Markets */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                Most Popular Global Markets <Heart className="w-6 h-6 text-purple-500 fill-purple-500" />
              </h3>
              <p className="text-sm text-gray-400">Discover all the most popular assets on Nexbit</p>
            </div>
          </div>

          {/* Right Column - Trading Panel */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A1A1A] border border-white/10 rounded-lg p-6 sticky top-24">
              {/* Tabs */}
              <div className="flex gap-6 mb-6 border-b border-white/10">
                <button 
                  onClick={() => setActiveTab("buy")}
                  className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                    activeTab === "buy" ? "border-purple-500 text-white" : "border-transparent text-gray-400"
                  }`}
                >
                  Buy
                </button>
                <button 
                  onClick={() => setActiveTab("sell")}
                  className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                    activeTab === "sell" ? "border-purple-500 text-white" : "border-transparent text-gray-400"
                  }`}
                >
                  Sell
                </button>
                <button 
                  onClick={() => setActiveTab("convert")}
                  className={`text-sm font-medium pb-3 border-b-2 transition-colors ${
                    activeTab === "convert" ? "border-purple-500 text-white" : "border-transparent text-gray-400"
                  }`}
                >
                  Convert
                </button>
              </div>

              {/* Coin Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-white/10 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">₿</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Bitcoin</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Amount Display */}
              <div className="mb-8">
                <div className="text-right">
                  <div className="text-7xl font-light text-white mb-2">0</div>
                  <div className="text-sm text-gray-400 flex items-center justify-end gap-1">
                    <span>BTC</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Pay with */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Pay with</p>
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-white/10 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors">
                  <span className="text-sm text-gray-300">Select a payment method</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Buy now */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 mb-2">Buy now</p>
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-white/10 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Review Button */}
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
                onClick={() => navigate("/cryptocurrencies")}
              >
                Review
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
