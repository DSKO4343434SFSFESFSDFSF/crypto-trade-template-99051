import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchTopCoins, CoinData } from "@/services/coingecko";
import { CoinCard } from "@/components/dashboard/CoinCard";
import { CoinDetailModal } from "@/components/dashboard/CoinDetailModal";
import { toast } from "sonner";

const Reports = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
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
                <button className="text-sm font-medium text-foreground">Reports</button>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Cryptocurrency</button>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Exchange</button>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Community</button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-medium">{user?.email?.[0].toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
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
          <h2 className="text-3xl font-bold mb-2">Cryptocurrency Reports</h2>
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
        />
      )}
    </div>
  );
};

export default Reports;
