import { useState, useRef, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Star, Clock, ShieldCheck, Plus, Minus,
  Calendar, ChevronRight, ShoppingCart,
  Heart, Share2, Check, Timer, Sparkles, Camera,
  UserCheck
} from "lucide-react";
import { Button } from "@/modules/user/components/ui/button";
import { useUserModuleData } from "@/modules/user/contexts/UserModuleDataContext";
import { useGenderTheme } from "@/modules/user/contexts/GenderThemeContext";
import { useCart } from "@/modules/user/contexts/CartContext";
import { useAuth } from "@/modules/user/contexts/AuthContext";
import { useWishlist } from "@/modules/user/contexts/WishlistContext";
import FloatingCart from "@/modules/user/components/salon/FloatingCart";
import ExpressCheckout from "@/modules/user/components/salon/ExpressCheckout";
import { shareContent } from "@/modules/user/lib/utils";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gender } = useGenderTheme();
  const { addToCart, setIsCartOpen, selectedSlot: globalSlot, setSelectedSlot: setGlobalSlot } = useCart();
  const { isLoggedIn, setIsLoginModalOpen } = useAuth();
  const { services, providers: mockProviders } = useUserModuleData();
  const service = services.find((s) => s.id === id);

  const [qty, setQty] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isFav = isInWishlist(id);
  const [addedToCart, setAddedToCart] = useState(false);
  const stepsRef = useRef(null);

  // Filter providers based on the service category/type
  const availableProviders = useMemo(() => {
    if (!service) return [];
    return mockProviders.filter(p => p.specialties.includes(service.serviceType));
  }, [service]);

  useEffect(() => {
    if (availableProviders.length > 0 && !selectedProvider) {
      setSelectedProvider(availableProviders[0]);
    }
  }, [availableProviders, selectedProvider]);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Service not found</p>
      </div>
    );
  }

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      key: d.toISOString().split("T")[0],
      isToday: i === 0,
    };
  });

  const slots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
  const discountPercent = service.originalPrice
    ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!selectedDate || !selectedSlot) {
      alert("Please select a date and time slot first!");
      return;
    }

    addToCart({
      ...service,
      price: service.price * qty,
    });

    // Also update global slot if not set
    setGlobalSlot({
      date: selectedDate,
      time: selectedSlot,
      provider: selectedProvider
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBookingAction = () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    handleAddToCart();
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 lg:h-[420px]">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center backdrop-blur-xl"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => toggleWishlist(service)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center backdrop-blur-xl"
            >
              <Heart className={`w-5 h-5 transition-all ${isFav ? "fill-red-500 text-red-500 scale-110" : "text-foreground"}`} />
            </button>
            <button
              onClick={() => shareContent({
                title: service.name,
                text: `Check out this ${service.name} at Styling with Muskan!`,
                url: window.location.href,
              })}
              className="w-10 h-10 rounded-full glass flex items-center justify-center backdrop-blur-xl"
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-6 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
          >
            {discountPercent}% OFF
          </motion.div>
        )}
      </div>

      <div className="px-4 md:px-8 lg:px-0 max-w-4xl mx-auto -mt-10 relative z-10">
        {/* ===== SERVICE INFO CARD ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-5 md:p-6 shadow-elevated"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold ${gender === "women" ? "font-display" : "font-heading-men"}`}>
                {service.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {service.rating}
                </span>
                <span>({service.reviews} reviews)</span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" /> {service.duration}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl md:text-3xl font-bold text-primary">₹{service.price.toLocaleString()}</p>
              {service.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">₹{service.originalPrice.toLocaleString()}</p>
              )}
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{service.description}</p>

          {/* What's Included */}
          <div className="mt-5">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> What's Included
            </h3>
            <div className="flex flex-wrap gap-2">
              {service.includes.map((item) => (
                <span
                  key={item}
                  className="text-xs px-3 py-1.5 rounded-full bg-accent text-accent-foreground flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Verified & Certified Professional</span>
          </div>
        </motion.div>

        {/* ===== STEPS WE FOLLOW ===== */}
        {service.steps && service.steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5"
          >
            <h3 className={`font-semibold text-base mb-4 px-1 flex items-center gap-2 ${gender === "women" ? "font-display" : "font-heading-men"}`}>
              <Timer className="w-5 h-5 text-primary" />
              Steps We Follow
            </h3>

            {/* Steps Scroll */}
            <div ref={stepsRef} className="flex gap-4 overflow-x-auto hide-scrollbar pb-3 px-1">
              {service.steps.map((step, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 w-20 md:w-24 transition-all duration-300 ${activeStep === idx ? "scale-105" : "opacity-70"}`}
                >
                  {/* Rounded Image */}
                  <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-[3px] transition-all duration-300 ${activeStep === idx
                    ? "border-primary glow-primary shadow-lg"
                    : "border-border"
                    }`}>
                    <img
                      src={step.image}
                      alt={step.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Step Number Overlay */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all ${activeStep === idx ? "bg-primary/20" : "bg-background/30"
                      }`}>
                      <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${activeStep === idx
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/80 text-foreground"
                        }`}>
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] md:text-xs text-center font-medium leading-tight ${activeStep === idx ? "text-primary" : "text-muted-foreground"
                    }`}>
                    {step.name}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Active Step Detail */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="glass-strong rounded-xl p-4 mt-2 flex items-center gap-4"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                  <img
                    src={service.steps[activeStep].image}
                    alt={service.steps[activeStep].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Step {activeStep + 1}
                    </span>
                    <h4 className="font-semibold text-sm">{service.steps[activeStep].name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {service.steps[activeStep].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Step Progress Bar */}
            <div className="flex items-center gap-1 mt-3 px-1">
              {service.steps.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={`h-1 rounded-full flex-1 cursor-pointer transition-all duration-300 ${idx <= activeStep ? "bg-primary" : "bg-border"
                    }`}
                  onClick={() => setActiveStep(idx)}
                  whileHover={{ scaleY: 2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== WORK GALLERY (Before/After) ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-6"
        >
          <h3 className={`font-semibold text-base mb-4 px-1 flex items-center gap-2 ${gender === "women" ? "font-display" : "font-heading-men"}`}>
            <Camera className="w-5 h-5 text-primary" />
            Work Gallery (Before/After)
          </h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 px-1">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex-shrink-0 w-[280px] space-y-3">
                <div className="relative h-40 rounded-2xl overflow-hidden group">
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 relative">
                      <img
                        src={`https://placehold.co/400x600/333/fff?text=Before+${item}`}
                        alt="Before"
                        className="w-full h-full object-cover grayscale"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase backdrop-blur-md">Before</div>
                    </div>
                    <div className="w-1/2 relative border-l-2 border-primary/50">
                      <img
                        src={`https://placehold.co/400x600/555/fff?text=After+${item}`}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shadow-lg">After</div>
                    </div>
                  </div>
                  {/* Overlay Polish */}
                  <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-2xl" />
                </div>
                <p className="text-[11px] text-muted-foreground font-medium px-1">Visible results after just one session of {service.name}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ===== QUANTITY & COST ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-5 glass-strong rounded-2xl p-4 md:p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-sm">Quantity</span>
              <p className="text-xs text-muted-foreground mt-0.5">Select number of sessions</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-9 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <motion.span
                key={qty}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="font-bold text-lg w-8 text-center"
              >
                {qty}
              </motion.span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price per session</span>
              <span>₹{service.price.toLocaleString()}</span>
            </div>
            {qty > 1 && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Quantity</span>
                <span>× {qty}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <span className="font-semibold">Total</span>
              <motion.span
                key={qty}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-xl font-bold text-primary"
              >
                ₹{(service.price * qty).toLocaleString()}
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* ===== PROFESSIONAL SELECTION ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 space-y-6"
        >
          {/* Provider Selection */}
          <div>
            <h3 className={`font-semibold text-base mb-4 px-1 flex items-center gap-2 ${gender === "women" ? "font-display" : "font-heading-men"}`}>
              <UserCheck className="w-5 h-5 text-primary" /> Choose Service Professional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-1">
              {availableProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedProvider?.id === provider.id
                    ? "border-primary bg-primary/5 shadow-md scale-102"
                    : "border-border glass-strong hover:border-primary/20"
                    }`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={provider.image} className="w-14 h-14 rounded-xl object-cover" alt={provider.name} />
                    {selectedProvider?.id === provider.id && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">{provider.name}</h4>
                    <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                      {provider.tag}
                    </span>
                    <div className="flex items-center gap-2 mt-1 opacity-60">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      <span className="text-[10px] font-bold">{provider.rating}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div className="glass-strong rounded-2xl p-5 border border-border/50">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Select Preferred Date
            </h3>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {dates.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setSelectedDate(d.key)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl text-center text-xs transition-all duration-200 min-w-[75px] border-2 ${selectedDate === d.key
                    ? "bg-primary text-white border-primary shadow-lg scale-105"
                    : "glass border-border hover:border-primary/30"
                    }`}
                >
                  <div className="font-bold">{d.label}</div>
                  <div className="mt-1 text-[10px] opacity-80">{d.date}</div>
                  {d.isToday && (
                    <div className={`text-[8px] font-black mt-1 uppercase ${selectedDate === d.key ? "text-white/90" : "text-primary"}`}>
                      Today
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Slot Picker */}
          <div className="glass-strong rounded-2xl p-5 border border-border/50">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Select Preferred Slot
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-2 py-3 rounded-xl text-[10px] font-bold text-center border-2 transition-all duration-200 ${selectedSlot === slot
                    ? "bg-primary text-white border-primary shadow-md scale-105"
                    : "glass border-border hover:border-primary/30"
                    }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== STICKY BOTTOM BAR ===== */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border p-4 z-40"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex-shrink-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
            <motion.p
              key={qty}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-xl md:text-2xl font-bold text-primary"
            >
              ₹{(service.price * qty).toLocaleString()}
            </motion.p>
          </div>
          <div className="flex items-center gap-2">
            {/* Add to Cart Button */}
            <Button
              variant="outline"
              onClick={handleAddToCart}
              className={`px-4 md:px-6 gap-2 rounded-xl border-2 transition-all duration-300 ${addedToCart
                ? "border-green-500 text-green-500 bg-green-500/10"
                : "border-primary text-primary hover:bg-primary/10"
                } ${(!selectedDate || !selectedSlot) ? "opacity-30 grayscale pointer-events-none" : ""}`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-4 h-4" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden md:inline">Add to Cart</span>
                </>
              )}
            </Button>

            {/* Continue / Book Now Button */}
            <Button
              onClick={handleBookingAction}
              className="px-6 md:px-8 glow-primary rounded-xl gap-2 h-11"
              disabled={(!selectedDate || !selectedSlot)}
            >
              SECURE SLOT <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <FloatingCart />
      <ExpressCheckout />
    </div>
  );
};

export default ServiceDetail;
