import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Calendar, User, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/modules/user/contexts/CartContext";

const tabs = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Search, label: "Explore", path: "/explore/facial" },
  // Cart will be inserted in the middle
  { icon: Calendar, label: "Bookings", path: "/bookings" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setIsFloatingSummaryOpen, isFloatingSummaryOpen } = useCart();

  return (<nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border z-40 lg:hidden">
    <div className="flex items-center justify-around h-16 px-2">
      {/* First half of tabs */}
      {tabs.slice(0, 2).map((tab) => {
        const isActive = (path) => {
          if (path.startsWith("/explore")) return location.pathname.startsWith("/explore");
          return location.pathname === path;
        };
        const active = isActive(tab.path);
        return (<button key={tab.label} onClick={() => navigate(tab.path)} className="flex flex-col items-center gap-1 relative">
          <tab.icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-[10px] ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>{tab.label}</span>
        </button>);
      })}

      {/* Central Cart Button - Toggles Floating Summary */}
      <div className="relative -mt-8">
        <button
          onClick={() => setIsFloatingSummaryOpen(!isFloatingSummaryOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-background transition-all active:scale-90 ${isFloatingSummaryOpen ? 'bg-white text-primary shadow-white/20 rotate-180' : 'bg-primary text-white shadow-primary/40'}`}
        >
          <ShoppingBag className="w-6 h-6" />
          {totalItems > 0 && (
            <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center border-2 animate-in zoom-in ${isFloatingSummaryOpen ? 'bg-primary text-white border-white' : 'bg-white text-primary border-primary'}`}>
              {totalItems}
            </span>
          )}
        </button>
        <span className="text-[10px] text-primary font-bold uppercase tracking-tighter absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          {isFloatingSummaryOpen ? 'Close' : 'Cart'}
        </span>
      </div>

      {/* Second half of tabs */}
      {tabs.slice(2).map((tab) => {
        const isActive = (path) => {
          if (path === "/profile") {
            const profilePaths = ["/profile", "/edit-profile", "/wallet", "/addresses", "/referral", "/coupons", "/support"];
            return profilePaths.some(p => location.pathname.startsWith(p));
          }
          return location.pathname === path;
        };
        const active = isActive(tab.path);
        return (<button key={tab.label} onClick={() => navigate(tab.path)} className="flex flex-col items-center gap-1 relative">
          <tab.icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-[10px] ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>{tab.label}</span>
        </button>);
      })}
    </div>
  </nav>);
};

export default BottomNav;
