import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShoppingCart, Loader2 } from "lucide-react";

interface BuyCoinModalProps {
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

export const BuyCoinModal = ({ coin, isOpen, onClose, onSuccess }: BuyCoinModalProps) => {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dbCoinId, setDbCoinId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadDbCoinId = async () => {
      // Map the coin symbol to database cryptocurrency_id
      const { data: dbCoins } = await supabase
        .from('cryptocurrencies')
        .select('id')
        .eq('symbol', coin.symbol.toLowerCase())
        .maybeSingle();
      
      if (dbCoins) {
        setDbCoinId(dbCoins.id);
      }
    };

    loadDbCoinId();
  }, [isOpen, coin.symbol]);

  const handleBuy = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to purchase");
        return;
      }

      if (!dbCoinId) {
        toast.error("Could not find cryptocurrency in database");
        return;
      }

      const purchaseAmount = parseFloat(amount);
      const totalCost = purchaseAmount * coin.current_price;

      // Insert purchase record
      const { error } = await supabase
        .from("user_purchases")
        .insert({
          user_id: user.id,
          cryptocurrency_id: dbCoinId,
          amount: purchaseAmount,
          purchase_price: coin.current_price,
          total_cost: totalCost,
          status: "completed"
        });

      if (error) {
        console.error("Purchase error:", error);
        toast.error(`Failed to complete purchase: ${error.message}`);
        return;
      }

      toast.success(`Successfully purchased ${purchaseAmount} ${coin.symbol.toUpperCase()}! 🎉`);
      setAmount("");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error("Failed to complete purchase");
    } finally {
      setLoading(false);
    }
  };

  const totalCost = amount && parseFloat(amount) > 0 
    ? (parseFloat(amount) * coin.current_price).toFixed(2) 
    : "0.00";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img src={coin.image} alt={coin.name} className="w-8 h-8" />
            <span>Buy {coin.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Price</span>
              <span className="font-semibold">${coin.current_price.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({coin.symbol.toUpperCase()})</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.00000001"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Enter the amount of {coin.symbol.toUpperCase()} you want to purchase
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Cost</span>
              <span className="text-lg font-bold">${totalCost}</span>
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
              onClick={handleBuy}
              className="flex-1 button-gradient gap-2"
              disabled={loading || !amount || parseFloat(amount) <= 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Buy Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
