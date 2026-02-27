import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Wallet, TrendingUp, Star, ClipboardList, Clock, AlertTriangle,
    ChevronRight, Zap, BarChart3, Target, XCircle, Activity, ArrowUpRight
} from "lucide-react";
import { useBeauticianAuth } from "@/modules/beautician/contexts/BeauticianAuthContext";
import { useBeauticianBookings } from "@/modules/beautician/contexts/BeauticianBookingContext";

const BeauticianDashboard = () => {
    const navigate = useNavigate();
    const { beautician } = useBeauticianAuth();
    const { incomingBookings, activeBookings, completedBookings } = useBeauticianBookings();

    const stats = [
        { label: "Revenue Peak", value: `₹${(beautician?.earnings?.today || 1499).toLocaleString()}`, icon: TrendingUp, sub: "Today's Ledger" },
        { label: "Escrow Balance", value: `₹${(beautician?.walletBalance || 12450).toLocaleString()}`, icon: Wallet, sub: "Withdraw Ready" },
        { label: "Active Jobs", value: incomingBookings.length, icon: ClipboardList, sub: "Action Required" },
        { label: "Quality Score", value: beautician?.rating || "4.8", icon: Star, sub: "Customer Trust" },
    ];

    const performanceMetrics = [
        { label: "Response Rate", value: `${beautician?.responseRate || 95}%`, icon: Target, status: (beautician?.responseRate || 95) >= 80 ? "good" : "warning" },
        { label: "Completion Ratio", value: `${beautician?.cancellationCount || 1} cancel`, icon: XCircle, status: (beautician?.cancellationCount || 1) <= 3 ? "good" : "warning" },
        { label: "Partner Tier", value: "Elite Pro", icon: Activity, status: "good" },
    ];

    return (
        <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background min-h-screen">
            <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">

                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    {stats.map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-card border border-border/50 rounded-[--radius] p-4 shadow-sm group hover:border-primary/30 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 transition-colors">
                                    <stat.icon className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <ArrowUpRight className="w-3 h-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1 opacity-60">{stat.label}</p>
                            <h3 className="text-lg font-black text-foreground tracking-tight">{stat.value}</h3>
                            <p className="text-[8px] text-muted-foreground font-medium mt-1 uppercase tracking-tighter opacity-40">{stat.sub}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Breakdown */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="lg:col-span-2 bg-card border border-border/50 rounded-[--radius] p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 text-primary" /> Operational Performance
                                </h3>
                                <p className="text-[9px] text-muted-foreground font-medium mt-1">Real-time partner health checkpoints</p>
                            </div>
                            <button onClick={() => navigate("/beautician/earnings")} className="text-[9px] font-black uppercase text-primary tracking-widest hover:underline">Full Analytics</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                            {performanceMetrics.map((metric) => (
                                <div key={metric.label} className="p-4 rounded-[--radius] bg-muted/30 border border-border/30 relative overflow-hidden group">
                                    <metric.icon className={`absolute -right-1 -bottom-1 w-10 h-10 opacity-5 group-hover:scale-110 transition-transform ${metric.status === "good" ? "text-green-500" : "text-amber-500"}`} />
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">{metric.label}</p>
                                    <p className={`text-lg font-black tracking-tight ${metric.status === "good" ? "text-green-600" : "text-amber-600"}`}>{metric.value}</p>
                                    <div className={`mt-2 w-full h-1 rounded-full overflow-hidden bg-white/50`}>
                                        <div className={`h-full rounded-full ${metric.status === "good" ? "bg-green-500" : "bg-amber-500"}`} style={{ width: '85%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Fast Navigation */}
                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-40">System Access</p>
                        {[
                            { label: "Live Bookings", count: incomingBookings.length, icon: ClipboardList, path: "/beautician/bookings", color: "text-primary" },
                            { label: "Shift Control", desc: "Manage Availability", icon: Clock, path: "/beautician/availability", color: "text-primary" },
                            { label: "Escrow Ledger", desc: "Wallet & Payouts", icon: Zap, path: "/beautician/earnings", color: "text-primary" },
                        ].map((action, i) => (
                            <button key={action.label} onClick={() => navigate(action.path)}
                                className="w-full bg-card border border-border/50 rounded-[--radius] p-3 shadow-sm hover:border-primary/40 hover:bg-muted/10 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                        <action.icon className={`w-3.5 h-3.5 ${action.color}`} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-[11px] text-foreground font-black uppercase tracking-tight">{action.label}</h4>
                                        <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-40">{action.desc || `${action.count} pending tasks`}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary transition-all" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="pt-4 pointer-events-none opacity-40">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent mb-6" />
                    <p className="text-center text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">Operational Protocol v1.0.4 • Professional Panel</p>
                </div>
            </div>
        </div>
    );
};

export default BeauticianDashboard;
