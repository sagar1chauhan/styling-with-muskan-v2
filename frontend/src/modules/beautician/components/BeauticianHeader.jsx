import { Bell, Wifi, WifiOff, Calendar, LayoutGrid } from "lucide-react";
import { useBeauticianAuth } from "@/modules/beautician/contexts/BeauticianAuthContext";
import { useBeauticianBookings } from "@/modules/beautician/contexts/BeauticianBookingContext";
import { motion } from "framer-motion";

const BeauticianHeader = () => {
    const { beautician, toggleOnline } = useBeauticianAuth();
    const { incomingBookings } = useBeauticianBookings();

    return (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between">
                {/* Left: Partner Context */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex w-9 h-9 rounded-[--radius] bg-primary/5 border border-primary/10 items-center justify-center text-primary">
                        <LayoutGrid className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-foreground tracking-tight flex items-center gap-2">
                            Hi, {beautician?.name?.split(" ")[0] || "Partner"}
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-black hidden xs:inline-block">PREMIUM</span>
                        </h1>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 opacity-40" />
                            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
                        </p>
                    </div>
                </div>

                {/* Right: Operational Status & Notifications */}
                <div className="flex items-center gap-2.5">
                    {/* Operational Toggle */}
                    <button onClick={toggleOnline}
                        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-[--radius] text-[9px] font-black uppercase tracking-widest border transition-all ${beautician?.isOnline
                            ? "bg-green-500/5 border-green-500/20 text-green-600"
                            : "bg-muted border-border text-muted-foreground"
                            }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${beautician?.isOnline ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"}`} />
                        {beautician?.isOnline ? "Operational" : "Offline"}
                    </button>

                    {/* Notification Hub */}
                    <button className="relative w-9 h-9 rounded-[--radius] bg-card border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-all group">
                        <Bell className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        {incomingBookings.length > 0 && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-background">
                                {incomingBookings.length}
                            </motion.div>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default BeauticianHeader;
