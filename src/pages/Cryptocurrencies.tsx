import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchTopCoins, CoinData } from "@/services/coingecko";
import { CoinDetailModal } from "@/components/dashboard/CoinDetailModal";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { YourHoldings } from "@/components/dashboard/YourHoldings";
import { toast } from "sonner";
import { Heart, TrendingUp, TrendingDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";

interface UserHolding {
  cryptocurrency_id: string;
  symbol: string;
  total_amount: number;
  current_value: number;
}

const Cryptocurrencies = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [holdings, setHoldings] = useState<Map<string, UserHolding>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
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
    const loadUserHoldings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_portfolio_summary')
          .select('cryptocurrency_id, symbol, total_amount, current_value')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Create a map of real-time prices by symbol from coins state
        const coinPriceMap = new Map<string, number>();
        coins.forEach(coin => {
          coinPriceMap.set(coin.symbol.toUpperCase(), coin.current_price);
        });
        
        const holdingsMap = new Map<string, UserHolding>();
        data?.forEach(holding => {
          // Calculate current value with real-time price
          const realTimePrice = coinPriceMap.get(holding.symbol.toUpperCase());
          const currentValue = realTimePrice 
            ? holding.total_amount * realTimePrice 
            : holding.current_value; // Fallback to DB value if price not found
          
          holdingsMap.set(holding.cryptocurrency_id, {
            ...holding,
            current_value: currentValue
          });
        });
        setHoldings(holdingsMap);
      } catch (error) {
        console.error("Error loading holdings:", error);
      }
    };

    loadUserHoldings();
  }, [user, portfolioVersion, coins]);

  useEffect(() => {
    const loadCoins = async () => {
      setLoading(true);
      try {
        const coinsData = await fetchTopCoins();
        
        // Define priority coins order
        const priorityOrder = ['bitcoin', 'ethereum', 'ripple', 'solana', 'tether', 'litecoin', 'binancecoin'];
        
        // Sort coins: priority coins first, then by market cap rank
        const sortedCoins = coinsData.sort((a, b) => {
          const aIndex = priorityOrder.indexOf(a.id);
          const bIndex = priorityOrder.indexOf(b.id);
          
          // If both are priority coins, maintain the priority order
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          // If only a is priority
          if (aIndex !== -1) return -1;
          // If only b is priority
          if (bIndex !== -1) return 1;
          // Neither are priority, sort by rank
          return a.market_cap_rank - b.market_cap_rank;
        });
        
        setCoins(sortedCoins);
      } catch (error) {
        toast.error("Failed to load coins");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCoins();
    const interval = setInterval(loadCoins, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading coins...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <Sidebar className="w-64 fixed left-0 top-0 bottom-0 z-40" />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64">
      {/* Top Navigation - Modern Header */}
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
                  placeholder="Search cryptocurrencies..." 
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-20 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-green-500/50"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-white/10 rounded text-xs text-muted-foreground">
                  Ctrl K
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/dashboard")}
                className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Dashboard
              </button>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Cryptocurrencies</h2>
          <p className="text-muted-foreground">Track real-time prices, market cap, and 24h changes for top cryptocurrencies.</p>
        </div>

        {/* Your Holdings Section */}
        {user && (
          <div className="mb-8">
            <YourHoldings userId={user.id} />
          </div>
        )}

        {/* Table Header */}
        <div className="bg-background/50 border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[50px_40px_2fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr_1fr_1.5fr] gap-4 px-6 py-4 bg-muted/30 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="text-center">#</div>
            <div></div>
            <div>Coin</div>
            <div className="text-right">Price</div>
            <div className="text-right">Market Cap</div>
            <div className="text-right">Volume 24h</div>
            <div className="text-right">Liquidity ±2%</div>
            <div className="text-right">1h</div>
            <div className="text-right">24h</div>
            <div className="text-right">Your Holdings</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border">
            {coins.map((coin, index) => {
              const holding = holdings.get(coin.id);
              const isPositive24h = coin.price_change_percentage_24h > 0;
              const isPositive1h = (coin.price_change_percentage_1h || 0) > 0;
              
              return (
                <div
                  key={coin.id}
                  onClick={() => setSelectedCoin(coin)}
                  className="grid grid-cols-[50px_40px_2fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr_1fr_1.5fr] gap-4 px-6 py-4 hover:bg-muted/20 cursor-pointer transition-colors items-center"
                >
                  {/* Rank */}
                  <div className="text-center text-muted-foreground">{index + 1}</div>
                  
                  {/* Favorite Icon */}
                  <div className="flex items-center justify-center">
                    <Heart className="w-4 h-4 text-muted-foreground/30 hover:text-red-500 transition-colors" />
                  </div>
                  
                  {/* Coin Name */}
                  <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-semibold text-foreground">{coin.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="text-right font-medium">
                    ${coin.current_price.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: coin.current_price < 1 ? 6 : 2 
                    })}
                  </div>
                  
                  {/* Market Cap */}
                  <div className="text-right text-muted-foreground">
                    ${(coin.market_cap / 1000000000).toFixed(2)} B
                  </div>
                  
                  {/* Volume 24h */}
                  <div className="text-right text-muted-foreground">
                    ${(coin.total_volume / 1000000000).toFixed(2)} B
                  </div>
                  
                  {/* Liquidity (placeholder) */}
                  <div className="text-right text-muted-foreground">
                    ${(coin.total_volume / 10000000000).toFixed(2)} B
                  </div>
                  
                  {/* 1h Change */}
                  <div className={cn(
                    "text-right flex items-center justify-end gap-1 text-sm font-medium",
                    isPositive1h ? "text-green-500" : "text-red-500"
                  )}>
                    {isPositive1h ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(coin.price_change_percentage_1h || 0).toFixed(2)}%
                  </div>
                  
                  {/* 24h Change */}
                  <div className={cn(
                    "text-right flex items-center justify-end gap-1 text-sm font-medium",
                    isPositive24h ? "text-green-500" : "text-red-500"
                  )}>
                    {isPositive24h ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </div>
                  
                  {/* Your Holdings */}
                  <div className="text-right">
                    {holding ? (
                      <div>
                        <div className="font-medium text-foreground">
                          {holding.total_amount.toFixed(6)} {coin.symbol.toUpperCase()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${holding.current_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {selectedCoin && (
        <CoinDetailModal
          coin={selectedCoin}
          isOpen={!!selectedCoin}
          onClose={() => setSelectedCoin(null)}
          onPortfolioChange={() => setPortfolioVersion(v => v + 1)}
        />
      )}
      </div>
    </div>
  );
};

export default Cryptocurrencies;
