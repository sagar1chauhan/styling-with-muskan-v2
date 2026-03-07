import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Check, ChevronRight, Star, MapPin, UserCheck, ShieldCheck } from "lucide-react";
import { useCart } from "@/modules/user/contexts/CartContext";
import { useGenderTheme } from "@/modules/user/contexts/GenderThemeContext";
import { Button } from "@/modules/user/components/ui/button";
import { useUserModuleData } from "@/modules/user/contexts/UserModuleDataContext";

const SlotSelectionModal = ({ isOpen, onClose, onSave }) => {
    const { selectedSlot, setSelectedSlot, cartItems } = useCart();
    const { gender } = useGenderTheme();
    const { providers: mockProviders, bookingTypeConfig, categories } = useUserModuleData();

    const [tempDate, setTempDate] = useState(selectedSlot?.date || null);
    const [tempSlot, setTempSlot] = useState(selectedSlot?.time || null);
    const [selectedProvider, setSelectedProvider] = useState(null);

    // Filter providers based on the items in cart (specialties)
    const availableProviders = useMemo(() => {
        const cartTypes = [...new Set(cartItems.map(item => item.serviceType))];
        return mockProviders.filter(p => cartTypes.some(type => p.specialties?.includes(type)));
    }, [cartItems]);

    useEffect(() => {
        if (isOpen) {
            setTempDate(selectedSlot?.date || null);
            setTempSlot(selectedSlot?.time || null);
            // Default to the "Best Rated" provider (p1)
            setSelectedProvider(availableProviders[0] || mockProviders[0]);
        }
    }, [isOpen, availableProviders]);

    const dates = useMemo(() => {
        let maxDays = 7; // Default

        // Find if cart has scheduled or instant items
        const hasScheduled = cartItems.some(item => {
            const cat = categories?.find(c => c.id === item.category);
            return (cat?.bookingType) === "scheduled";
        });

        // Config block defaults
        const schedConfig = bookingTypeConfig?.find(b => b.id === "scheduled");
        const instConfig = bookingTypeConfig?.find(b => b.id === "instant");

        if (hasScheduled) {
            maxDays = schedConfig?.maxAdvanceDays || 30;
        } else {
            // For Instant, take the max of allowedAdvanceDays array, default to 7
            let allowedArray = instConfig?.allowedAdvanceDays || [2, 5, 7];
            if (!Array.isArray(allowedArray)) allowedArray = [allowedArray];
            maxDays = Math.max(...allowedArray, 7);
        }

        return Array.from({ length: maxDays }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            return {
                label: d.toLocaleDateString("en-IN", { weekday: "short" }),
                date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
                key: d.toISOString().split("T")[0],
                isToday: i === 0,
            };
        });
    }, [cartItems, categories, bookingTypeConfig]);

    const slots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

    const handleSave = () => {
        if (tempDate && tempSlot) {
            setSelectedSlot({
                date: tempDate,
                time: tempSlot,
                provider: selectedProvider
            });
            onSave?.();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-10 sm:items-center sm:p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-lg bg-background rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                >
                    {/* Fixed Header */}
                    <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-background z-10">
                        <div>
                            <h2 className="text-xl font-bold font-display uppercase tracking-tight">Select Slot</h2>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                                Choose professional & time
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-accent transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto hide-scrollbar p-6 space-y-6">

                        {/* Provider Selection */}
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-primary" /> Service Professional
                            </h3>
                            <div className="space-y-3">
                                {availableProviders.map((provider) => (
                                    <button
                                        key={provider.id}
                                        onClick={() => setSelectedProvider(provider)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedProvider?.id === provider.id
                                            ? "border-primary bg-primary/5 shadow-md"
                                            : "border-border glass hover:border-primary/20"
                                            }`}
                                    >
                                        <div className="relative">
                                            <img src={provider.image} className="w-14 h-14 rounded-xl object-cover" alt={provider.name} />
                                            {selectedProvider?.id === provider.id && (
                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-bold text-sm truncate">{provider.name}</h4>
                                                <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                                                    {provider.tag}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> {provider.rating}
                                                </span>
                                                <span className="text-[10px] font-bold text-muted-foreground">• {provider.experience}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground">• {provider.totalJobs} jobs</span>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <ShieldCheck className="w-6 h-6 text-green-500/40" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Selection */}
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-primary" /> Select Date
                            </h3>
                            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                                {dates.map((d) => (
                                    <button
                                        key={d.key}
                                        onClick={() => setTempDate(d.key)}
                                        className={`flex-shrink-0 px-4 py-3 rounded-xl text-center text-xs transition-all duration-200 min-w-[70px] border-2 ${tempDate === d.key
                                            ? "bg-primary text-white border-primary shadow-lg scale-105"
                                            : "glass border-border hover:border-primary/30"
                                            }`}
                                    >
                                        <div className="font-bold">{d.label}</div>
                                        <div className="mt-1 text-[10px] opacity-80">{d.date}</div>
                                        {d.isToday && (
                                            <div className={`text-[8px] font-black mt-1 uppercase ${tempDate === d.key ? "text-white/90" : "text-primary"}`}>
                                                Today
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Slots */}
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-primary" /> Select Time Slot
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {slots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setTempSlot(slot)}
                                        className={`px-2 py-2.5 rounded-xl text-[10px] font-bold text-center border-2 transition-all duration-200 ${tempSlot === slot
                                            ? "bg-primary text-white border-primary shadow-md scale-105"
                                            : "glass border-border hover:border-primary/30"
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <div className="p-6 bg-background border-t border-border">
                        <Button
                            onClick={handleSave}
                            disabled={!tempDate || !tempSlot}
                            className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 bg-black text-white hover:bg-black/90 flex items-center justify-center space-x-2 border-none"
                        >
                            <span>SECURE PROFESSIONAL</span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground mt-3 font-medium">
                            Free cancellation up to 4 hours before service
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SlotSelectionModal;
