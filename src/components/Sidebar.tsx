import { Home, TrendingUp, Wallet, ChevronRight, Receipt } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = "" }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: TrendingUp, label: "Cryptocurrencies", path: "/cryptocurrencies" },
    { icon: Wallet, label: "Portfolio", path: "/dashboard" },
    { icon: Receipt, label: "Transactions", path: "/transactions" },
  ];

  return (
    <div className={`bg-[#1A1A1A] border-r border-white/10 h-full ${className}`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 animate-pulse-slow">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Nexbit</h2>
            <p className="text-xs text-gray-400">Trading Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex flex-col gap-2 p-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path && item.path !== "/dashboard" 
            ? true 
            : location.pathname === item.path && item.label === "Dashboard";
          
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden
                ${isActive
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Animated background gradient */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-green-600/10 to-green-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              )}
              
              {/* Icon with animation */}
              <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Label */}
              <span className="relative z-10 text-sm font-medium flex-1 text-left">
                {item.label}
              </span>
              
              {/* Arrow indicator for active item */}
              {isActive && (
                <ChevronRight className="w-4 h-4 animate-pulse" />
              )}
              
              {/* Hover indicator */}
              {!isActive && (
                <div className="absolute right-2 w-1 h-0 bg-green-500 rounded-full group-hover:h-8 transition-all duration-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section - User Status */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">Status: Online</p>
              <p className="text-xs text-gray-400">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
