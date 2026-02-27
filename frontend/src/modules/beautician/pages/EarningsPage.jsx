import { motion } from "framer-motion";
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, Filter, IndianRupee, CreditCard, ChevronRight } from "lucide-react";
import { useBeauticianAuth } from "@/modules/beautician/contexts/BeauticianAuthContext";
import { Button } from "@/modules/user/components/ui/button";

const mockTransactions = [
    { id: "T1", type: "credit", label: "Gold Facial Service", amount: 1499, date: "26 Feb 2025", time: "10:30 AM" },
    { id: "T2", type: "credit", label: "Full Body Waxing", amount: 1999, date: "26 Feb 2025", time: "02:15 PM" },
    { id: "T3", type: "debit", label: "Wallet Withdrawal", amount: 3000, date: "25 Feb 2025", time: "09:00 AM" },
    { id: "T4", type: "credit", label: "Bridal Makeup Package", amount: 14999, date: "24 Feb 2025", time: "11:45 AM" },
    { id: "T5", type: "debit", label: "Cancellation Penalty", amount: 200, date: "23 Feb 2025", time: "04:30 PM" },
];

const EarningsPage = () => {
    const { beautician } = useBeauticianAuth();

    return (
        <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background min-h-screen pb-24">
            <div className="max-w-xl mx-auto p-4 space-y-5">
                {/* Header Stats */}
                <div className="pt-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Revenue Tracker</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">Financial Overview</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Status</p>
                        <p className="text-[11px] font-bold text-green-600 flex items-center gap-1 justify-end">Verified Partner <CheckCircle2 className="w-3 h-3" /></p>
                    </div>
                </div>

                {/* Primary Wallet Card */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary shadow-xl shadow-primary/20 rounded-[--radius] p-6 text-primary-foreground relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/15 transition-all" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-white/20 rounded-lg"><Wallet className="w-5 h-5 text-white" /></div>
                            <span className="text-[10px] font-black py-1 px-2 border border-white/30 rounded-full tracking-widest uppercase">Available now</span>
                        </div>
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Settled Balance</p>
                        <h2 className="text-4xl font-black mt-1 flex items-baseline gap-1">
                            <span className="text-xl font-medium opacity-60">₹</span>
                            {(beautician?.walletBalance || 12450).toLocaleString()}
                        </h2>
                        <Button className="mt-8 w-full bg-white text-primary hover:bg-white/90 rounded-[--radius] h-11 text-[11px] font-black uppercase tracking-widest shadow-sm">
                            Instant Withdrawal <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                        </Button>
                    </div>
                </motion.div>

                {/* Earnings Distribution */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card border border-border/50 rounded-[--radius] p-4 flex flex-col justify-between shadow-sm">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                            Today
                        </p>
                        <p className="text-xl font-black text-foreground">₹3,498</p>
                    </div>
                    <div className="bg-card border border-border/50 rounded-[--radius] p-4 flex flex-col justify-between shadow-sm">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                            This Month
                        </p>
                        <p className="text-xl font-black text-foreground">₹45,230</p>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-tight">Recent Activity</h3>
                        </div>
                        <button className="text-[10px] font-black text-primary uppercase flex items-center gap-1 opacity-70 hover:opacity-100">See All <ChevronRight className="w-3 h-3" /></button>
                    </div>

                    <div className="bg-card border border-border/50 rounded-[--radius] shadow-sm divide-y divide-border/30 overflow-hidden">
                        {mockTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 bg-muted/5 hover:bg-muted/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${tx.type === "credit" ? "bg-green-500/5 border-green-500/10 text-green-600" : "bg-destructive/5 border-destructive/10 text-destructive"}`}>
                                        {tx.type === "credit" ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[11px] font-bold text-foreground leading-tight">{tx.label}</p>
                                        <p className="text-[9px] text-muted-foreground font-medium">{tx.date} • {tx.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-[12px] font-black ${tx.type === "credit" ? "text-green-600" : "text-destructive"}`}>
                                        {tx.type === "credit" ? "+" : "-"} ₹{tx.amount.toLocaleString()}
                                    </p>
                                    <p className="text-[8px] font-black text-muted-foreground uppercase opacity-40">Success</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckCircle2 = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export default EarningsPage;

