import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft, ShieldCheck, CreditCard, Wallet,
    Smartphone, Landmark, CheckCircle2, ChevronRight,
    Lock, Sparkles
} from "lucide-react";
import { useCart } from "@/modules/user/contexts/CartContext";
import { useBookings } from "@/modules/user/contexts/BookingContext";
import { useAuth } from "@/modules/user/contexts/AuthContext";
import { useGenderTheme } from "@/modules/user/contexts/GenderThemeContext";
import { useUserModuleData } from "@/modules/user/contexts/UserModuleDataContext";
import { Button } from "@/modules/user/components/ui/button";

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const passedState = location.state;
    const { gender } = useGenderTheme();
    const { cartItems, totalPrice, totalSavings, selectedSlot, clearCart, clearGroup, getGroupedItems } = useCart();
    const { user } = useAuth();
    const { addBooking } = useBookings();
    const { categories } = useUserModuleData();

    const [selectedMethod, setSelectedMethod] = useState("upi");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Calculate final total (including state from summary)
    const finalTotal = passedState?.finalTotal || totalPrice;
    const checkoutType = passedState?.checkoutType;
    const allGroups = getGroupedItems();
    const displayGroups = checkoutType && allGroups[checkoutType] ? { [checkoutType]: allGroups[checkoutType] } : allGroups;
    const displayItems = Object.values(displayGroups).flatMap(g => g?.items || []);

    const paymentMethods = [
        { id: "upi", name: "UPI (GPay, PhonePe, Paytm)", icon: Smartphone, color: "text-purple-600", bg: "bg-purple-100" },
        { id: "card", name: "Credit / Debit Card", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-100" },
        { id: "wallet", name: "Wallets", icon: Wallet, color: "text-orange-600", bg: "bg-orange-100" },
        { id: "netbanking", name: "Net Banking", icon: Landmark, color: "text-green-600", bg: "bg-green-100" },
        { id: "cod", name: "Pay After Service", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10" }
    ];


    const handlePayment = () => {
        setIsProcessing(true);

        const advanceAmount = passedState?.advanceAmount || 0;
        const remainingAmount = passedState?.remainingAmount || finalTotal;
        const isPartiallyPaid = passedState?.isPartiallyPaid || false;

        // Simulate payment process
        setTimeout(() => {
            const bookingData = {
                items: displayItems.map(item => ({
                    ...item,
                    // strip large image data to save storage
                    image: typeof item.image === 'string' && item.image.startsWith('data:') ? '' : item.image,
                    steps: undefined,
                })),
                totalAmount: finalTotal,
                savings: totalSavings + (passedState?.discount || 0),
                bookingType: displayItems.some(item => {
                    const category = categories?.find(c => c.id === item.category);
                    return (category?.bookingType || item.bookingType || "").toLowerCase() === "instant";
                }) ? "instant" : "prebook",
                slot: selectedSlot,
                address: user?.address,
                customerName: user?.name || user?.phone || "Customer",
                paymentMethod: selectedMethod,
                paymentStatus: selectedMethod === 'cod' ? "Pay after service" : (isPartiallyPaid ? "Partially Paid" : "Paid"),
                prepaidAmount: selectedMethod === 'cod' ? 0 : (isPartiallyPaid ? advanceAmount : finalTotal),
                balanceAmount: selectedMethod === 'cod' ? finalTotal : (isPartiallyPaid ? remainingAmount : 0),
                status: "Pending"
            };

            addBooking(bookingData);
            setIsProcessing(false);
            setIsSuccess(true);

            // Navigate to bookings after success animation
            setTimeout(() => {
                if (checkoutType) {
                    clearGroup(checkoutType);
                } else {
                    clearCart();
                }
                navigate("/bookings");
            }, 3000);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6 relative"
                >
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg"
                    >
                        <ShieldCheck className="w-5 h-5" />
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                >
                    <h2 className="text-2xl font-display font-bold">Payment Successful! 🎉</h2>
                    <p className="mt-2 text-muted-foreground text-sm max-w-[250px] mx-auto">
                        Your booking for {selectedSlot?.time} has been confirmed. Redirecting to My Bookings...
                    </p>
                </motion.div>

                <div className="mt-8 flex gap-2">
                    {[1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="w-2 h-2 rounded-full bg-primary/40"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="sticky top-0 z-30 glass-strong border-b border-border px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className={`text-lg font-semibold ${gender === "women" ? "font-display" : "font-heading-men"}`}>Payment</h1>
                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Select Payment Method</p>
                </div>
            </div>

            <div className="px-4 max-w-2xl mx-auto mt-6 space-y-6">
                {/* Amount Section */}
                <div className="glass-strong rounded-[2.5rem] p-8 border border-border/50 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Final Payable Amount</p>
                    <h2 className="text-4xl font-black text-primary">₹{finalTotal.toLocaleString()}</h2>

                    {totalSavings > 0 && (
                        <div className="mt-3 inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold border border-green-500/20">
                            <Sparkles className="w-3 h-3" /> TOTAL SAVINGS: ₹{totalSavings}
                        </div>
                    )}
                </div>

                {/* Secure Payment Badge */}
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-accent/30 py-2 rounded-xl">
                    <Lock className="w-3 h-3" /> SSL Secure & Encrypted Payment
                </div>

                {/* Methods List */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2">Payment Methods</h3>
                    {paymentMethods.map((method) => (
                        <motion.button
                            key={method.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${selectedMethod === method.id
                                ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
                                : "bg-accent/40 border-transparent hover:border-border"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${method.bg} flex items-center justify-center transition-transform duration-500 ${selectedMethod === method.id ? 'rotate-[360deg]' : ''}`}>
                                    <method.icon className={`w-6 h-6 ${method.color}`} />
                                </div>
                                <span className={`font-bold text-sm ${selectedMethod === method.id ? "text-primary" : "text-foreground"}`}>
                                    {method.name}
                                </span>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === method.id ? "border-primary bg-primary" : "border-muted-foreground/30"
                                }`}>
                                {selectedMethod === method.id && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Security Note */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex gap-3">
                        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                            <p className="text-[11px] font-bold text-amber-900 uppercase">100% Secure Payment</p>
                            <p className="text-[10px] text-amber-800/80 mt-1">
                                Your payment information is safe. We use world-class encryption to protect your data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border p-5 z-40">
                <div className="max-w-2xl mx-auto">
                    <Button
                        disabled={isProcessing}
                        onClick={handlePayment}
                        className="w-full h-15 rounded-2xl bg-gradient-theme text-white text-lg font-bold shadow-xl shadow-primary/20 gap-3 group relative overflow-hidden border-none"
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                                PROCESSING...
                            </div>
                        ) : (
                            <>
                                {passedState?.advanceAmount > 0 && selectedMethod !== 'cod'
                                    ? `PAY ADVANCE ₹${passedState.advanceAmount.toLocaleString()}`
                                    : `SECURELY PAY ₹${finalTotal.toLocaleString()}`
                                }
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                    <ChevronRight className="w-5 h-5 text-white" />
                                </div>
                            </>
                        )}

                        {/* Shimmer Effect */}
                        {!isProcessing && (
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "200%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                            />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;

