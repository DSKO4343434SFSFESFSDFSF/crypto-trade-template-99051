import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { CreditScore } from "@/components/dashboard/CreditScore";
import { PaymentHistory } from "@/components/dashboard/PaymentHistory";
import { CoinCard } from "@/components/dashboard/CoinCard";
import { fetchTopCoins, fetchCoinChart, fetchGlobalData, CoinData } from "@/services/coingecko";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [globalData, setGlobalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
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
    const loadData = async () => {
      setLoading(true);
      try {
        const [coinsData, btcChart, ethChart, global] = await Promise.all([
          fetchTopCoins(),
          fetchCoinChart('bitcoin', 1),
          fetchCoinChart('ethereum', 1),
          fetchGlobalData(),
        ]);

        setCoins(coinsData);
        setGlobalData(global);

        // Combine BTC and ETH chart data
        const combined = btcChart.prices.map((btcPrice, index) => {
          const ethPrice = ethChart.prices[index];
          return {
            time: new Date(btcPrice[0]).toLocaleTimeString('en-US', { 
              hour: 'numeric',
              minute: '2-digit',
              hour12: true 
            }),
            btc: Math.round(btcPrice[1]),
            eth: Math.round(ethPrice[1]),
          };
        }).filter((_, index) => index % 4 === 0); // Sample every 4th point for cleaner display

        setChartData(combined);
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

  const bitcoin = coins.find(c => c.id === 'bitcoin');
  const totalMarketCap = globalData?.total_market_cap?.usd || 0;
  const totalVolume = globalData?.total_volume?.usd || 0;

  // Mock transaction data
  const transactions = coins.slice(0, 4).map((coin, index) => ({
    id: coin.id,
    name: coin.name,
    icon: coin.image,
    change: `${coin.price_change_percentage_24h.toFixed(2)}%`,
    date: new Date(Date.now() - index * 86400000).toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric' 
    }),
    price: `$ ${coin.current_price.toLocaleString()}`,
    status: 'success' as const,
    isPositive: coin.price_change_percentage_24h > 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
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
                <button className="text-sm font-medium text-foreground">Dashboard</button>
                <button onClick={() => navigate("/reports")} className="text-sm font-medium text-muted-foreground hover:text-foreground">Reports</button>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.email?.split('@')[0]}</h2>
            <p className="text-muted-foreground">Here's take a look at your performance and analytics.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              January 2024 - May 2024
            </Button>
            <Button className="button-gradient gap-2">
              <Plus className="w-4 h-4" />
              Add new coin
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatsCard
            label="SPENT THIS MONTH"
            value={`$${(totalVolume / 1000000000).toFixed(2)}B`}
            change="2.34%"
            isPositive={true}
          />
          <StatsCard
            label="24H% CHANGE"
            value={bitcoin ? `${bitcoin.price_change_percentage_24h.toFixed(2)}%` : "N/A"}
            isPositive={bitcoin ? bitcoin.price_change_percentage_24h > 0 : false}
          />
          <StatsCard
            label="VOLUME (24H)"
            value={`$${(totalVolume / 1000000000).toFixed(2)}B`}
          />
          <StatsCard
            label="MARKET CAP"
            value={`$${(totalMarketCap / 1000000000000).toFixed(2)}T`}
          />
          <StatsCard
            label="AVG MONTHLY GROWING"
            value={`$${(totalMarketCap / 1000000000000).toFixed(2)}T`}
          />
        </div>

        {/* Chart and Score Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PriceChart data={chartData} />
          </div>
          <div className="space-y-6">
            <CreditScore score={660} percentage={80} lastCheck="21 Apr" />
            {bitcoin && (
              <CoinCard
                name="Bitcoin"
                symbol="BTC"
                icon={bitcoin.image}
                price={`$${bitcoin.current_price.toLocaleString()}`}
                change={`${bitcoin.price_change_percentage_24h.toFixed(2)}%`}
                isPositive={bitcoin.price_change_percentage_24h > 0}
                rewardRate="14.74%"
              />
            )}
          </div>
        </div>

        {/* Payment History */}
        <PaymentHistory transactions={transactions} />
      </main>
    </div>
  );
};

export default Dashboard;
