import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, ClipboardList, User, Wallet, History, LogOut, Scissors, Zap, ChevronRight } from "lucide-react";
import { useBeauticianAuth } from "@/modules/beautician/contexts/BeauticianAuthContext";
import { motion } from "framer-motion";

const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/beautician/dashboard" },
    { icon: ClipboardList, label: "My Bookings", path: "/beautician/bookings" },
    { icon: CalendarDays, label: "Availability", path: "/beautician/availability" },
    { icon: Wallet, label: "Earnings", path: "/beautician/earnings" },
    { icon: History, label: "History", path: "/beautician/history" },
];

const BeauticianSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { beautician, logout } = useBeauticianAuth();

    return (
        <aside className="hidden lg:flex flex-col w-64 bg-[hsl(var(--sidebar-background))] border-r border-white/5 h-screen sticky top-0 z-50">
            {/* Header / Brand */}
            <div className="px-6 py-8">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[--radius] bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Scissors className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-black text-xs text-white tracking-widest uppercase">MUSKAN</h2>
                        <p className="text-[8px] text-white/40 font-black uppercase tracking-[0.2em] mt-0.5">Partner Elite</p>
                    </div>
                </div>
            </div>

            {/* Partner Summary */}
            <div className="mx-4 mb-6 p-4 rounded-[--radius] bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground font-black text-xs border border-white/10 italic">
                        {beautician?.name?.[0] || "P"}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-[11px] text-white/90 truncate">{beautician?.name || "Professional Partner"}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${beautician?.isOnline ? "bg-green-500 animate-pulse" : "bg-white/20"}`} />
                            <span className="text-[8px] text-white/40 font-black uppercase tracking-widest">
                                {beautician?.isOnline ? "OPERATIONAL" : "OFF-DUTY"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
                <p className="px-4 text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Main Console</p>
                {navItems.map((item) => {
                    const active = location.pathname === item.path ||
                        (item.path !== "/beautician/dashboard" && location.pathname.startsWith(item.path));
                    return (
                        <button key={item.path} onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[--radius] text-[11px] font-bold transition-all group relative ${active ? "bg-primary text-white shadow-sm shadow-primary/20" : "text-white/50 hover:bg-white/5 hover:text-white"
                                }`}>
                            <item.icon className={`w-4 h-4 transition-colors ${active ? "text-white" : "text-white/30 group-hover:text-white/60"}`} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {active && <ChevronRight className="w-3 h-3 text-white/50" />}
                        </button>
                    );
                })}

                <div className="pt-4">
                    <p className="px-4 text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Account</p>
                    <button onClick={() => navigate("/beautician/profile")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-[--radius] text-[11px] font-bold transition-all group ${location.pathname === "/beautician/profile" ? "bg-primary text-white shadow-sm shadow-primary/20" : "text-white/50 hover:bg-white/5 hover:text-white"
                            }`}>
                        <User className={`w-4 h-4 transition-colors ${location.pathname === "/beautician/profile" ? "text-white" : "text-white/30 group-hover:text-white/60"}`} />
                        <span className="flex-1 text-left">Profile Settings</span>
                    </button>
                </div>
            </nav>

            {/* Footer / Terminate */}
            <div className="p-3 border-t border-white/5">
                <button onClick={() => { logout(); navigate("/beautician/login"); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[--radius] text-[11px] font-black uppercase tracking-widest text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-all">
                    <LogOut className="w-4 h-4" />
                    Terminate
                </button>
            </div>
        </aside>
    );
};

export default BeauticianSidebar;
