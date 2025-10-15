import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingDown, Loader2 } from "lucide-react";

interface SellCoinModalProps {
  coin: {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SellCoinModal = ({ coin, isOpen, onClose, onSuccess }: SellCoinModalProps) => {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [dbCoinId, setDbCoinId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Map the coin symbol to database cryptocurrency_id
      const { data: dbCoins } = await supabase
        .from('cryptocurrencies')
        .select('id, symbol')
        .eq('symbol', coin.symbol)
        .maybeSingle();
      
      if (!dbCoins) {
        console.error("Could not find database ID for symbol:", coin.symbol);
        setAvailableBalance(0);
        return;
      }
      
      setDbCoinId(dbCoins.id);

      const { data, error } = await supabase
        .from("user_portfolio_summary")
        .select("total_amount")
        .eq("user_id", user.id)
        .eq("cryptocurrency_id", dbCoins.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading balance:", error);
        setAvailableBalance(0);
        return;
      }

      setAvailableBalance(data?.total_amount || 0);
    };

    loadBalance();
  }, [isOpen, coin.symbol]);

  const handleSell = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const sellAmount = parseFloat(amount);
    if (sellAmount > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to sell");
        return;
      }

      if (!dbCoinId) {
        toast.error("Could not find cryptocurrency in database");
        return;
      }

      const totalReceived = sellAmount * coin.current_price;

      // Insert sell record as negative amount
      const { error } = await supabase
        .from("user_purchases")
        .insert({
          user_id: user.id,
          cryptocurrency_id: dbCoinId,
          amount: -sellAmount, // Negative amount for sell
          purchase_price: coin.current_price,
          total_cost: -totalReceived, // Negative cost for sell
          status: "completed",
          notes: "Sell transaction"
        });

      if (error) {
        console.error("Sell error:", error);
        toast.error(`Failed to complete sale: ${error.message}`);
        return;
      }

      toast.success(`Successfully sold ${sellAmount} ${coin.symbol.toUpperCase()}! 💰`);
      setAmount("");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Sell error:", error);
      toast.error("Failed to complete sale");
    } finally {
      setLoading(false);
    }
  };

  const totalReceived = amount && parseFloat(amount) > 0 
    ? (parseFloat(amount) * coin.current_price).toFixed(2) 
    : "0.00";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img src={coin.image} alt={coin.name} className="w-8 h-8" />
            <span>Sell {coin.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Price</span>
              <span className="font-semibold">${coin.current_price.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available Balance</span>
              <span className="font-semibold text-primary">
                {availableBalance.toFixed(6)} {coin.symbol.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({coin.symbol.toUpperCase()})</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                max={availableBalance}
                step="0.00000001"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs"
                onClick={() => setAmount(availableBalance.toString())}
                disabled={loading}
              >
                Max
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the amount of {coin.symbol.toUpperCase()} you want to sell
            </p>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">You'll Receive</span>
              <span className="text-lg font-bold text-green-500">${totalReceived}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSell}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 gap-2"
              disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4" />
                  Sell Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
