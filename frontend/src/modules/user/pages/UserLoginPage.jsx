import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/user/contexts/AuthContext";
import { api } from "@/modules/user/lib/api";
import { Button } from "@/modules/user/components/ui/button";

const UserLoginPage = () => {
    const navigate = useNavigate();
    const { isLoggedIn, loginWithOtp } = useAuth();
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [timer, setTimer] = useState(30);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isLoggedIn) navigate("/profile", { replace: true });
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        let id;
        if (step === 2 && timer > 0) id = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(id);
    }, [step, timer]);

    const request = async () => {
        setError("");
        const res = await api.requestOtp(phone, "login");
        return res;
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        if (phone.length !== 10) return;
        try {
            await request();
            setStep(2);
            setTimer(30);
        } catch (e) {
            setError(e.message || "Failed to send OTP");
        }
    };

    const handleResend = async () => {
        try {
            await request();
            setTimer(30);
        } catch (e) {
            setError(e.message || "Failed to resend OTP");
        }
    };

    const handleOtpChange = (i, v) => {
        if (isNaN(v)) return;
        const n = [...otp];
        n[i] = v.slice(-1);
        setOtp(n);
        if (v && i < 3) document.getElementById(`login-otp-${i + 1}`)?.focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const code = otp.join("");
        try {
            await loginWithOtp({ phone, otp: code, intent: "login" });
            navigate("/profile", { replace: true });
        } catch (ex) {
            setError(ex.message || "Verification failed");
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-lg bg-white/60 backdrop-blur-xl rounded-[32px] border border-white shadow-2xl p-8 relative">
                <button onClick={() => navigate("/home")} className="absolute top-4 left-4 w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-theme flex items-center justify-center shadow-lg mb-3">
                        <ShieldCheck className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-black">Login</h1>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Enter mobile then OTP</p>
                </div>
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form key="login-step-phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handlePhoneSubmit} className="space-y-6">
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 border-r pr-3 text-sm font-bold text-gray-500">+91</div>
                                <input type="tel" autoFocus maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="Mobile Number*" className="w-full h-14 pl-20 pr-4 rounded-2xl bg-accent focus:bg-white focus:ring-2 focus:ring-primary/20" />
                            </div>
                            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
                            <Button type="submit" disabled={phone.length !== 10} className="w-full h-12 rounded-2xl font-bold">
                                Send OTP <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                New here? <button type="button" className="text-primary font-bold hover:underline" onClick={() => navigate("/register")}>Register</button>
                            </p>
                        </motion.form>
                    ) : (
                        <motion.form key="login-step-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerify} className="space-y-6">
                            <div className="flex justify-center gap-3">
                                {otp.map((d, i) => (
                                    <input key={i} id={`login-otp-${i}`} type="text" maxLength={1} value={d} onChange={(e) => handleOtpChange(i, e.target.value)} className="w-12 h-14 text-center text-xl font-bold bg-accent rounded-xl border-2 border-transparent focus:border-primary" />
                                ))}
                            </div>
                            {timer > 0 ? (
                                <p className="text-xs text-center text-muted-foreground">Resend in {timer}s</p>
                            ) : (
                                <button type="button" className="text-xs font-bold text-primary hover:underline block mx-auto" onClick={handleResend}>
                                    RESEND OTP
                                </button>
                            )}
                            {error && <p className="text-sm font-semibold text-red-600 text-center">{error}</p>}
                            <Button type="submit" disabled={otp.some(d => !d)} className="w-full h-12 rounded-2xl font-bold">
                                Verify & Login
                            </Button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UserLoginPage;

