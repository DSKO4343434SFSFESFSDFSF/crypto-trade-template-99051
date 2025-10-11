import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Activity, ShoppingCart, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  cryptocurrency_id: string;
  amount: number;
  purchase_price: number;
  total_cost: number;
  purchase_date: string;
  status: string;
  transaction_type: string;
  coin_name?: string;
  coin_symbol?: string;
  coin_image?: string;
}

interface RecentActivityProps {
  userId: string;
}

export const RecentActivity = ({ userId }: RecentActivityProps) => {
  const [activities, setActivities] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadRecentActivity = async () => {
      setLoading(true);
      try {
        // Get recent purchases
        const { data: purchases, error } = await supabase
          .from("user_purchases")
          .select(`
            *,
            cryptocurrencies:cryptocurrency_id (
              name,
              symbol,
              image_url
            )
          `)
          .eq("user_id", userId)
          .order("purchase_date", { ascending: false })
          .limit(5);

        if (error) throw error;

        const formattedActivities = purchases?.map((purchase: any) => ({
          id: purchase.id,
          cryptocurrency_id: purchase.cryptocurrency_id,
          amount: purchase.amount,
          purchase_price: purchase.purchase_price,
          total_cost: purchase.total_cost,
          purchase_date: purchase.purchase_date,
          status: purchase.status,
          transaction_type: "buy",
          coin_name: purchase.cryptocurrencies?.name,
          coin_symbol: purchase.cryptocurrencies?.symbol,
          coin_image: purchase.cryptocurrencies?.image_url,
        })) || [];

        setActivities(formattedActivities);
      } catch (error) {
        console.error("Error loading recent activity:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentActivity();
  }, [userId]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="glass border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <p className="text-xs text-muted-foreground">Your latest transactions</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading activity...
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No recent activity</p>
            <p className="text-xs mt-1">Start buying cryptocurrencies to see your activity here</p>
          </div>
        ) : (
          activities.map((activity) => {
            const isBuy = activity.transaction_type === "buy";
            
            return (
              <div
                key={activity.id}
                className="group relative p-4 rounded-xl border border-border bg-background/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Transaction Type Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isBuy ? "bg-green-500/10" : "bg-red-500/10"
                    )}>
                      {isBuy ? (
                        <ShoppingCart className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                    </div>

                    {/* Transaction info */}
                    <div className="flex items-center gap-3 flex-1">
                      {activity.coin_image && (
                        <img 
                          src={activity.coin_image} 
                          alt={activity.coin_name || "Coin"} 
                          className="w-8 h-8 rounded-full ring-2 ring-border group-hover:ring-primary/50 transition-all" 
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {isBuy ? "Bought" : "Sold"} {activity.coin_name || "Cryptocurrency"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.amount.toFixed(6)} {activity.coin_symbol?.toUpperCase() || ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount and time */}
                  <div className="text-right">
                    <div className={cn(
                      "font-semibold text-lg",
                      isBuy ? "text-green-500" : "text-red-500"
                    )}>
                      {isBuy ? "-" : "+"}${activity.total_cost.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getTimeAgo(activity.purchase_date)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary card */}
      {activities.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Transactions</span>
            <span className="font-semibold">{activities.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Total Spent</span>
            <span className="font-semibold">
              ${activities.reduce((sum, a) => sum + a.total_cost, 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
