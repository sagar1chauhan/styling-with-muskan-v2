import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { useBeauticianAuth } from "@/modules/beautician/contexts/BeauticianAuthContext";
import { Button } from "@/modules/user/components/ui/button";

const BeauticianLoginPage = () => {
    const navigate = useNavigate();
    const { login, isLoggedIn, isRegistered, isApproved } = useBeauticianAuth();
    const [step, setStep] = useState("phone"); // phone, otp
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isLoggedIn && isApproved) navigate("/beautician/dashboard", { replace: true });
        else if (isLoggedIn && !isRegistered) navigate("/beautician/register", { replace: true });
    }, [isLoggedIn, isRegistered, isApproved, navigate]);

    const handleSendOtp = () => {
        if (phone.length === 10) {
            setIsLoading(true);
            setTimeout(() => {
                setStep("otp");
                setIsLoading(false);
            }, 1000);
        }
    };

    const handleVerifyOtp = () => {
        if (otp.join("").length === 4) {
            setIsLoading(true);
            setTimeout(() => {
                const isNew = login(phone);
                setIsLoading(false);
                if (isNew) navigate("/beautician/register");
                else navigate("/beautician/dashboard");
            }, 1000);
        }
    };

    const handleOtpChange = (idx, val) => {
        if (isNaN(val)) return;
        const newOtp = [...otp];
        newOtp[idx] = val.slice(-1);
        setOtp(newOtp);
        if (val && idx < 3) document.getElementById(`otp-${idx + 1}`)?.focus();
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background flex items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-8">
                {/* Logo/Header */}
                <div className="text-center">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="w-12 h-12 bg-primary rounded-[--radius] flex items-center justify-center mx-auto mb-4 shadow-sm shadow-primary/10">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </motion.div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Beautician Partner</h1>
                    <p className="text-[11px] text-muted-foreground mt-1.5 font-bold uppercase tracking-widest opacity-70">Empowering Professionals</p>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card p-6 border border-border rounded-[--radius] shadow-sm">
                    <AnimatePresence mode="wait">
                        {step === "phone" ? (
                            <motion.div key="phone" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Phone Number</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-foreground opacity-30">+91</span>
                                        <input type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                            placeholder="Enter 10-digit number"
                                            className="w-full h-11 pl-12 pr-4 bg-muted/30 border border-border rounded-[--radius] text-sm font-semibold focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none" />
                                    </div>
                                </div>
                                <Button onClick={handleSendOtp} disabled={phone.length !== 10 || isLoading}
                                    className="w-full h-11 bg-primary text-primary-foreground font-bold rounded-[--radius] text-sm shadow-sm hover:opacity-90 transition-opacity">
                                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Receive Verification Code"}
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div key="otp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: -10 }} exit={{ opacity: 0, x: -10 }} className="space-y-5">
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground">Code sent to <span className="text-foreground font-bold">+91 {phone}</span></p>
                                    <button onClick={() => setStep("phone")} className="text-[10px] text-primary font-bold mt-1 uppercase hover:underline">Change Number</button>
                                </div>
                                <div className="flex justify-center gap-2.5">
                                    {otp.map((digit, i) => (
                                        <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(i, e.target.value)}
                                            className="w-11 h-12 text-center text-xl font-bold bg-muted/30 border border-border rounded-[--radius] focus:ring-1 focus:ring-primary focus:border-primary focus:bg-card transition-all outline-none" />
                                    ))}
                                </div>
                                <Button onClick={handleVerifyOtp} disabled={otp.join("").length !== 4 || isLoading}
                                    className="w-full h-11 bg-primary text-primary-foreground font-bold rounded-[--radius] text-sm shadow-sm hover:opacity-90 transition-opacity">
                                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify & Log in"}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <p className="text-center text-[10px] text-muted-foreground tracking-wide font-medium">
                    By continuing, you agree to our <span className="text-primary font-bold cursor-pointer">Terms</span> & <span className="text-primary font-bold cursor-pointer">Privacy Policy</span>
                </p>

                <div className="text-center mt-4">
                    <button onClick={() => navigate("/")} className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-widest">
                        Looking for services? Customer App →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BeauticianLoginPage;

