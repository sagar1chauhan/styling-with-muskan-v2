import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGenderTheme } from "@/modules/user/contexts/GenderThemeContext";
import { ArrowLeft, Gift, Share2, Copy, Trophy, Users, Star } from "lucide-react";
import { Button } from "@/modules/user/components/ui/button";
import { shareContent } from "@/modules/user/lib/utils";

const ReferralPage = () => {
    const navigate = useNavigate();
    const { gender } = useGenderTheme();
    const referralCode = "MUSKAN450";

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(referralCode);
            alert("Referral code copied!");
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = referralCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert("Referral code copied!");
        }
    };

    return (
        <div className="min-h-screen bg-background pb-8">
            {/* Header */}
            <div className="sticky top-0 z-30 glass-strong border-b border-border px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className={`text-lg font-semibold ${gender === "women" ? "font-display" : "font-heading-men"}`}>Refer & Earn</h1>
            </div>

            <div className="px-4 max-w-2xl mx-auto mt-6 space-y-6">
                {/* Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong rounded-[32px] p-8 text-center border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent"
                >
                    <div className="w-20 h-20 rounded-3xl bg-gradient-theme mx-auto mb-6 flex items-center justify-center shadow-xl rotate-12">
                        <Gift className="w-10 h-10 text-white -rotate-12" />
                    </div>
                    <h2 className="text-2xl font-bold font-display">Give ₹100, Get ₹150</h2>
                    <p className="text-sm text-muted-foreground mt-2 px-4">
                        Invite your friends to try Styling with Muskan. They get ₹100 off their first booking, and you get ₹150 in your wallet!
                    </p>

                    <div className="mt-8 p-4 rounded-2xl bg-accent border border-dashed border-primary/30 flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Your Referral Code</p>
                            <p className="text-xl font-black text-primary tracking-wider">{referralCode}</p>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm active:scale-95 transition-all text-primary"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                    </div>

                    <Button
                        onClick={() => {
                            const shareRow = `Hey! Use my referral code ${referralCode} to get ₹100 off on your first booking at Styling with Muskan. Download now!`;
                            shareContent({
                                title: "Refer & Earn - Styling with Muskan",
                                text: shareRow,
                                url: window.location.origin
                            });
                        }}
                        className="w-full h-14 rounded-2xl mt-6 text-base font-bold shadow-lg shadow-primary/20 gap-2"
                    >
                        <Share2 className="w-5 h-5" /> SHARE WITH FRIENDS
                    </Button>
                </motion.div>

                {/* How it works */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold ml-1">How it works</h3>
                    <div className="space-y-3">
                        {[
                            { icon: Share2, title: "Share your code", desc: "Send your unique code to friends" },
                            { icon: Star, title: "Friend books a service", desc: "They get ₹100 instant discount" },
                            { icon: Trophy, title: "You get rewarded", desc: "₹150 added to your wallet" },
                        ].map((step, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl glass-strong border border-border/50">
                                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary flex-shrink-0">
                                    <step.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{step.title}</p>
                                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Referral History Summary */}
                <div className="glass-strong rounded-2xl p-5 border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold">Total Referrals</p>
                            <p className="text-xl font-black">12</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Earned So Far</p>
                        <p className="text-xl font-black text-green-600">₹1,800</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralPage;
