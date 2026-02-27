import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Calendar, Check, Navigation, Camera, ChevronRight, Shield, CheckCircle2 } from "lucide-react";
import { useBeauticianBookings } from "@/modules/beautician/contexts/BeauticianBookingContext";
import { Button } from "@/modules/user/components/ui/button";

const statusSteps = [
    { key: "accepted", label: "Accepted", icon: Check },
    { key: "travelling", label: "Travelling", icon: Navigation },
    { key: "arrived", label: "Arrived", icon: MapPin },
    { key: "in_progress", label: "In Progress", icon: Clock },
    { key: "completed", label: "Completed", icon: Check },
];

const BookingDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { bookings, updateBookingStatus, verifyOTP, addBeforeImages, addAfterImages, completeService } = useBeauticianBookings();
    const booking = bookings.find(b => b.id === id);
    const [otpInput, setOtpInput] = useState(["", "", "", ""]);
    const [otpError, setOtpError] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [showOTP, setShowOTP] = useState(false);
    const [showComplete, setShowComplete] = useState(false);

    if (!booking) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <h2 className="text-sm font-bold text-muted-foreground uppercase mb-2 text-[10px] tracking-widest font-black">Booking Not Found</h2>
            <Button onClick={() => navigate("/beautician/bookings")} variant="outline" className="h-9 px-6 rounded-[--radius] text-xs font-bold border-border">Back to List</Button>
        </div>
    );

    const currentIdx = statusSteps.findIndex(s => s.key === booking.status);

    const handleOtpChange = (idx, val) => {
        if (isNaN(val)) return;
        const newOtp = [...otpInput];
        newOtp[idx] = val.slice(-1);
        setOtpInput(newOtp);
        if (val && idx < 3) document.getElementById(`botp-${idx + 1}`)?.focus();
    };

    const handleVerifyOTP = () => {
        const entered = otpInput.join("");
        const result = verifyOTP(id, entered);
        if (!result) { setOtpError(true); setTimeout(() => setOtpError(false), 2000); }
        else setShowOTP(false);
    };

    const handleComplete = () => {
        completeService(id, feedback);
        setShowComplete(false);
    };

    const getNextAction = () => {
        switch (booking.status) {
            case "accepted": return { label: "Start Travelling", icon: Navigation, action: () => updateBookingStatus(id, "travelling") };
            case "travelling": return { label: "Verify OTP at Arrival", icon: Shield, action: () => setShowOTP(true) };
            case "in_progress": return { label: "Complete Job", icon: Check, action: () => setShowComplete(true) };
            default: return null;
        }
    };
    const nextAction = getNextAction();

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pb-32">
            {/* Minimalist Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary/10 transition-colors"><ArrowLeft className="w-4 h-4" /></button>
                    <div>
                        <h1 className="font-bold text-sm tracking-tight">#{booking.id.toUpperCase()}</h1>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{booking.bookingType}</p>
                    </div>
                </div>
                <span className="px-2 py-0.5 bg-primary/5 text-primary text-[9px] font-black uppercase rounded-sm border border-primary/10 tracking-widest">
                    {booking.status.replace("_", " ")}
                </span>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
                {/* Status Progression */}
                <div className="bg-card border border-border/50 rounded-[--radius] p-4 shadow-sm">
                    <h3 className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-5">Job Progression</h3>
                    <div className="flex items-center justify-between relative px-2">
                        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-muted z-0" />
                        {statusSteps.map((step, i) => {
                            const done = i <= currentIdx;
                            const active = i === currentIdx;
                            return (
                                <div key={step.key} className="relative z-10 flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? "bg-primary border-primary text-white" : "bg-card border-border text-muted-foreground"} ${active ? "ring-2 ring-primary/20 scale-110" : ""}`}>
                                        <step.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={`text-[8px] font-bold mt-2 uppercase tracking-tighter ${done ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Service Details */}
                <div className="bg-card border border-border/50 rounded-[--radius] p-4 shadow-sm space-y-4">
                    <h3 className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                        <Shield className="w-3 h-3 text-primary" /> Service Overview
                    </h3>
                    <div className="space-y-2">
                        {booking.services.map((s, i) => (
                            <div key={i} className="flex justify-between items-center bg-muted/20 p-2.5 rounded-[--radius] border border-border/30">
                                <div><p className="text-xs font-bold font-foreground">{s.name}</p><p className="text-[10px] text-muted-foreground font-medium">{s.duration}</p></div>
                                <p className="text-xs font-bold text-foreground">₹{s.price}</p>
                            </div>
                        ))}
                    </div>
                    <div className="pt-3 border-t border-border/50 flex justify-between items-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Total Earnings</p>
                        <p className="text-lg font-black text-primary">₹{booking.price}</p>
                    </div>
                </div>

                {/* Location & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card border border-border/50 rounded-[--radius] p-4 shadow-sm flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary flex-shrink-0"><Calendar className="w-4 h-4" /></div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Scheduled For</p>
                            <p className="text-xs font-bold">{booking.slot.date}</p>
                            <p className="text-[11px] font-semibold text-primary/70">{booking.slot.time}</p>
                        </div>
                    </div>
                    <div className="bg-card border border-border/50 rounded-[--radius] p-4 shadow-sm flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary flex-shrink-0"><MapPin className="w-4 h-4" /></div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Service Site</p>
                            <p className="text-xs font-bold leading-tight">{booking.address.houseNo}, {booking.address.area}</p>
                            {booking.address.landmark && <p className="text-[10px] opacity-60 font-medium tracking-tight">Landmark: {booking.address.landmark}</p>}
                        </div>
                    </div>
                </div>

                {/* Images Section */}
                {(booking.status === "in_progress" || booking.status === "completed") && (
                    <div className="bg-card border border-border/50 rounded-[--radius] p-4 shadow-sm">
                        <h3 className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-2"><Camera className="w-3 h-3 text-primary" /> Visual Documentation</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {["before", "after"].map(phase => (
                                <div key={phase} className="space-y-3">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">{phase} Service</p>
                                    <label className="block bg-muted/30 rounded-[--radius] border-2 border-dashed border-border p-5 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                                        <input type="file" accept="image/*" capture="environment" className="hidden"
                                            onChange={e => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const url = URL.createObjectURL(file);
                                                    phase === "before" ? addBeforeImages(id, [url]) : addAfterImages(id, [url]);
                                                }
                                            }} />
                                        <Camera className="w-5 h-5 mx-auto text-muted-foreground mb-1 group-hover:text-primary" />
                                        <span className="text-[9px] font-bold text-muted-foreground tracking-tighter uppercase">Snap Photo</span>
                                    </label>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {(phase === "before" ? booking.beforeImages : booking.afterImages).map((img, i) => (
                                            <div key={i} className="w-12 h-12 rounded-sm bg-muted overflow-hidden border border-border shadow-xs"><img src={img} className="w-full h-full object-cover" alt="" /></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* OTP Modal */}
            <AnimatePresence>
                {showOTP && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOTP(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-card border border-border rounded-[--radius] p-6 shadow-2xl z-10">
                            <h3 className="font-bold text-base text-center mb-1">Customer Verification</h3>
                            <p className="text-[10px] text-muted-foreground text-center mb-6 uppercase tracking-wider font-bold opacity-60">Enter 4-Digit Private OTP</p>
                            <div className="flex justify-center gap-2.5 mb-6">
                                {otpInput.map((d, i) => (
                                    <input key={i} id={`botp-${i}`} type="text" maxLength={1} value={d} onChange={e => handleOtpChange(i, e.target.value)}
                                        className={`w-11 h-14 text-center text-2xl font-bold bg-muted/30 border-2 rounded-[--radius] ${otpError ? "border-destructive animate-shake" : "border-border"} focus:border-primary focus:bg-card transition-all outline-none`} />
                                ))}
                            </div>
                            {otpError && <p className="text-destructive text-[10px] font-bold text-center mb-3 uppercase tracking-wider">Invalid security code</p>}
                            <Button onClick={handleVerifyOTP} className="w-full h-11 rounded-[--radius] font-bold text-sm bg-primary text-primary-foreground shadow-sm">Verify & Begin Service</Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Completion Feedback Modal */}
            <AnimatePresence>
                {showComplete && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowComplete(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-card border border-border rounded-[--radius] p-6 shadow-2xl z-10">
                            <h3 className="font-bold text-base text-center mb-4">Complete Work Order</h3>
                            <div className="space-y-1.5 mb-6">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-70 ml-1">Internal Notes</label>
                                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="How was the service? (Internal only)..."
                                    className="w-full h-24 px-4 py-3 rounded-[--radius] bg-muted/30 border border-border text-sm resize-none focus:ring-1 focus:ring-primary focus:bg-card outline-none transition-all" />
                            </div>
                            <Button onClick={handleComplete} className="w-full h-11 rounded-[--radius] font-bold text-sm bg-primary text-primary-foreground shadow-sm">Mark as Successfully Done</Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sticky Action Footer */}
            {nextAction && (
                <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-4 z-40">
                    <div className="max-w-xl mx-auto flex gap-3">
                        <Button onClick={nextAction.action} className="flex-1 h-12 rounded-[--radius] font-bold text-xs bg-primary text-primary-foreground shadow-sm gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99]">
                            {nextAction.label.toUpperCase()} <ChevronRight className="w-4 h-4 opacity-70" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDetailPage;

