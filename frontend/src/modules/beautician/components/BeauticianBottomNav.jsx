import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, ClipboardList, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
    { icon: LayoutDashboard, label: "Overview", path: "/beautician/dashboard" },
    { icon: ClipboardList, label: "Bookings", path: "/beautician/bookings" },
    { icon: CalendarDays, label: "Calendar", path: "/beautician/availability" },
    { icon: User, label: "Profile", path: "/beautician/profile" },
];

const BeauticianBottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 z-50 lg:hidden pb-safe">
            <div className="flex items-center justify-around h-14 px-1">
                {tabs.map((tab) => {
                    const active = location.pathname.startsWith(tab.path) ||
                        (tab.path === "/beautician/dashboard" && location.pathname === "/beautician/dashboard");
                    return (
                        <button key={tab.label} onClick={() => navigate(tab.path)}
                            className="flex flex-col items-center gap-0.5 relative flex-1 pt-1 h-full transition-all group">
                            {active && (
                                <motion.div layoutId="beauticianNavIndicator"
                                    className="absolute top-0 w-8 h-0.5 rounded-full bg-primary" />
                            )}
                            <tab.icon className={`w-4.5 h-4.5 transition-all ${active ? "text-primary scale-110" : "text-muted-foreground/60 group-hover:text-primary/60"}`} />
                            <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${active ? "text-primary opacity-100" : "text-muted-foreground/40"}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BeauticianBottomNav;
