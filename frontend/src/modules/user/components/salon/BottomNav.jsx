import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
const tabs = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Search, label: "Explore", path: "/explore/facial" },
  { icon: Calendar, label: "Bookings", path: "/bookings" },
  { icon: User, label: "Profile", path: "/profile" },
];
const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (<nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border z-40 lg:hidden">
    <div className="flex items-center justify-around h-16 px-2">
      {tabs.map((tab) => {
        const isActive = (path) => {
          if (path === "/profile") {
            const profilePaths = ["/profile", "/edit-profile", "/wallet", "/addresses", "/referral", "/coupons", "/support"];
            return profilePaths.some(p => location.pathname.startsWith(p));
          }
          if (path.startsWith("/explore")) return location.pathname.startsWith("/explore");
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
