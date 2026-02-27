import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, ShieldCheck, ChevronRight } from "lucide-react";
import { useGenderTheme } from "@/modules/user/contexts/GenderThemeContext";
import { useAuth } from "@/modules/user/contexts/AuthContext";
import { Button } from "@/modules/user/components/ui/button";

const LoginModal = () => {
    const { gender } = useGenderTheme();
    const { isLoggedIn, isLoginModalOpen, setIsLoginModalOpen, login } = useAuth();
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Profile Setup
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    // Reset modal state when closed
    useEffect(() => {
        if (!isLoginModalOpen) {
            setStep(1);
            setPhone("");
            setOtp(["", "", "", ""]);
        }
    }, [isLoginModalOpen]);

    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        if (phone.length === 10) setStep(2);
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }

        if (newOtp.every(v => v !== "")) {
            setTimeout(() => {
                setStep(3); // Move to Profile Setup
            }, 500);
        }
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        login({ phone, name, referralCode });
        setIsLoginModalOpen(false);
    };

    if (!isLoginModalOpen || isLoggedIn) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-10 sm:items-center sm:p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsLoginModalOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-md bg-background rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                >
                    {/* Fixed Header */}
                    <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-background z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-theme flex items-center justify-center shadow-lg">
                                <ShieldCheck className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold font-display uppercase tracking-tight">Styling with Muskan</h2>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Salon & Spa at Home</p>
                            </div>
                        </div>
                        <button onClick={() => setIsLoginModalOpen(false)} className="p-2 rounded-full hover:bg-accent transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto hide-scrollbar p-6">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="phone-step"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold font-display">Log in / Sign up</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Enter your mobile number to proceed</p>
                                    </div>

                                    <form id="phone-form" onSubmit={handlePhoneSubmit} className="space-y-6">
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r pr-3 border-border">
                                                <span className="text-sm font-bold">🇮🇳 +91</span>
                                            </div>
                                            <input
                                                autoFocus
                                                type="tel"
                                                maxLength={10}
                                                placeholder="Mobile Number*"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                                className="w-full h-14 pl-24 pr-4 rounded-2xl bg-accent border-none text-base focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            />
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <input type="checkbox" id="terms" defaultChecked className="mt-1 accent-primary rounded" />
                                            <label htmlFor="terms" className="text-[10px] text-muted-foreground leading-tight">
                                                I want to receive newsletters, promotions, offers and event updates via Email, SMS, RCS, and WhatsApp.
                                            </label>
                                        </div>

                                        <p className="text-center text-[10px] text-muted-foreground">
                                            By proceeding, you agree to Muskan's <span className="text-primary hover:underline cursor-pointer">Terms & Conditions</span>
                                        </p>
                                    </form>
                                </motion.div>
                            ) : step === 2 ? (
                                <motion.div
                                    key="otp-step"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold font-display">Verify Mobile</h3>
                                        <p className="text-xs text-muted-foreground mt-1">We have sent OTP to {phone}</p>
                                    </div>

                                    <div className="flex justify-center gap-3 mb-8">
                                        {otp.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                id={`otp-${idx}`}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                className="w-12 h-14 text-center text-xl font-bold bg-accent rounded-xl border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                            />
                                        ))}
                                    </div>

                                    <div className="text-center">
                                        {timer > 0 ? (
                                            <p className="text-xs text-muted-foreground">Resend OTP in {timer}s</p>
                                        ) : (
                                            <button onClick={() => setTimer(30)} className="text-xs font-bold text-primary hover:underline">
                                                RESEND OTP
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="profile-step"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold font-display">Complete Profile</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Just a few more details to get started</p>
                                    </div>
                                    <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Full Name*</label>
                                            <input
                                                autoFocus
                                                type="text"
                                                required
                                                placeholder="e.g. Muskan Sharma"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full h-12 px-4 rounded-xl bg-accent border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Referral Code (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. SAVE100"
                                                value={referralCode}
                                                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                                className="w-full h-12 px-4 rounded-xl bg-accent border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium tracking-wider"
                                            />
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Fixed Footer */}
                    <div className="p-6 bg-background border-t border-border">
                        {step === 1 && (
                            <Button
                                form="phone-form"
                                type="submit"
                                disabled={phone.length !== 10}
                                className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 bg-black text-white hover:bg-black/90"
                            >
                                CONTINUE
                            </Button>
                        )}
                        {step === 3 && (
                            <Button
                                form="profile-form"
                                type="submit"
                                disabled={!name.trim()}
                                className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 bg-black text-white hover:bg-black/90 flex items-center justify-center gap-2"
                            >
                                GET STARTED <ChevronRight className="w-5 h-5" />
                            </Button>
                        )}
                        {step === 2 && (
                            <div className="h-14 flex items-center justify-center">
                                <p className="text-[11px] text-muted-foreground font-medium italic">Auto-verifying your OTP...</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginModal;
