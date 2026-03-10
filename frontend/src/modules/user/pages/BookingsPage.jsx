import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGenderTheme } from "@/modules/user/contexts/GenderThemeContext";
import { useBookings } from "@/modules/user/contexts/BookingContext";
import {
    ArrowLeft, Calendar, Clock, ChevronRight,
    MapPin, ShoppingBag, Star, RefreshCcw,
    MessageSquare, Phone, Zap, Sparkles, Users, LayoutGrid, IndianRupee, Percent, CheckCircle2
} from "lucide-react";
import ChatModal from "@/modules/user/components/salon/ChatModal";
import CallingOverlay from "@/modules/user/components/salon/CallingOverlay";
import BookingDetailsModal from "@/modules/user/components/salon/BookingDetailsModal";
import SlotSelectionModal from "@/modules/user/components/salon/SlotSelectionModal";
import FeedbackModal from "@/modules/user/components/salon/FeedbackModal";
import ProviderProfileModal from "@/modules/user/components/salon/ProviderProfileModal";
import { useUserModuleData } from "@/modules/user/contexts/UserModuleDataContext";

const BookingsPage = () => {
    const navigate = useNavigate();
    const { gender } = useGenderTheme();
    const { bookings, acceptCustomizedBooking, confirmCustomizedBooking, rejectCustomizedBooking } = useBookings();
    useEffect(() => {
        try {
            bookings.forEach(b => {
                const s = (b.status || "").toLowerCase();
                if (s === "arrived" && b.otp) {
                    console.log("[Booking OTP]", b._id || b.id, b.otp);
                }
            });
        } catch {}
    }, [bookings]);
    const [mainType, setMainType] = useState("normal"); // 'normal' or 'customize'
    const [activeTab, setActiveTab] = useState("Upcoming");
    const [chatBooking, setChatBooking] = useState(null);
    const [callingBooking, setCallingBooking] = useState(null);
    const [detailsBooking, setDetailsBooking] = useState(null);
    const [rescheduleBooking, setRescheduleBooking] = useState(null);
    const [feedbackBooking, setFeedbackBooking] = useState(null);
    const [providerModalData, setProviderModalData] = useState(null);
    const { providers } = useUserModuleData();

    // Get raw enquiries
    const rawEnquiries = JSON.parse(localStorage.getItem("muskan-enquiries") || "[]");
    // Get global bookings to find status updates
    const globalBookings = JSON.parse(localStorage.getItem("muskan-bookings") || "[]");

    // Merge: overlay booking data from global bookings onto enquiries
    const combinedEnquiries = rawEnquiries.map(enq => {
        const booking = globalBookings.find(b => b.id === enq.id);
        if (booking) {
            const status = booking.status;
            if (status === "admin_approved") {
                // Step 4: Admin approved pricing, show quote to user
                return { ...enq, ...booking, status: "Quote Ready", isQuote: true, displayPhase: "pricing" };
            } else if (status === "user_accepted") {
                // Step 5: User accepted, waiting for vendor team assignment
                return { ...enq, ...booking, status: "Awaiting Team", displayPhase: "team_pending" };
            } else if (status === "team_assigned") {
                // Step 6: Vendor assigned team, waiting for admin final approval
                return { ...enq, ...booking, status: "Team Under Review", displayPhase: "team_review" };
            } else if (status === "final_approved") {
                // Step 7: Admin final approved! Show to user for final confirmation
                return { ...enq, ...booking, status: "Ready to Start", isReady: true, displayPhase: "final" };
            } else if (status === "vendor_assigned") {
                // Step 2: Vendor set price, waiting for admin
                return { ...enq, ...booking, status: "Under Review", displayPhase: "vendor_pricing" };
            } else if (status === "accepted") {
                // Already a normal booking, remove from enquiries view
                return null;
            }
            return { ...enq, ...booking };
        }
        return enq;
    }).filter(Boolean).reverse();

    useEffect(() => {
        const checkAutoFeedback = () => {
            const feedback = JSON.parse(localStorage.getItem("muskan-feedback") || "[]");
            // Find completed bookings that haven't been reviewed by customer
            const unreviewed = bookings.find(b =>
                b.status?.toLowerCase() === 'completed' &&
                !feedback.some(f => f.bookingId === b.id && f.type === 'customer_to_provider')
            );

            if (unreviewed && !feedbackBooking) {
                // Short delay to let the page load
                const timer = setTimeout(() => setFeedbackBooking(unreviewed), 1000);
                return () => clearTimeout(timer);
            }
        };
        checkAutoFeedback();
    }, [bookings, feedbackBooking]);

    const getFormattedDate = (dateStr) => {
        if (!dateStr) return "";
        if (dateStr === "Today") return "Today";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
    };

    const handleProviderClick = (booking) => {
        let foundProvider = providers?.find(p => p.id === booking.assignedProvider || p.phone === booking.assignedProvider);
        if (!foundProvider && booking.slot?.provider) {
            foundProvider = {
                name: booking.slot.provider.name,
                image: null,
                experience: '2+ Years',
                specialties: [booking.serviceType || booking.categoryName || 'General']
            };
        } else if (!foundProvider && booking.teamMembers?.length > 0) {
            foundProvider = booking.teamMembers[0];
        } else if (!foundProvider) {
            foundProvider = {
                name: 'Trained Pro',
                experience: '3+ Years',
                specialties: [booking.serviceType || 'General']
            };
        }
        setProviderModalData(foundProvider);
    };

    const getPhaseColor = (phase) => {
        switch (phase) {
            case "pricing": return "bg-green-100 text-green-700";
            case "team_pending": return "bg-blue-100 text-blue-700";
            case "team_review": return "bg-cyan-100 text-cyan-700";
            case "final": return "bg-emerald-100 text-emerald-700";
            case "vendor_pricing": return "bg-amber-100 text-amber-700";
            default: return "bg-primary/10 text-primary";
        }
    };

    const getPhaseDescription = (phase) => {
        switch (phase) {
            case "pricing": return "Pricing has been approved. Review and accept the quote.";
            case "team_pending": return "Your acceptance is confirmed. Vendor is now assigning the team.";
            case "team_review": return "Team has been assigned. Admin is reviewing the assignment.";
            case "final": return "Everything is set! Accept to start the service like a normal booking.";
            case "vendor_pricing": return "Vendor is setting the pricing. You'll be notified once admin approves.";
            default: return "Your enquiry is being processed.";
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8">
            {/* Header */}
            <div className="sticky top-0 z-30 glass-strong border-b border-border px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className={`text-lg font-semibold ${gender === "women" ? "font-display" : "font-heading-men"}`}>My Bookings</h1>
            </div>

            <div className="px-4 md:px-8 lg:px-0 max-w-2xl mx-auto mt-4">
                {/* Main Toggle */}
                <div className="flex p-1.5 bg-accent/50 rounded-2xl mb-4 relative">
                    <div
                        className="absolute h-[calc(100%-12px)] top-[6px] transition-all duration-300 ease-out bg-primary rounded-xl shadow-md"
                        style={{
                            width: "calc(50% - 6px)",
                            left: mainType === "normal" ? "6px" : "calc(50%)"
                        }}
                    />
                    <button
                        onClick={() => setMainType("normal")}
                        className={`relative z-10 flex-1 py-2 text-xs font-black uppercase tracking-wider transition-colors ${mainType === "normal" ? "text-white" : "text-muted-foreground"}`}
                    >
                        Normal Booking
                    </button>
                    <button
                        onClick={() => setMainType("customize")}
                        className={`relative z-10 flex-1 py-2 text-xs font-black uppercase tracking-wider transition-colors ${mainType === "customize" ? "text-white" : "text-muted-foreground"}`}
                    >
                        Customize Booking
                    </button>
                </div>

                {mainType === "normal" ? (
                    <>
                        {/* Sub Tabs */}
                        <div className="flex gap-2 mb-4">
                            {["Upcoming", "Past"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === tab
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "bg-accent text-muted-foreground"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Bookings List */}
                        <div className="space-y-4">
                            {bookings
                                .filter(b => {
                                    const s = (b.status || "").toLowerCase();
                                    return activeTab === "Upcoming" ? s !== "completed" : s === "completed";
                                    // Exclude customized bookings from normal tab unless they are confirmed (accepted/completed)
                                    if (b.bookingType === "customized" || b.eventType) {
                                        const st = (b.status || "").toLowerCase();
                                        if (!["accepted", "completed", "travelling", "arrived", "in_progress"].includes(st)) return false;
                                    }
                                    return activeTab === "Upcoming"
                                        ? b.status?.toLowerCase() !== "completed"
                                        : b.status?.toLowerCase() === "completed";
                                })
                                .map((booking, i) => (
                                    <motion.div
                                        key={booking._id || booking.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-strong rounded-2xl overflow-hidden border border-border/50 group"
                                    >
                                        <div className="p-4">
                                            <div className="flex gap-4">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-accent">
                                                    <img
                                                        src={booking.items?.[0]?.image || "https://placehold.co/100x100"}
                                                        className="w-full h-full object-cover"
                                                        alt="Service"
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div>
                                                            <h3 className="font-bold text-sm truncate">
                                                                {booking.items?.[0]?.name || booking.categoryName || booking.serviceType || "Customized Service"}
                                                                {(booking.items?.length > 1 || booking.selectedServices?.length > 1) && ` + ${Math.max(0, (booking.items?.length || booking.selectedServices?.length) - 1)} more`}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 ${(booking.bookingType || "").toLowerCase() === 'instant' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                                                                    }`}>
                                                                    {(booking.bookingType || "").toLowerCase() === 'instant' ? <Zap className="w-2 h-2" /> : <Calendar className="w-2 h-2" />}
                                                                    {(booking.bookingType || "").toLowerCase() === 'instant' ? 'Booked' : 'Pre-book'}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                                    ID: {booking._id || booking.id}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${booking.status?.toLowerCase() === "accepted" ? "bg-green-100 text-green-600" :
                                                            booking.status?.toLowerCase() === "upcoming" ? "bg-blue-100 text-blue-600" :
                                                                booking.status?.toLowerCase() === "completed" ? "bg-emerald-100 text-emerald-600" :
                                                                    "bg-gray-100 text-gray-600"
                                                            }`}>
                                                            {booking.status?.toLowerCase() === "completed" ? "Completed" : (booking.status || "Pending")}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2 mt-2">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> {getFormattedDate(booking.slot?.date)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {booking.slot?.time}
                                                        </div>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleProviderClick(booking); }} 
                                                            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                                                        >
                                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                            <span className="font-bold underline decoration-primary/30 underline-offset-2">
                                                                {booking.slot?.provider?.name || booking.teamMembers?.[0]?.name || Object.values(providers || {}).find(p => p.id === booking.assignedProvider)?.name || 'Trained Pro'}
                                                            </span>
                                                        </button>
                                                    </div>

                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate opacity-70">
                                                        <MapPin className="w-3 h-3 text-primary" />
                                                        {booking.address?.houseNo}, {booking.address?.area}
                                                    </p>
                                                    {booking.otp && ((booking.status || "").toLowerCase() === "arrived") && (
                                                        <div className="mt-2 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-[11px] font-black tracking-widest shadow-sm">
                                                            OTP: {booking.otp}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Payment Status</p>
                                                    <p className="font-bold text-primary flex items-center gap-1">
                                                        ₹{booking.prepaidAmount ? booking.prepaidAmount.toLocaleString() : ((booking.bookingType || "").toLowerCase() === 'instant' ? (booking.totalAmount || 0)?.toLocaleString() : ((booking.totalAmount || 0) * 0.3)?.toLocaleString())}
                                                        <span className="text-[8px] font-black text-green-600 bg-green-50 px-1 rounded uppercase">
                                                            {booking.paymentStatus || ((booking.bookingType || "").toLowerCase() === 'instant' ? 'PAID' : '30% PAID')}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    {activeTab === "Upcoming" ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setChatBooking(booking)}
                                                                className="h-9 w-9 rounded-xl border border-primary/20 bg-primary/5 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors"
                                                            >
                                                                <MessageSquare className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setCallingBooking(booking)}
                                                                className="h-9 w-9 rounded-xl border border-primary/20 bg-primary/5 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors"
                                                            >
                                                                <Phone className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDetailsBooking(booking)}
                                                                className="px-4 py-1.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-[11px] font-bold hover:bg-primary/10 transition-colors"
                                                            >
                                                                Details
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setFeedbackBooking(booking)} className="px-4 py-1.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-[11px] font-bold flex items-center gap-1.5 hover:bg-primary/10 transition-colors">
                                                                <Star className="w-3.5 h-3.5 fill-primary" /> Review
                                                            </button>
                                                            <button className="px-4 py-1.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-[11px] font-bold flex items-center gap-1.5 hover:bg-primary/10 transition-colors">
                                                                <RefreshCcw className="w-3 h-3" /> Rebook
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>

                        {bookings.filter(b => {
                            if (b.bookingType === "customized" || b.eventType) {
                                const st = (b.status || "").toLowerCase();
                                if (!["accepted", "completed", "travelling", "arrived", "in_progress"].includes(st)) return false;
                            }
                            return activeTab === "Upcoming" ? b.status !== "Completed" : b.status === "Completed";
                        }).length === 0 && (
                            <div className="py-20 text-center">
                                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
                                    <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                                <h2 className="text-lg font-bold mb-1">No Bookings Yet</h2>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    You haven't booked any services yet. Start exploring our premium salon services!
                                </p>
                                <button
                                    onClick={() => navigate("/home")}
                                    className="mt-6 px-8 py-2.5 bg-primary text-primary-foreground rounded-full font-bold shadow-lg shadow-primary/20"
                                >
                                    Explore Services
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-4">
                        {combinedEnquiries.length > 0 ? (
                            combinedEnquiries.map((enq, i) => (
                                <motion.div
                                    key={enq.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`glass-strong rounded-3xl p-5 border shadow-sm relative overflow-hidden ${enq.isQuote ? "border-primary/30 ring-1 ring-primary/10" : enq.isReady ? "border-emerald-300 ring-1 ring-emerald-100" : "border-primary/10"}`}
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded ${getPhaseColor(enq.displayPhase)}`}>
                                                {enq.status || "Enquiry Details"}
                                            </span>
                                            <h3 className="text-lg font-black mt-2 font-display">{enq.eventType}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{enq.id}</p>
                                            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${enq.isReady ? "bg-emerald-600 text-white" : enq.isQuote ? "bg-green-600 text-white" : "bg-amber-100 text-amber-600"}`}>
                                                {enq.status || 'Pending Review'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Phase description */}
                                    {enq.displayPhase && (
                                        <div className={`mb-3 p-3 rounded-xl border ${
                                            enq.displayPhase === "final" ? "bg-emerald-50 border-emerald-100" :
                                            enq.displayPhase === "pricing" ? "bg-green-50 border-green-100" :
                                            "bg-muted/30 border-border/30"
                                        }`}>
                                            <p className="text-[10px] font-bold text-foreground/70 leading-relaxed">
                                                {getPhaseDescription(enq.displayPhase)}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Preferred Schedule</p>
                                            <div className="flex items-center gap-2 text-sm font-bold">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                {enq.date}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-bold">
                                                <Clock className="w-4 h-4 text-primary" />
                                                {enq.timeSlot}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Details</p>
                                            <div className="flex items-center gap-2 text-sm font-bold">
                                                <Users className="w-4 h-4 text-primary" />
                                                {enq.noOfPeople} People
                                            </div>
                                            {/* Price & Discount Display */}
                                            {(enq.totalAmount > 0) && (
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1 text-sm font-black text-primary">
                                                        <IndianRupee className="w-3 h-3" />
                                                        ₹{enq.totalAmount?.toLocaleString()}
                                                    </div>
                                                    {enq.discountPrice > 0 && (
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                                                            <Percent className="w-2.5 h-2.5" />
                                                            Discount: ₹{enq.discountPrice?.toLocaleString()}
                                                        </div>
                                                    )}
                                                    {enq.discountPrice > 0 && (
                                                        <p className="text-[10px] font-black text-emerald-700">
                                                            Final: ₹{((enq.totalAmount || 0) - (enq.discountPrice || 0)).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {(enq.categoryName || enq.selectedServices) && (
                                        <div className="mb-4 p-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex flex-col gap-2">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-purple-600 mb-1 flex items-center gap-1"><LayoutGrid className="h-3 w-3" /> Requested Category:</p>
                                                <p className="text-sm font-bold">{enq.categoryName || enq.serviceType}</p>
                                            </div>
                                            {enq.selectedServices && (
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-purple-600 mb-1">Services Breakdown:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {enq.selectedServices.map((s, idx) => (
                                                            <span key={idx} className="text-[9px] font-bold px-2 py-1 bg-white border border-purple-200 text-purple-700 rounded-lg">
                                                                {s.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Team display - show when team is assigned (after final approval) */}
                                    {(enq.isReady || enq.displayPhase === "team_review") && enq.teamMembers && enq.teamMembers.length > 0 && (
                                        <div className="mb-4 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                                            <p className="text-[10px] font-black uppercase text-primary mb-2">Assigned Experts Team</p>
                                            <div className="flex flex-wrap gap-2">
                                                {enq.teamMembers.map((m, idx) => (
                                                    <span key={idx} className="text-[9px] font-bold px-2 py-1 bg-white border border-primary/10 rounded-lg flex items-center gap-1">
                                                        <Sparkles className="w-2.5 h-2.5 text-primary" /> {m.name}
                                                        {m.id === enq.maintainProvider && (
                                                            <span className="text-[7px] bg-primary/10 text-primary px-1 rounded ml-0.5">Lead</span>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {enq.notes && (
                                        <div className="p-3 bg-accent/40 rounded-2xl border border-border/50">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 opacity-60">Requirements</p>
                                            <p className="text-xs text-foreground italic leading-relaxed">"{enq.notes}"</p>
                                        </div>
                                    )}

                                    {/* Step actions hidden on user panel */}
                                    {enq.isQuote || enq.isReady ? (
                                        <div className="mt-5 p-3 bg-accent/40 rounded-2xl border border-border/50 text-[11px] font-bold text-muted-foreground">
                                            Status updated by our team. We will contact you for next steps.
                                        </div>
                                    ) : (
                                        <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                            <span>Sent on {new Date(enq.createdAt).toLocaleDateString()}</span>
                                            <span className="text-primary hover:underline cursor-pointer">Support Help</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-20 text-center">
                                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
                                    <Sparkles className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                                <h2 className="text-lg font-bold mb-1">No Custom Enquiries</h2>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Need a bulk booking for a wedding or event? Request a custom quote today!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals & Overlays */}
            <ChatModal
                isOpen={!!chatBooking}
                onClose={() => setChatBooking(null)}
                booking={chatBooking}
            />

            <CallingOverlay
                isOpen={!!callingBooking}
                onClose={() => setCallingBooking(null)}
                booking={callingBooking}
            />

            <BookingDetailsModal
                isOpen={!!detailsBooking}
                onClose={() => setDetailsBooking(null)}
                booking={detailsBooking}
            />

            <SlotSelectionModal
                isOpen={!!rescheduleBooking}
                onClose={() => setRescheduleBooking(null)}
                onSave={() => {
                    setRescheduleBooking(null);
                }}
            />

            <FeedbackModal
                isOpen={!!feedbackBooking}
                onClose={() => setFeedbackBooking(null)}
                booking={feedbackBooking}
            />

            <ProviderProfileModal 
                isOpen={!!providerModalData} 
                onClose={() => setProviderModalData(null)} 
                provider={providerModalData} 
            />
            
        </div>
    );
};

export default BookingsPage;
