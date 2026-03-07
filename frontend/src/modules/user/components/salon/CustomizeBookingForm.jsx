import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Phone, PartyPopper, Users, Calendar, Clock, CheckCircle2, Sparkles, LayoutGrid, CheckSquare, Square } from "lucide-react";
import { Button } from "@/modules/user/components/ui/button";
import { useGenderTheme } from "@/modules/user/contexts/GenderThemeContext";
import { useUserModuleData } from "@/modules/user/contexts/UserModuleDataContext";

const EVENT_TYPES = ["Bridal Event", "Birthday Party", "Kitty Party", "Corporate Event", "Festival Gathering", "Engagement", "Other"];

const CustomizeBookingForm = ({ isOpen, onClose }) => {
    const { gender } = useGenderTheme();
    const { categories, services } = useUserModuleData();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        eventType: "",
        noOfPeople: "",
        date: "",
        timeSlot: "",
        selectedCategoryId: "",
        selectedServiceIds: [],
        notes: ""
    });
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [lastEnquiry, setLastEnquiry] = useState(null);

    // Update last enquiry whenever isOpen changes or submittion happens
    useEffect(() => {
        if (isOpen) {
            const enquiries = JSON.parse(localStorage.getItem("muskan-enquiries") || "[]");
            if (enquiries.length > 0) {
                setLastEnquiry(enquiries[enquiries.length - 1]);
            }
        }
    }, [isOpen, submitted]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = "Valid phone number required";
        if (!formData.eventType) newErrors.eventType = "Select event type";
        if (!formData.noOfPeople) newErrors.noOfPeople = "Enter number of people";
        if (!formData.selectedCategoryId) newErrors.selectedCategoryId = "Select a service category";
        if (formData.selectedServiceIds.length === 0) newErrors.selectedServiceIds = "Select at least one service";
        if (!formData.date) newErrors.date = "Select date";
        if (!formData.timeSlot) newErrors.timeSlot = "Select time slot";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        // Store enquiry (in production this would be an API call to admin)
        const enquiries = JSON.parse(localStorage.getItem("muskan-enquiries") || "[]");
        const category = categories.find(c => c.id === formData.selectedCategoryId);
        const selectedServices = services.filter(s => formData.selectedServiceIds.includes(s.id));

        enquiries.push({
            ...formData,
            id: `ENQ${Date.now()}`,
            categoryName: category?.name,
            selectedServices: selectedServices.map(s => ({ id: s.id, name: s.name })),
            status: "pending",
            createdAt: new Date().toISOString()
        });
        localStorage.setItem("muskan-enquiries", JSON.stringify(enquiries));

        setSubmitted(true);
    };

    const handleClose = () => {
        setSubmitted(false);
        setFormData({ name: "", phone: "", eventType: "", noOfPeople: "", date: "", timeSlot: "", selectedCategoryId: "", selectedServiceIds: [], notes: "" });
        setErrors({});
        onClose();
    };



    const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pt-10 sm:p-8 md:p-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 10 }}
                        className="relative w-full max-w-lg bg-background rounded-[32px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-background z-10 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold font-display uppercase tracking-tight flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-500" /> Customize Booking
                                </h2>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                                    Bulk & Event Enquiry
                                </p>
                            </div>
                            <button onClick={handleClose} className="p-2 rounded-full hover:bg-accent transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar p-6 space-y-5">
                            {/* Last Enquiry Section */}
                            {lastEnquiry && !submitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-primary/5 rounded-2xl border border-primary/20 mb-2"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Your Last Enquiry</h3>
                                        <span className="text-[8px] font-bold text-muted-foreground bg-white px-2 py-0.5 rounded-full shadow-sm">
                                            {new Date(lastEnquiry.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-foreground">{lastEnquiry.eventType}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">{lastEnquiry.date} • {lastEnquiry.timeSlot}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-600 uppercase tracking-widest">
                                                {lastEnquiry.status}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-10 flex flex-col items-center gap-4"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 12 }}
                                            className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center"
                                        >
                                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                                        </motion.div>
                                        <h3 className="text-xl font-bold font-display text-center">Request Sent! 🎉</h3>
                                        <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
                                            Our team will review your enquiry and contact you within <strong>2-4 hours</strong> to confirm details and pricing.
                                        </p>
                                        <div className="glass-strong rounded-2xl p-4 w-full border border-border/50 mt-2">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Enquiry Summary</p>
                                            <div className="space-y-1.5 text-sm">
                                                <p><span className="text-muted-foreground">Event:</span> <strong>{formData.eventType}</strong></p>
                                                <p><span className="text-muted-foreground">Date:</span> <strong>{formData.date}</strong></p>
                                                <p><span className="text-muted-foreground">People:</span> <strong>{formData.noOfPeople}</strong></p>
                                            </div>
                                        </div>
                                        <Button onClick={handleClose} className="w-full h-12 rounded-2xl font-bold mt-4">
                                            Done
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                                        {/* Name */}
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                                                <User className="w-3.5 h-3.5 text-purple-500" /> Your Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={e => handleChange("name", e.target.value)}
                                                placeholder="Enter your full name"
                                                className={`w-full h-12 px-4 rounded-xl bg-accent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all border ${errors.name ? "border-destructive" : "border-border"}`}
                                            />
                                            {errors.name && <p className="text-[10px] text-destructive mt-1 font-bold">{errors.name}</p>}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                                                <Phone className="w-3.5 h-3.5 text-purple-500" /> Mobile Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                placeholder="10-digit mobile number"
                                                className={`w-full h-12 px-4 rounded-xl bg-accent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all border ${errors.phone ? "border-destructive" : "border-border"}`}
                                            />
                                            {errors.phone && <p className="text-[10px] text-destructive mt-1 font-bold">{errors.phone}</p>}
                                        </div>

                                        {/* Event Type */}
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                                                <PartyPopper className="w-3.5 h-3.5 text-purple-500" /> Event Type
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {EVENT_TYPES.map(et => (
                                                    <button
                                                        key={et}
                                                        onClick={() => handleChange("eventType", et)}
                                                        className={`px-3 py-2.5 rounded-xl text-xs font-bold text-center transition-all border-2 ${formData.eventType === et
                                                            ? "bg-purple-500/10 border-purple-500/30 text-purple-600"
                                                            : "glass border-border hover:border-purple-500/20"
                                                            }`}
                                                    >
                                                        {et}
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.eventType && <p className="text-[10px] text-destructive mt-1 font-bold">{errors.eventType}</p>}
                                        </div>

                                        {/* No. of People */}
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                                                <Users className="w-3.5 h-3.5 text-purple-500" /> Number of People
                                            </label>
                                            <div className="flex gap-2">
                                                {["1-5", "5-10", "10-20", "20+"].map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => handleChange("noOfPeople", opt)}
                                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center transition-all border-2 ${formData.noOfPeople === opt
                                                            ? "bg-purple-500/10 border-purple-500/30 text-purple-600"
                                                            : "glass border-border hover:border-purple-500/20"
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.noOfPeople && <p className="text-[10px] text-destructive mt-1 font-bold">{errors.noOfPeople}</p>}
                                        </div>

                                        {/* Service Selection */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                                                    <LayoutGrid className="w-3.5 h-3.5 text-purple-500" /> Service Category
                                                </label>
                                                <select
                                                    value={formData.selectedCategoryId}
                                                    onChange={e => {
                                                        handleChange("selectedCategoryId", e.target.value);
                                                        handleChange("selectedServiceIds", []); // Reset services when category changes
                                                    }}
                                                    className={`w-full h-12 px-3 rounded-xl bg-accent text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all border appearance-none ${errors.selectedCategoryId ? "border-destructive" : "border-border"}`}
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.filter(c => c.gender === gender || c.gender === "unisex").map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                                {errors.selectedCategoryId && <p className="text-[10px] text-destructive mt-1 font-bold">{errors.selectedCategoryId}</p>}
                                            </div>

                                            {formData.selectedCategoryId && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                                                        <CheckSquare className="w-3.5 h-3.5 text-purple-500" /> Select Sub-Services
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 hide-scrollbar">
                                                        {services.filter(s => s.category === formData.selectedCategoryId).map(s => (
                                                            <button
                                                                key={s.id}
                                                                onClick={() => {
                                                                    const current = formData.selectedServiceIds;
                                                                    const updated = current.includes(s.id)
                                                                        ? current.filter(id => id !== s.id)
                                                                        : [...current, s.id];
                                                                    handleChange("selectedServiceIds", updated);
                                                                }}
                                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold text-left transition-all border-2 ${formData.selectedServiceIds.includes(s.id)
                                                                    ? "bg-purple-500/10 border-purple-500/30 text-purple-600"
                                                                    : "glass border-border hover:border-purple-500/20"
                                                                    }`}
                                                            >
                                                                {formData.selectedServiceIds.includes(s.id) ? (
                                                                    <CheckSquare className="w-3 h-3 shrink-0" />
                                                                ) : (
                                                                    <Square className="w-3 h-3 shrink-0" />
                                                                )}
                                                                <span className="truncate">{s.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    {errors.selectedServiceIds && <p className="text-[10px] text-destructive mt-1 font-bold">{errors.selectedServiceIds}</p>}
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Date & Time */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                                                    <Calendar className="w-3.5 h-3.5 text-purple-500" /> Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.date}
                                                    min={new Date().toISOString().split("T")[0]}
                                                    onChange={e => handleChange("date", e.target.value)}
                                                    className={`w-full h-12 px-3 rounded-xl bg-accent text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all border ${errors.date ? "border-destructive" : "border-border"}`}
                                                />
                                                {errors.date && <p className="text-[10px] text-destructive mt-1 font-bold">{errors.date}</p>}
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                                                    <Clock className="w-3.5 h-3.5 text-purple-500" /> Time Slot
                                                </label>
                                                <select
                                                    value={formData.timeSlot}
                                                    onChange={e => handleChange("timeSlot", e.target.value)}
                                                    className={`w-full h-12 px-3 rounded-xl bg-accent text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all border appearance-none ${errors.timeSlot ? "border-destructive" : "border-border"}`}
                                                >
                                                    <option value="">Select</option>
                                                    {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                {errors.timeSlot && <p className="text-[10px] text-destructive mt-1 font-bold">{errors.timeSlot}</p>}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                                Special Requirements (Optional)
                                            </label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={e => handleChange("notes", e.target.value)}
                                                placeholder="Any specific requirements, services needed, brand preferences..."
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-xl bg-accent text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all resize-none border border-border"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        {!submitted && (
                            <div className="p-6 bg-background border-t border-border shrink-0">
                                <Button
                                    onClick={handleSubmit}
                                    className="w-full h-14 rounded-2xl text-base font-bold shadow-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border-none gap-2"
                                >
                                    <Send className="w-4 h-4" /> Send Enquiry to Admin
                                </Button>
                                <p className="text-[10px] text-muted-foreground text-center mt-3">
                                    Our team will contact you within 2-4 hours to confirm
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CustomizeBookingForm;
