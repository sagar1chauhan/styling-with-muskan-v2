import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, Star, Phone, MessageSquare, Zap, Receipt, ShieldCheck, ChevronRight } from "lucide-react";

const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
    if (!booking) return null;

    const getFormattedDate = (dateStr) => {
        if (!dateStr) return "";
        if (dateStr === "Today") return "Today";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short', year: 'numeric' });
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            Accepted: "bg-green-100 text-green-600 border-green-200",
            Upcoming: "bg-blue-100 text-blue-600 border-blue-200",
            Completed: "bg-gray-100 text-gray-600 border-gray-200",
            Pending: "bg-amber-100 text-amber-600 border-amber-200",
        };
        return (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[status] || styles.Pending}`}>
                {status || "Pending"}
            </span>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-lg bg-background rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-6 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black tracking-tight">Booking Details</h2>
                                <p className="text-xs text-muted-foreground mt-0.5 font-medium">ID: {booking.id}</p>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 hide-scrollbar pb-32">

                            {/* Status Card */}
                            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-2xl border border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${booking.bookingType === 'instant' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {booking.bookingType === 'instant' ? <Zap className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Status</p>
                                        <p className="text-sm font-black mt-0.5">{booking.status || "Booking Accepted"}</p>
                                    </div>
                                </div>
                                <StatusBadge status={booking.status} />
                            </div>

                            {/* Service Items */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Services Booked</h3>
                                <div className="space-y-3">
                                    {booking.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-3 bg-white rounded-2xl border border-border/40 shadow-sm">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-accent flex-shrink-0">
                                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                                <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground font-medium">Qty: 1</span>
                                                    <span className="font-black text-primary">₹{item.price}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Schedule & Pro */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-2xl border border-border/40 shadow-sm space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Date & Time</span>
                                    </div>
                                    <p className="text-sm font-bold">{getFormattedDate(booking.slot?.date)}</p>
                                    <p className="text-[11px] font-medium text-muted-foreground">{booking.slot?.time}</p>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-border/40 shadow-sm space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Star className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Professional</span>
                                    </div>
                                    <p className="text-sm font-bold">{booking.slot?.provider?.name || 'Trained Pro'}</p>
                                    <div className="flex items-center gap-1 text-green-600">
                                        <ShieldCheck className="w-3 h-3" />
                                        <span className="text-[10px] font-bold">Vaccinated & Verified</span>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Service Location</h3>
                                <div className="p-4 bg-white rounded-2xl border border-border/40 shadow-sm flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold leading-tight">{booking.address?.houseNo}, {booking.address?.area}</p>
                                        <p className="text-[11px] text-muted-foreground mt-1 font-medium">{booking.address?.landmark && `Near ${booking.address.landmark}`}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Receipt className="w-4 h-4" /> Bill Summary
                                </h3>
                                <div className="p-5 bg-white rounded-3xl border border-border/40 shadow-sm space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Item Total</span>
                                        <span className="font-bold font-display tracking-tight text-foreground">₹{booking.totalAmount - (booking.convenienceFee || 0) + (booking.discount || 0)}</span>
                                    </div>
                                    {booking.convenienceFee && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Convenience Fee</span>
                                            <span className="font-bold text-foreground">₹{booking.convenienceFee}</span>
                                        </div>
                                    )}
                                    {booking.discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600 font-bold">Discount Applied</span>
                                            <span className="font-bold text-green-600">-₹{booking.discount}</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-dashed-border w-full opacity-30 my-2" style={{ backgroundImage: 'linear-gradient(to right, #ccc 50%, rgba(255,255,255,0) 0%)', backgroundSize: '10px 1px', backgroundRepeat: 'repeat-x' }} />
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="font-black tracking-tight">Total Paid</span>
                                        <div className="text-right">
                                            <p className="font-black text-primary font-display">₹{booking.totalAmount}</p>
                                            <span className="text-[8px] font-black uppercase px-1 rounded bg-green-50 text-green-600 border border-green-200">
                                                {booking.paymentStatus || 'Success'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-2xl flex items-center gap-3 border border-border/50">
                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground leading-tight">
                                    This service is protected by Styling with Muskan hygiene guarantee.
                                </p>
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="p-6 bg-background border-t border-border/50 flex items-center gap-3 sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                            <button className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 border border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/10 transition-all">
                                <Phone className="w-4 h-4" /> Call Pro
                            </button>
                            <button className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 bg-primary text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                                <MessageSquare className="w-4 h-4" /> Chat Now
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BookingDetailsModal;
