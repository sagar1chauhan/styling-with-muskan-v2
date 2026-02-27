import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Star, ChevronRight, EyeOff, CheckCircle2, XCircle, AlertCircle, History } from "lucide-react";
import { useBeauticianBookings } from "@/modules/beautician/contexts/BeauticianBookingContext";

const BookingHistoryPage = () => {
    const navigate = useNavigate();
    const { bookings } = useBeauticianBookings();
    const allCompleted = bookings.filter(b => b.status === "completed" || b.status === "rejected" || b.status === "cancelled");

    const isAddressExpired = (completedAt) => {
        if (!completedAt) return false;
        const diff = Date.now() - new Date(completedAt).getTime();
        return diff > 7 * 24 * 60 * 60 * 1000;
    };

    return (
        <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background min-h-screen pb-24">
            <div className="max-w-xl mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="pt-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Booking History</h2>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Assignments Ledger</p>
                    </div>
                    <div className="bg-primary/5 p-2 rounded-lg border border-primary/10">
                        <History className="w-5 h-5 text-primary" />
                    </div>
                </div>

                {/* History List */}
                <div className="space-y-3">
                    {allCompleted.length > 0 ? allCompleted.map((booking, i) => (
                        <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-card border border-border/50 rounded-[--radius] p-4 shadow-sm group hover:border-primary/30 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Ref: {booking.id}</span>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[9px] font-black uppercase tracking-widest ${booking.status === "completed" ? "bg-green-500/5 text-green-600 border-green-500/10" :
                                        booking.status === "cancelled" ? "bg-destructive/5 text-destructive border-destructive/10" :
                                            "bg-amber-500/5 text-amber-600 border-amber-500/10"
                                    }`}>
                                    {booking.status === "completed" ? <CheckCircle2 className="w-3 h-3" /> : booking.status === "cancelled" ? <XCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                    {booking.status}
                                </div>
                            </div>

                            <div className="space-y-1 mb-3">
                                {booking.services.map((s, j) => (
                                    <p key={j} className="text-sm font-bold text-foreground tracking-tight">{s.name}</p>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/30">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5 text-primary/40" /> {booking.slot.date}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5 text-primary/40" /> {booking.slot.time}
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <div className="max-w-[70%]">
                                    {isAddressExpired(booking.completedAt) ? (
                                        <p className="text-[9px] text-muted-foreground/40 flex items-center gap-1 italic uppercase font-medium">
                                            <EyeOff className="w-3 h-3" /> Location access closed
                                        </p>
                                    ) : (
                                        <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 truncate italic">
                                            <MapPin className="w-3 h-3 text-primary/60" /> {booking.address.area}
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm font-black text-foreground">₹{booking.totalAmount.toLocaleString()}</p>
                            </div>

                            {booking.beauticianFeedback && (
                                <div className="mt-3 p-2 bg-muted/30 border border-border/30 rounded-sm">
                                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1 opacity-50">Partner Note</p>
                                    <p className="text-[10px] text-muted-foreground font-medium line-clamp-2 italic">"{booking.beauticianFeedback}"</p>
                                </div>
                            )}

                            <button onClick={() => navigate(`/beautician/booking/${booking.id}`)}
                                className="w-full mt-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors flex items-center justify-center gap-1 group-hover:bg-primary/5 rounded-sm">
                                Full Review <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    )) : (
                        <div className="py-24 text-center">
                            <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-20">📄</div>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">No Previous Data</h3>
                            <p className="text-[11px] text-muted-foreground mt-1 px-10">Your completed assignments will be archived in this ledger.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingHistoryPage;

