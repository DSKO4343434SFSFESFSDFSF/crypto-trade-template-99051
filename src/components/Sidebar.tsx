import { Home, TrendingUp, Wallet, Settings, BarChart3 } from "lucide-react";
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
    { icon: BarChart3, label: "Analytics", path: "/dashboard" },
    { icon: Settings, label: "Settings", path: "/dashboard" },
  ];

  return (
    <div className={`bg-[#1A1A1A] border-r border-white/10 h-full ${className}`}>
      <div className="flex flex-col gap-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path && item.path !== "/dashboard" 
            ? true 
            : location.pathname === item.path && item.label === "Dashboard";
          
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
