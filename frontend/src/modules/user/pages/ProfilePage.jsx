import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGenderTheme } from "@/modules/user/contexts/GenderThemeContext";
import { useAuth } from "@/modules/user/contexts/AuthContext";
import { ArrowLeft, ChevronRight, Wallet, MapPin, Gift, Ticket, HelpCircle, LogOut, User, Calendar, Edit2, ShieldCheck } from "lucide-react";
import BottomNav from "@/modules/user/components/salon/BottomNav";

/**
 * ProfilePage Component
 * Displays user profile information, gender theme switcher, and navigation to sub-pages.
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { gender, setGender } = useGenderTheme();
  const { user, logout } = useAuth();
  const [showPopup, setShowPopup] = useState(false);

  const handleGenderSwitch = (g) => {
    if (g === "men") {
        const isMenEnabled = JSON.parse(localStorage.getItem('swm_men_enabled') ?? 'false');
        if (!isMenEnabled) {
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 2500);
            return;
        }
    }
    setGender(g);
  };

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  const menuItems = [
    { icon: Calendar, label: "My Bookings", desc: "View past & upcoming bookings", path: "/bookings" },
    { icon: Wallet, label: "Wallet", desc: "₹651 balance", path: "/wallet" },
    { icon: MapPin, label: "Addresses", desc: "Manage saved addresses", path: "/addresses" },
    { icon: Gift, label: "Referral", desc: "Invite friends & earn", path: "/referral" },
    { icon: Ticket, label: "Coupons", desc: "Available offers", path: "/coupons" },
    { icon: HelpCircle, label: "Help & Support", desc: "FAQs, chat, call", path: "/support" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-strong border-b border-border px-4 py-3 flex items-center gap-3 font-medium">
        <button onClick={() => navigate("/home")} className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className={`text-lg font-semibold ${gender === "women" ? "font-display" : "font-heading-men"}`}>Profile</h1>
      </div>

      <div className="px-4 md:px-8 lg:px-0 max-w-2xl mx-auto mt-3 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-4 flex items-center justify-between border border-border/50 shadow-soft"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-theme flex items-center justify-center shadow-lg relative overflow-hidden">
              {user?.image ? (
                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary-foreground" />
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-sm z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-foreground">{user?.name || "Muskan"}</h2>
                {user?.isVerified && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Verified</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user?.phone || "+91 98765 43210"}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/edit-profile")}
            className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-all"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Gender Switch */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-strong rounded-2xl p-4 border border-border/50 relative overflow-hidden"
        >
          <p className="text-[10px] font-bold mb-3 uppercase tracking-widest text-muted-foreground">Service Category</p>
          <div className="flex gap-3 relative z-10">
            {["women", "men"].map((g) => (
              <button
                key={g}
                onClick={() => handleGenderSwitch(g)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${gender === g
                  ? "bg-primary text-primary-foreground border-primary glow-primary shadow-lg"
                  : "bg-accent text-accent-foreground border-transparent opacity-60"
                  }`}
              >
                {g === "women" ? "👩 Women" : "👨 Men"}
              </button>
            ))}
          </div>

          <AnimatePresence>
              {showPopup && (
                  <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 10 }} 
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm p-4"
                  >
                      <p className="font-bold text-foreground text-sm">🚧 Currently Unavailable</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 text-center font-medium">This service category is launching soon!</p>
                  </motion.div>
              )}
          </AnimatePresence>
        </motion.div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.03 }}
              onClick={() => navigate(item.path)}
              className="w-full glass-strong rounded-[20px] p-3 flex items-center gap-4 hover:bg-accent/50 transition-all border border-border/40 hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-40" />
            </motion.button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full glass-strong rounded-[20px] p-3 flex items-center gap-4 text-destructive hover:bg-destructive/10 transition-all border border-destructive/10 group active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <LogOut className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold">Logout</span>
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
