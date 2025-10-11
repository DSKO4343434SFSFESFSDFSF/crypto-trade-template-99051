import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchTopCoins, CoinData } from "@/services/coingecko";
import { CoinCard } from "@/components/dashboard/CoinCard";
import { CoinDetailModal } from "@/components/dashboard/CoinDetailModal";
import { toast } from "sonner";

const Cryptocurrencies = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [coins, setCoins] = useState<CoinData[]>([]);
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
    const loadCoins = async () => {
      setLoading(true);
      try {
        const coinsData = await fetchTopCoins();
        setCoins(coinsData);
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
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b border-border">
        <div className="container px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-primary">Nexbit</h1>
              <div className="flex gap-6">
                <button onClick={() => navigate("/dashboard")} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Dashboard
                </button>
                <button className="text-sm font-medium text-foreground">Cryptocurrencies</button>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Exchange</button>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Community</button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-medium">{userName ? userName[0].toUpperCase() : user?.email?.[0].toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{userName || user?.email?.split('@')[0]}</p>
                  <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-foreground">
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Cryptocurrencies</h2>
          <p className="text-muted-foreground">Track real-time prices, market cap, and 24h changes for top cryptocurrencies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {coins.map((coin) => (
            <div key={coin.id} onClick={() => setSelectedCoin(coin)} className="cursor-pointer transition-transform hover:scale-105">
              <CoinCard
                name={coin.name}
                symbol={coin.symbol.toUpperCase()}
                icon={coin.image}
                price={`$${coin.current_price.toLocaleString()}`}
                change={`${coin.price_change_percentage_24h.toFixed(2)}%`}
                isPositive={coin.price_change_percentage_24h > 0}
              />
            </div>
          ))}
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
  );
};

export default Cryptocurrencies;
