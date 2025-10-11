import { X } from "lucide-react";
import { useState } from "react";

interface ForYouCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: "default" | "gradient";
}

export const ForYouCard = ({ icon, title, description, variant = "default" }: ForYouCardProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`relative rounded-lg p-4 border ${
      variant === "gradient" 
        ? "bg-gradient-to-br from-purple-950/30 to-indigo-950/30 border-purple-500/30" 
        : "bg-[#1A1A1A] border-white/10"
    }`}>
      <button 
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3 pr-6">
        <div className="mt-0.5 flex-shrink-0">{icon}</div>
        <div>
          <h4 className="font-semibold text-white mb-1 text-sm">{title}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
};
