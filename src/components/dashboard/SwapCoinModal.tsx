import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { fetchTopCoins, CoinData } from "@/services/coingecko";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SwapCoinModalProps {
  initialCoin?: {
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

const SWAP_FEE_PERCENTAGE = 1.5; // 1.5% fee

export const SwapCoinModal = ({ initialCoin, isOpen, onClose, onSuccess }: SwapCoinModalProps) => {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [fromCoin, setFromCoin] = useState<string>(initialCoin?.id || "");
  const [toCoin, setToCoin] = useState<string>("");
  const [fromBalance, setFromBalance] = useState<number>(0);
  const [fromCoinData, setFromCoinData] = useState<CoinData | null>(null);
  const [toCoinData, setToCoinData] = useState<CoinData | null>(null);

  useEffect(() => {
    const loadCoins = async () => {
      const coinsData = await fetchTopCoins();
      setCoins(coinsData);
    };
    loadCoins();
  }, []);

  useEffect(() => {
    if (fromCoin) {
      const coin = coins.find(c => c.id === fromCoin);
      setFromCoinData(coin || null);
    }
  }, [fromCoin, coins]);

  useEffect(() => {
    if (toCoin) {
      const coin = coins.find(c => c.id === toCoin);
      setToCoinData(coin || null);
    }
  }, [toCoin, coins]);

  useEffect(() => {
    if (!isOpen || !fromCoin) return;

    const loadBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_portfolio_summary")
        .select("total_amount")
        .eq("user_id", user.id)
        .eq("cryptocurrency_id", fromCoin)
        .single();

      setFromBalance(data?.total_amount || 0);
    };

    loadBalance();
  }, [isOpen, fromCoin]);

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!fromCoin || !toCoin) {
      toast.error("Please select both coins");
      return;
    }

    if (fromCoin === toCoin) {
      toast.error("Cannot swap the same coin");
      return;
    }

    const swapAmount = parseFloat(amount);
    if (swapAmount > fromBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!fromCoinData || !toCoinData) {
      toast.error("Coin data not available");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to swap");
        return;
      }

      // Calculate swap values
      const fromValue = swapAmount * fromCoinData.current_price;
      const feeAmount = fromValue * (SWAP_FEE_PERCENTAGE / 100);
      const netValue = fromValue - feeAmount;
      const toAmount = netValue / toCoinData.current_price;

      // Sell from coin (negative amount)
      const { error: sellError } = await supabase
        .from("user_purchases")
        .insert({
          user_id: user.id,
          cryptocurrency_id: fromCoin,
          amount: -swapAmount,
          purchase_price: fromCoinData.current_price,
          total_cost: -fromValue,
          status: "completed",
          notes: `Swap to ${toCoinData.symbol.toUpperCase()}`
        });

      if (sellError) throw sellError;

      // Buy to coin
      const { error: buyError } = await supabase
        .from("user_purchases")
        .insert({
          user_id: user.id,
          cryptocurrency_id: toCoin,
          amount: toAmount,
          purchase_price: toCoinData.current_price,
          total_cost: netValue,
          status: "completed",
          notes: `Swap from ${fromCoinData.symbol.toUpperCase()} (Fee: $${feeAmount.toFixed(2)})`
        });

      if (buyError) throw buyError;

      toast.success(
        `Successfully swapped ${swapAmount} ${fromCoinData.symbol.toUpperCase()} for ${toAmount.toFixed(6)} ${toCoinData.symbol.toUpperCase()}! 🔄`
      );
      setAmount("");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Swap error:", error);
      toast.error("Failed to complete swap");
    } finally {
      setLoading(false);
    }
  };

  const swapAmount = amount && parseFloat(amount) > 0 && fromCoinData && toCoinData
    ? parseFloat(amount)
    : 0;
  
  const fromValue = swapAmount * (fromCoinData?.current_price || 0);
  const feeAmount = fromValue * (SWAP_FEE_PERCENTAGE / 100);
  const netValue = fromValue - feeAmount;
  const toAmount = toCoinData ? netValue / toCoinData.current_price : 0;

  const handleSwapDirection = () => {
    const temp = fromCoin;
    setFromCoin(toCoin);
    setToCoin(temp);
    setAmount("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <ArrowDownUp className="w-6 h-6" />
            <span>Swap Cryptocurrency</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* From Section */}
          <div className="space-y-2">
            <Label>From</Label>
            <Select value={fromCoin} onValueChange={setFromCoin}>
              <SelectTrigger>
                <SelectValue placeholder="Select coin" />
              </SelectTrigger>
              <SelectContent>
                {coins.map((coin) => (
                  <SelectItem key={coin.id} value={coin.id}>
                    <div className="flex items-center gap-2">
                      <img src={coin.image} alt={coin.name} className="w-5 h-5" />
                      <span>{coin.name}</span>
                      <span className="text-muted-foreground text-xs">
                        ({coin.symbol.toUpperCase()})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fromCoin && (
              <p className="text-xs text-muted-foreground">
                Available: {fromBalance.toFixed(6)} {fromCoinData?.symbol.toUpperCase()}
              </p>
            )}
          </div>

          {/* Amount Input */}
          {fromCoin && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  max={fromBalance}
                  step="0.00000001"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs"
                  onClick={() => setAmount(fromBalance.toString())}
                  disabled={loading}
                >
                  Max
                </Button>
              </div>
            </div>
          )}

          {/* Swap Direction Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handleSwapDirection}
              disabled={!fromCoin || !toCoin}
            >
              <ArrowDownUp className="w-4 h-4" />
            </Button>
          </div>

          {/* To Section */}
          <div className="space-y-2">
            <Label>To</Label>
            <Select value={toCoin} onValueChange={setToCoin}>
              <SelectTrigger>
                <SelectValue placeholder="Select coin" />
              </SelectTrigger>
              <SelectContent>
                {coins
                  .filter((coin) => coin.id !== fromCoin)
                  .map((coin) => (
                    <SelectItem key={coin.id} value={coin.id}>
                      <div className="flex items-center gap-2">
                        <img src={coin.image} alt={coin.name} className="w-5 h-5" />
                        <span>{coin.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({coin.symbol.toUpperCase()})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {toCoin && swapAmount > 0 && (
              <p className="text-sm font-medium text-primary">
                You'll receive: ~{toAmount.toFixed(6)} {toCoinData?.symbol.toUpperCase()}
              </p>
            )}
          </div>

          {/* Fee Information */}
          {swapAmount > 0 && fromCoin && toCoin && (
            <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">From Value</span>
                <span className="font-medium">${fromValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Swap Fee ({SWAP_FEE_PERCENTAGE}%)</span>
                <span className="font-medium text-yellow-500">-${feeAmount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Net Value</span>
                <span className="font-semibold">${netValue.toFixed(2)}</span>
              </div>
            </div>
          )}

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
              onClick={handleSwap}
              className="flex-1 button-gradient gap-2"
              disabled={
                loading ||
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > fromBalance ||
                !fromCoin ||
                !toCoin
              }
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowDownUp className="w-4 h-4" />
                  Swap Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
