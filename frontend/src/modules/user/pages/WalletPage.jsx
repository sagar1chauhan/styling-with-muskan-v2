import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGenderTheme } from "@/modules/user/contexts/GenderThemeContext";
import { ArrowLeft, Wallet, Plus, History, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/modules/user/components/ui/button";

const transactions = [
    { id: 1, title: "Cashback Received", date: "24 Feb, 2026", amount: 150, type: "credit" },
    { id: 2, title: "Service Payment - Gold Facial", date: "20 Feb, 2026", amount: -1499, type: "debit" },
    { id: 3, title: "Added to Wallet", date: "15 Feb, 2026", amount: 2000, type: "credit" },
];

const WalletPage = () => {
    const navigate = useNavigate();
    const { gender } = useGenderTheme();

    return (
        <div className="min-h-screen bg-background pb-8">
            {/* Header */}
            <div className="sticky top-0 z-30 glass-strong border-b border-border px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className={`text-lg font-semibold ${gender === "women" ? "font-display" : "font-heading-men"}`}>My Wallet</h1>
            </div>

            <div className="px-4 max-w-2xl mx-auto mt-6 space-y-6">
                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-[32px] p-8 text-white shadow-2xl"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))' }}
                >
                    <div className="relative z-10">
                        <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Available Balance</p>
                        <h2 className="text-5xl font-black mt-2">₹651</h2>

                        <div className="flex gap-3 mt-8">
                            <Button className="bg-white text-primary hover:bg-white/90 rounded-2xl px-6 h-12 font-bold gap-2">
                                <Plus className="w-5 h-5" /> Add Money
                            </Button>
                        </div>
                    </div>

                    {/* Decorative Circles */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-strong rounded-2xl p-4 border border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Cashback</p>
                        <p className="text-xl font-bold text-green-600">₹450</p>
                    </div>
                    <div className="glass-strong rounded-2xl p-4 border border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Points Earned</p>
                        <p className="text-xl font-bold text-primary">1,240</p>
                    </div>
                </div>

                {/* Transactions */}
                <div>
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" /> Transaction History
                    </h3>
                    <div className="space-y-3">
                        {transactions.map((t, i) => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-strong rounded-2xl p-4 flex items-center justify-between border border-border/50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        <TrendingUp className={`w-5 h-5 ${t.type === 'debit' ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{t.title}</p>
                                        <p className="text-[10px] text-muted-foreground">{t.date}</p>
                                    </div>
                                </div>
                                <p className={`font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-foreground'}`}>
                                    {t.type === 'credit' ? '+' : ''}₹{Math.abs(t.amount)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
