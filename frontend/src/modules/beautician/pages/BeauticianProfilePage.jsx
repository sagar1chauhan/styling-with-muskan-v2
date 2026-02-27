import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, Star, Shield, FileText, Landmark, LogOut, ChevronRight, Wifi, WifiOff, Settings, CreditCard, Award, Moon, Sun } from "lucide-react";
import { useBeauticianAuth } from "@/modules/beautician/contexts/BeauticianAuthContext";
import { useGenderTheme as useTheme } from "@/modules/user/contexts/GenderThemeContext";
import { Button } from "@/modules/user/components/ui/button";

const BeauticianProfilePage = () => {
    const navigate = useNavigate();
    const { beautician, logout, toggleOnline } = useBeauticianAuth();
    const { darkMode, toggleDarkMode } = useTheme();

    const menuItems = [
        { label: "Earnings & Wallet", icon: CreditCard, path: "/beautician/earnings", sub: "View revenue & withdraw funds" },
        { label: "Booking History", icon: FileText, path: "/beautician/history", sub: "Review past assignments" },
        { label: "Verified Documents", icon: Shield, sub: "KYC & Certifications" },
        { label: "Bank Account", icon: Landmark, sub: beautician?.documents?.bankDetails?.bankName || "Link account" },
        { label: "Settings", icon: Settings, sub: "Notification & app preferences" },
    ];

    return (
        <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background min-h-screen pb-24">
            <div className="max-w-xl mx-auto p-4 space-y-6">
                {/* Profile Header */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border/50 rounded-[--radius] p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <button onClick={toggleOnline}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${beautician?.isOnline
                                ? "bg-green-500/5 border-green-500/20 text-green-600"
                                : "bg-muted border-border text-muted-foreground"
                                }`}>
                            {beautician?.isOnline ? <><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online</> : <><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" /> Offline</>}
                        </button>
                    </div>

                    <div className="flex flex-col items-center pt-2">
                        <div className="w-20 h-20 rounded-full bg-primary/5 border-2 border-primary/10 flex items-center justify-center p-1 mb-4">
                            <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black italic">
                                {beautician?.name?.[0] || "B"}
                            </div>
                        </div>
                        <h2 className="text-lg font-black text-foreground tracking-tight">{beautician?.name || "Professional Partner"}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-[10px] text-amber-500 font-black bg-amber-500/5 px-2 py-0.5 rounded-sm border border-amber-500/10"><Star className="w-3 h-3 fill-amber-500" /> {beautician?.rating || "4.8"}</span>
                            <span className="text-[10px] text-primary font-black uppercase tracking-tighter bg-primary/5 px-2 py-0.5 rounded-sm border border-primary/10 flex items-center gap-1"><Award className="w-3 h-3" /> PRO TIER</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium mt-3 flex items-center gap-3">
                            <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> +91 {beautician?.phone || "—"}</span>
                            {beautician?.email && <><span className="opacity-20">|</span><span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {beautician.email}</span></>}
                        </p>
                    </div>
                </motion.div>

                {/* Account Menu */}
                <div className="space-y-2">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Account Management</p>
                    <div className="bg-card border border-border/50 rounded-[--radius] shadow-sm overflow-hidden divide-y divide-border/30">
                        {menuItems.map((item, i) => (
                            <motion.button key={item.label} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                onClick={() => item.path && navigate(item.path)}
                                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/5 transition-all text-left group">
                                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                    <item.icon className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold text-foreground">{item.label}</p>
                                    <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{item.sub}</p>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Theme Preferences */}
                <div className="space-y-2">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-60">Display Preferences</p>
                    <div className="bg-card border border-border/50 rounded-[--radius] shadow-sm overflow-hidden p-4">
                        <button onClick={toggleDarkMode}
                            className="w-full flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 transition-colors">
                                    {darkMode ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-bold text-foreground">Dark Interface</p>
                                    <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{darkMode ? "Classic light mode for daylight" : "Deep violet theme for low light"}</p>
                                </div>
                            </div>
                            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${darkMode ? 'bg-primary' : 'bg-muted'}`}>
                                <motion.div animate={{ x: darkMode ? 20 : 0 }} className="w-3 h-3 rounded-full bg-white shadow-sm" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Logistics */}
                <div className="pt-2">
                    <Button onClick={() => { logout(); navigate("/beautician/login"); }}
                        variant="ghost" className="w-full h-11 rounded-[--radius] text-destructive hover:text-destructive hover:bg-destructive/5 font-black text-[10px] uppercase tracking-widest gap-2">
                        <LogOut className="w-3.5 h-3.5" /> TERMINATE SESSION
                    </Button>
                    <p className="text-center text-[8px] text-muted-foreground uppercase tracking-[0.2em] mt-8 opacity-40">Styling with Muskan v1.0.4</p>
                </div>
            </div>
        </div>
    );
};


export default BeauticianProfilePage;

