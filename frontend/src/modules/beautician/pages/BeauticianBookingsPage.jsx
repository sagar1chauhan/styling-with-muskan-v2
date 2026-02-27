import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, ChevronRight, Check, X, Zap, Calendar, Timer } from "lucide-react";
import { useBeauticianBookings } from "@/modules/beautician/contexts/BeauticianBookingContext";
import { Button } from "@/modules/user/components/ui/button";

const CountdownTimer = ({ expiresAt }) => {
    const [remaining, setRemaining] = useState(0);
    useEffect(() => {
        const update = () => {
            const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
            setRemaining(Math.floor(diff / 1000));
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${remaining < 120 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-amber-500/10 text-amber-500"}`}>
            <Timer className="w-3 h-3" />
            {mins}:{secs.toString().padStart(2, "0")}
        </div>
    );
};

const BookingCard = ({ booking, type, onAccept, onReject, onNavigate }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-[--radius] p-3.5 border border-border shadow-sm hover:border-primary/30 transition-all">
        <div className="flex items-center justify-between mb-2.5">
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${booking.bookingType === "instant" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-primary/5 text-primary border border-primary/10"}`}>
                {booking.bookingType === "instant" ? "Instant" : "Scheduled"}
            </span>
            {type === "incoming" && booking.expiresAt && <CountdownTimer expiresAt={booking.expiresAt} />}
            {type === "active" && <span className="text-[10px] font-bold uppercase text-green-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> {booking.status.replace("_", " ")}</span>}
        </div>

        <div className="space-y-0.5">
            {booking.services.map((s, i) => (
                <div key={i} className="flex justify-between items-center"><span className="text-xs font-bold text-foreground">{s.name}</span><span className="text-[10px] text-muted-foreground">{s.duration}</span></div>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground mt-3 pt-2 borders-t border-border/50">
            <span className="flex items-center gap-1.5 font-medium"><Calendar className="w-3 h-3 text-primary/70" /> {booking.slot.date}</span>
            <span className="flex items-center gap-1.5 font-medium"><Clock className="w-3 h-3 text-primary/70" /> {booking.slot.time}</span>
        </div>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 truncate mt-1.5 font-medium">
            <MapPin className="w-3 h-3 text-primary/70 flex-shrink-0" /> {booking.address.area}
        </p>

        <div className="mt-3.5 pt-3 border-t border-border/50 flex items-center justify-between gap-3">
            <p className="text-base font-bold text-foreground">₹{booking.totalAmount.toLocaleString()}</p>
            {type === "incoming" && (
                <div className="flex gap-2">
                    <Button onClick={() => onReject(booking.id)} variant="ghost" className="h-8 px-3 rounded-[--radius] text-destructive text-[10px] font-bold hover:bg-destructive/5">Reject</Button>
                    <Button onClick={() => onAccept(booking.id)} className="h-8 px-4 rounded-[--radius] bg-primary text-primary-foreground text-[10px] font-bold shadow-sm">Accept</Button>
                </div>
            )}
            {(type === "active" || type === "completed") && (
                <Button onClick={() => onNavigate(booking.id)} variant="outline" className="h-8 px-4 rounded-[--radius] text-[10px] font-bold border-border hover:bg-accent/50 group">
                    {type === "active" ? "Manage Job" : "View Details"} <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-all" />
                </Button>
            )}
        </div>
    </motion.div>
);

const BeauticianBookingsPage = () => {
    const navigate = useNavigate();
    const { incomingBookings, activeBookings, completedBookings, acceptBooking, rejectBooking } = useBeauticianBookings();
    const [activeTab, setActiveTab] = useState("incoming");
    const tabs = [
        { id: "incoming", label: "Incoming", count: incomingBookings.length },
        { id: "active", label: "Active", count: activeBookings.length },
        { id: "completed", label: "Completed", count: completedBookings.length },
    ];
    const current = activeTab === "incoming" ? incomingBookings : activeTab === "active" ? activeBookings : completedBookings;

    return (
        <div className="px-4 py-6 max-w-4xl mx-auto">
            <div className="flex gap-1.5 mb-6 bg-muted/30 p-1 rounded-md max-w-fit border border-border/50">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-1.5 rounded-[--radius] text-[11px] font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? "bg-card text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"}`}>
                        {tab.label}
                        {tab.count > 0 && <span className={`px-1.5 py-0.5 rounded-sm text-[9px] ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"}`}>{tab.count}</span>}
                    </button>
                ))}
            </div>
            <div className="space-y-3.5">
                {current.length > 0 ? current.map(b => (
                    <BookingCard key={b.id} booking={b} type={activeTab} onAccept={acceptBooking} onReject={rejectBooking} onNavigate={(id) => navigate(`/beautician/booking/${id}`)} />
                )) : (
                    <div className="py-20 text-center bg-card rounded-[--radius] border border-dashed border-border">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">📋</div>
                        <h2 className="text-sm font-bold text-foreground/70">No {activeTab} Bookings Found</h2>
                        <p className="text-[11px] text-muted-foreground">New jobs will appear here in real-time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BeauticianBookingsPage;
