import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownLeft, Calendar, Filter, FileText, Coins, Search, Grid3x3, TrendingUp } from "lucide-react";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'buy' | 'sell' | 'swap';
  amount: number;
  cryptocurrency_symbol?: string;
  cryptocurrency_name?: string;
  cryptocurrency_image_url?: string;
  usd_amount: number;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
}

const Transactions = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'deposits' | 'trades'>('all');

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
    const fetchTransactions = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch user purchases (buy transactions)
        const { data: purchases, error: purchasesError } = await supabase
          .from('user_purchases')
          .select(`
            id,
            amount,
            total_cost,
            created_at,
            status,
            notes,
            cryptocurrencies (
              symbol,
              name,
              image_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (purchasesError) throw purchasesError;

        // Transform purchases to transaction format
        const purchaseTransactions: Transaction[] = (purchases || []).map(purchase => ({
          id: purchase.id,
          type: 'buy' as const,
          amount: purchase.amount,
          cryptocurrency_symbol: purchase.cryptocurrencies?.symbol,
          cryptocurrency_name: purchase.cryptocurrencies?.name,
          cryptocurrency_image_url: purchase.cryptocurrencies?.image_url,
          usd_amount: purchase.total_cost,
          created_at: purchase.created_at,
          status: purchase.status || 'completed',
          notes: purchase.notes
        }));

        // For now, we'll only show purchase transactions
        // In the future, you can add deposits, withdrawals, sells, and swaps
        setTransactions(purchaseTransactions);

      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <Coins className="w-4 h-4 text-green-500" />;
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'sell':
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'buy':
      case 'deposit':
        return 'text-green-500';
      case 'sell':
      case 'withdrawal':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'buy':
        return 'Purchase';
      case 'sell':
        return 'Sale';
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'swap':
        return 'Swap';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'deposits') return transaction.type === 'deposit';
    if (filter === 'trades') return ['buy', 'sell', 'swap'].includes(transaction.type);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex">
        {/* Sidebar */}
        <Sidebar className="w-64 fixed left-0 top-0 bottom-0 z-40" />
        
        {/* Main Content Area */}
        <div className="flex-1 ml-64">
          {/* Top Navigation - Skeleton */}
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

          {/* Main Content - Skeleton */}
          <main className="max-w-[1800px] mx-auto px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
              <p className="text-gray-400">View all your money transfers, purchases, and trading activity</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>

            {/* Transactions List - Skeleton */}
            <div className="bg-[#1A1A1A] border border-white/10 rounded-lg overflow-hidden">
              <div className="divide-y divide-white/10">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
            <p className="text-gray-400">View all your money transfers, purchases, and trading activity</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-green-600 hover:bg-green-700' : 'border-white/20 hover:bg-white/5 text-white'}
            >
              All Transactions
            </Button>
            <Button
              variant={filter === 'deposits' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('deposits')}
              className={filter === 'deposits' ? 'bg-green-600 hover:bg-green-700' : 'border-white/20 hover:bg-white/5 text-white'}
            >
              Deposits
            </Button>
            <Button
              variant={filter === 'trades' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('trades')}
              className={filter === 'trades' ? 'bg-green-600 hover:bg-green-700' : 'border-white/20 hover:bg-white/5 text-white'}
            >
              Trades
            </Button>
          </div>

          {/* Transactions List */}
          <div className="bg-[#1A1A1A] border border-white/10 rounded-lg overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No transactions found</h3>
                <p className="text-gray-400">
                  {filter === 'all' 
                    ? "You haven't made any transactions yet. Start by making your first purchase!"
                    : `No ${filter} found. Try selecting a different filter.`
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                          {transaction.cryptocurrency_image_url ? (
                            <img 
                              src={transaction.cryptocurrency_image_url} 
                              alt={transaction.cryptocurrency_name || 'Cryptocurrency'} 
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            getTransactionIcon(transaction.type)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              transaction.type === 'buy' ? 'text-green-500' : 'text-white'
                            }`}>
                              {formatTransactionType(transaction.type)}
                            </span>
                            {transaction.cryptocurrency_symbol && (
                              <span className="text-gray-400 text-sm">
                                {transaction.cryptocurrency_name} ({transaction.cryptocurrency_symbol.toUpperCase()})
                              </span>
                            )}
                            {transaction.notes && (
                              <div className="relative group">
                                <FileText className="w-4 h-4 text-blue-400 cursor-help" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-gray-600">
                                  {transaction.notes}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {new Date(transaction.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {transaction.cryptocurrency_symbol && (
                          <div className="text-white font-medium">
                            {transaction.amount.toFixed(6)} {transaction.cryptocurrency_symbol.toUpperCase()}
                          </div>
                        )}
                        <div className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                          ${transaction.usd_amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Transactions;