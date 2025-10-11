import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { YourHoldings } from "@/components/dashboard/YourHoldings";
import { CoinCard } from "@/components/dashboard/CoinCard";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { fetchTopCoins, fetchCoinChart, fetchGlobalData, CoinData } from "@/services/coingecko";
import { getPortfolio } from "@/services/portfolio";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [portfolioChartData, setPortfolioChartData] = useState<any[]>([]);
  const [portfolioCoins, setPortfolioCoins] = useState<Array<{ id: string; name: string; symbol: string; color: string }>>([]);
  const [globalData, setGlobalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [spentThisMonth, setSpentThisMonth] = useState(0);

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
    // Load spent this month data
    const loadSpentThisMonth = async () => {
      if (!user) return;

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from("user_purchases")
        .select("total_cost")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("purchase_date", firstDayOfMonth.toISOString())
        .lte("purchase_date", lastDayOfMonth.toISOString());

      if (error) {
        console.error("Error loading spent this month:", error);
        return;
      }

      const totalSpent = data?.reduce((sum, purchase) => {
        // Only count positive values (purchases, not sells)
        return sum + Math.max(0, purchase.total_cost);
      }, 0) || 0;

      setSpentThisMonth(totalSpent);
    };

    loadSpentThisMonth();
  }, [user]);

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

        // Load portfolio data
        const portfolio = getPortfolio();
        if (portfolio.length > 0) {
          // Fetch chart data for portfolio coins
          const portfolioChartPromises = portfolio.map(coin => 
            fetchCoinChart(coin.id, 1).catch(() => ({ prices: [] }))
          );
          const portfolioCharts = await Promise.all(portfolioChartPromises);
          
          // Find portfolio coins in the loaded coins data
          const portfolioCoinsData = portfolio.map(pCoin => {
            const coinData = coinsData.find(c => c.id === pCoin.id);
            return coinData ? {
              id: pCoin.id,
              name: pCoin.name,
              symbol: pCoin.symbol,
              color: '',
              current_price: coinData.current_price
            } : null;
          }).filter(Boolean) as Array<{ id: string; name: string; symbol: string; color: string; current_price: number }>;

          setPortfolioCoins(portfolioCoinsData);

          // Combine portfolio chart data
          if (portfolioCharts.length > 0 && portfolioCharts[0].prices.length > 0) {
            const portfolioCombined = portfolioCharts[0].prices.map((_, index) => {
              const dataPoint: any = {
                time: new Date(portfolioCharts[0].prices[index][0]).toLocaleTimeString('en-US', { 
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true 
                })
              };
              
              portfolioCharts.forEach((chart, chartIndex) => {
                if (chart.prices[index]) {
                  dataPoint[portfolioCoinsData[chartIndex].symbol] = Math.round(chart.prices[index][1]);
                }
              });
              
              return dataPoint;
            }).filter((_, index) => index % 4 === 0);
            
            setPortfolioChartData(portfolioCombined);
          }
        } else {
          setPortfolioCoins([]);
          setPortfolioChartData([]);
        }
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
                <button onClick={() => navigate("/cryptocurrencies")} className="text-sm font-medium text-muted-foreground hover:text-foreground">Cryptocurrencies</button>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Exchange</button>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Community</button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && <NotificationBell userId={user.id} />}
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back, {userName || user?.email?.split('@')[0]}</h2>
            <p className="text-muted-foreground">Here's take a look at your performance and analytics.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/cryptocurrencies")} className="button-gradient gap-2">
              <Plus className="w-4 h-4" />
              Add new coin
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatsCard
            label="SPENT THIS MONTH"
            value={`$${spentThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change="Based on your purchases"
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

        {/* Chart and Holdings Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <PriceChart 
              data={chartData} 
              portfolioData={portfolioChartData}
              portfolioCoins={portfolioCoins}
            />
          </div>
          <div className="space-y-6">
            {user && <YourHoldings userId={user.id} />}
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

        {/* Recent Activity */}
        {user && <RecentActivity userId={user.id} />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
