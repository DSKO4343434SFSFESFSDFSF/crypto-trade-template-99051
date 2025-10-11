import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

export const PromoBanner = () => {
  return (
    <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-purple-950/40 border border-purple-500/20 rounded-lg p-5 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white mb-0.5">Add money to buy crypto</h3>
            <p className="text-sm text-gray-400">Easily and securely add funds from your bank account or crypto wallet</p>
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Button variant="outline" className="border-purple-500/50 hover:bg-purple-500/10 text-white">
            Buy crypto
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Deposit cash or crypto
          </Button>
        </div>
      </div>
    </div>
  );
};
