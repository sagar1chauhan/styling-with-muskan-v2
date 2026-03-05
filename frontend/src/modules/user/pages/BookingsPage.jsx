import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGenderTheme } from "@/modules/user/contexts/GenderThemeContext";
import { useBookings } from "@/modules/user/contexts/BookingContext";
import {
    ArrowLeft, Calendar, Clock, ChevronRight,
    MapPin, ShoppingBag, Star, RefreshCcw,
    MessageSquare, Phone, Zap, Sparkles, Users
} from "lucide-react";
import ChatModal from "@/modules/user/components/salon/ChatModal";
import CallingOverlay from "@/modules/user/components/salon/CallingOverlay";
import BookingDetailsModal from "@/modules/user/components/salon/BookingDetailsModal";
import SlotSelectionModal from "@/modules/user/components/salon/SlotSelectionModal";

const BookingsPage = () => {
    const navigate = useNavigate();
    const { gender } = useGenderTheme();
    const { bookings } = useBookings();
    const [mainType, setMainType] = useState("normal"); // 'normal' or 'customize'
    const [activeTab, setActiveTab] = useState("Upcoming");
    const [chatBooking, setChatBooking] = useState(null);
    const [callingBooking, setCallingBooking] = useState(null);
    const [detailsBooking, setDetailsBooking] = useState(null);
    const [rescheduleBooking, setRescheduleBooking] = useState(null);

    const enquiries = JSON.parse(localStorage.getItem("muskan-enquiries") || "[]").reverse();

    const getFormattedDate = (dateStr) => {
        if (!dateStr) return "";
        if (dateStr === "Today") return "Today";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
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
                                .filter(b => activeTab === "Upcoming" ? b.status !== "Completed" : b.status === "Completed")
                                .map((booking, i) => (
                                    <motion.div
                                        key={booking.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-strong rounded-2xl overflow-hidden border border-border/50 group"
                                    >
                                        <div className="p-4">
                                            <div className="flex gap-4">
                                                {/* Service Image (using first item) */}
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
                                                                {booking.items?.[0]?.name}
                                                                {booking.items?.length > 1 && ` + ${booking.items.length - 1} more`}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 ${(booking.bookingType || "").toLowerCase() === 'instant' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                                                                    }`}>
                                                                    {(booking.bookingType || "").toLowerCase() === 'instant' ? <Zap className="w-2 h-2" /> : <Calendar className="w-2 h-2" />}
                                                                    {(booking.bookingType || "").toLowerCase() === 'instant' ? 'Instant' : 'Pre-book'}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                                    ID: {booking.id}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${booking.status === "Accepted" ? "bg-green-100 text-green-600" :
                                                            booking.status === "Upcoming" ? "bg-blue-100 text-blue-600" :
                                                                "bg-gray-100 text-gray-600"
                                                            }`}>
                                                            {booking.status || "Pending"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2 mt-2">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> {getFormattedDate(booking.slot?.date)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {booking.slot?.time}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                            {booking.slot?.provider?.name || 'Trained Pro'}
                                                        </div>
                                                    </div>

                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate opacity-70">
                                                        <MapPin className="w-3 h-3 text-primary" />
                                                        {booking.address?.houseNo}, {booking.address?.area}
                                                    </p>
                                                    {booking.otp && ["pending", "Pending", "accepted", "Accepted", "travelling", "arrived"].includes(booking.status) && (
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
                                                        ₹{booking.prepaidAmount ? booking.prepaidAmount.toLocaleString() : ((booking.bookingType || "").toLowerCase() === 'instant' ? booking.totalAmount?.toLocaleString() : (booking.totalAmount * 0.3)?.toLocaleString())}
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
                                                            <button className="px-4 py-1.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-[11px] font-bold flex items-center gap-1.5 hover:bg-primary/10 transition-colors">
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

                        {bookings.filter(b => activeTab === "Upcoming" ? b.status !== "Completed" : b.status === "Completed").length === 0 && (
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
                        {enquiries.length > 0 ? (
                            enquiries.map((enq, i) => (
                                <motion.div
                                    key={enq.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-strong rounded-3xl p-5 border border-primary/10 shadow-sm relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-1 rounded">
                                                Enquiry Details
                                            </span>
                                            <h3 className="text-lg font-black mt-2 font-display">{enq.eventType}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{enq.id}</p>
                                            <span className="inline-block mt-1 px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">
                                                {enq.status || 'Pending Review'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
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
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Group Size</p>
                                            <div className="flex items-center gap-2 text-sm font-bold">
                                                <Users className="w-4 h-4 text-primary" />
                                                {enq.noOfPeople} People
                                            </div>
                                        </div>
                                    </div>

                                    {enq.notes && (
                                        <div className="p-3 bg-accent/40 rounded-2xl border border-border/50">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 opacity-60">Requirements</p>
                                            <p className="text-xs text-foreground italic leading-relaxed">"{enq.notes}"</p>
                                        </div>
                                    )}

                                    <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                        <span>Sent on {new Date(enq.createdAt).toLocaleDateString()}</span>
                                        <span className="text-primary hover:underline cursor-pointer">Support Help</span>
                                    </div>
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
        </div>
    );
};

export default BookingsPage;
