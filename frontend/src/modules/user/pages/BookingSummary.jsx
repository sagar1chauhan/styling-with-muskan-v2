import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Clock, Tag, ChevronRight, CheckCircle2, ShoppingBag } from "lucide-react";
import { Button } from "@/modules/user/components/ui/button";
import { Input } from "@/modules/user/components/ui/input";
import { useGenderTheme } from "@/modules/user/contexts/GenderThemeContext";
import { useCart } from "@/modules/user/contexts/CartContext";
import { useAuth } from "@/modules/user/contexts/AuthContext";
import { useBookings } from "@/modules/user/contexts/BookingContext";

const BookingSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const checkoutType = searchParams.get('type');

  const { gender } = useGenderTheme();
  const { cartItems, updateQuantity, clearCart, totalPrice, totalSavings, isCartOpen, setIsCartOpen, selectedSlot, getGroupedItems } = useCart();
  const { user } = useAuth();
  const { addBooking } = useBookings();

  const allGroups = getGroupedItems();
  const displayGroups = checkoutType && allGroups[checkoutType] ? { [checkoutType]: allGroups[checkoutType] } : allGroups;
  const displayItems = Object.values(displayGroups).flatMap(g => g?.items || []);

  const displayTotalPrice = displayItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  const displayTotalSavings = displayItems.reduce((total, item) => {
    if (item.originalPrice) {
      return total + ((item.originalPrice - item.price) * (item.quantity || 1));
    }
    return total;
  }, 0);

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const discount = couponApplied ? Math.round(displayTotalPrice * 0.1) : 0;
  const finalTotal = displayTotalPrice - discount;

  const handlePay = () => {
    navigate("/payment", {
      state: {
        discount,
        finalTotal,
        totalSavings: displayTotalSavings,
        checkoutType
      }
    });
  };

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr === "Today") return "Today";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-14 h-14 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-display font-bold text-center"
        >
          Booking Confirmed! 🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-muted-foreground text-sm text-center"
        >
          Your beautician will be assigned shortly for {getFormattedDate(selectedSlot?.date)} at {selectedSlot?.time}
        </motion.p>
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground">Your cart is empty</p>
        <Button onClick={() => navigate("/home")} className="mt-4">Go Back Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-strong border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className={`text-lg font-semibold ${gender === "women" ? "font-display" : "font-heading-men"}`}>Booking Summary</h1>
      </div>

      <div className="px-4 md:px-8 lg:px-0 max-w-2xl mx-auto mt-4 space-y-4">
        {/* Address */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-5 border border-border/50">
          <div className="flex items-center gap-2 text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" /> Service Address
          </div>
          {user?.address ? (
            <div>
              <p className="font-bold text-sm uppercase">{user.address.type}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {user.address.houseNo}, {user.address.area}
                {user.address.landmark && <span className="block italic text-xs mt-0.5 opacity-60">Near {user.address.landmark}</span>}
              </p>
            </div>
          ) : (
            <p className="text-sm text-destructive">No address selected</p>
          )}
        </motion.div>

        {/* Date & Time */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-strong rounded-2xl p-5 border border-border/50 flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Selected Slot</p>
              <p className="text-sm font-bold mt-1 text-primary">{getFormattedDate(selectedSlot?.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-border pl-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Timing & Professional</p>
              <p className="text-sm font-bold mt-1 text-primary">
                {selectedSlot?.time}
                <span className="block text-[10px] text-muted-foreground mt-0.5">By {selectedSlot?.provider?.name || 'Trained Professional'}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Grouped Services */}
        <div className="space-y-6">
          {Object.entries(displayGroups).map(([type, group]) => (
            <div key={type} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  {group.label}
                </h3>
                <span className="text-[10px] font-bold text-primary/60">
                  Section Subtotal: ₹{group.subtotal.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3">
                {group.items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="glass-strong rounded-2xl p-4 border border-border/50 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-accent flex-shrink-0 border border-border/50">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate">{item.name}</h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                          Quantity: {item.quantity} · {item.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                        {item.originalPrice && (
                          <p className="text-[9px] text-muted-foreground line-through opacity-60">
                            ₹{(item.originalPrice * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-strong rounded-2xl p-5 border border-border/50">
          <div className="flex items-center gap-2 text-xs font-bold mb-4 uppercase tracking-wider text-muted-foreground">
            <Tag className="w-4 h-4 text-primary" /> Offers & Benefits
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="flex-1 h-12 rounded-xl bg-accent border-none text-base font-medium"
            />
            <Button
              className="h-12 rounded-xl px-6 font-bold"
              variant={couponApplied ? "secondary" : "default"}
              onClick={() => coupon && setCouponApplied(true)}
              disabled={!coupon}
            >
              {couponApplied ? "Applied ✓" : "Apply"}
            </Button>
          </div>
        </motion.div>

        {/* Price Breakdown */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-strong rounded-2xl p-5 border border-border/50 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Service Total</span>
            <span className="font-bold">₹{displayTotalPrice.toLocaleString()}</span>
          </div>
          {displayTotalSavings > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">Auto Discount Applied</span>
              <span className="text-green-600 font-bold">-₹{displayTotalSavings.toLocaleString()}</span>
            </div>
          )}
          {couponApplied && (
            <div className="flex justify-between text-sm">
              <span className="text-primary font-medium">Coupon Discount (10%)</span>
              <span className="text-primary font-bold">-₹{discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Taxes & Fees</span>
            <span className="font-bold">₹0</span>
          </div>
          <div className="pt-3 border-t border-dashed border-border flex justify-between items-center text-lg font-black">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Total Payable</span>
              <span className="text-primary mt-1">₹{finalTotal.toLocaleString()}</span>
            </div>
            {displayTotalSavings + discount > 0 && (
              <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg">
                SAVED ₹{displayTotalSavings + discount}
              </div>
            )}
          </div>
        </motion.div>

        <p className="text-[10px] text-muted-foreground text-center font-medium bg-accent/50 py-3 rounded-xl border border-border/30">
          Safe & Hygienic services · 100% Satisfaction Guarantee · Cancel anytime
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border p-5 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Grand Total</p>
            <p className="text-2xl font-black text-primary leading-none">₹{finalTotal.toLocaleString()}</p>
          </div>
          <Button onClick={handlePay} className="flex-1 h-14 rounded-2xl bg-gradient-theme text-white text-lg font-bold shadow-xl shadow-primary/20 gap-2 group border-none">
            PROCEED TO PAY
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-5 h-5" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;

