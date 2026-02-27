import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, Calendar, Clock, Plane, CheckCircle2, AlertCircle } from "lucide-react";
import { useBeauticianAvailability } from "@/modules/beautician/contexts/BeauticianAvailabilityContext";
import { Button } from "@/modules/user/components/ui/button";

const AvailabilityPage = () => {
    const { slots, leaves, defaultHours, updateDaySlots, toggleDayAvailability, requestLeave, isSlotLocked } = useBeauticianAvailability();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveStart, setLeaveStart] = useState("");
    const [leaveEnd, setLeaveEnd] = useState("");
    const [leaveReason, setLeaveReason] = useState("");

    const monthDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0);
        const days = [];
        for (let i = 0; i < first.getDay(); i++) days.push(null);
        for (let d = 1; d <= last.getDate(); d++) {
            const date = new Date(year, month, d);
            const key = date.toISOString().split("T")[0];
            days.push({ date: d, key, isToday: key === new Date().toISOString().split("T")[0], dayOfWeek: date.getDay() });
        }
        return days;
    }, [currentMonth]);

    const daySlot = selectedDate ? (slots[selectedDate] || { available: false, hours: [] }) : null;

    const handleToggleHour = (hour) => {
        if (!selectedDate || isSlotLocked(selectedDate, hour)) return;
        const current = daySlot?.hours || [];
        const updated = current.includes(hour) ? current.filter(h => h !== hour) : [...current, hour];
        updateDaySlots(selectedDate, updated);
    };

    const handleLeaveSubmit = () => {
        if (leaveStart && leaveEnd) {
            requestLeave(leaveStart, leaveEnd, leaveReason);
            setShowLeaveModal(false);
            setLeaveStart(""); setLeaveEnd(""); setLeaveReason("");
        }
    };

    return (
        <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background min-h-screen pb-24">
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                <div className="pt-4 flex justify-between items-end">
                    <div>
                        <h1 className="text-xl font-bold text-foreground tracking-tight">Schedule & Availability</h1>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Manage your professional calendar</p>
                    </div>
                    <Button onClick={() => setShowLeaveModal(true)} variant="outline" className="h-9 px-4 rounded-[--radius] border-border text-[10px] font-bold gap-2 hover:bg-primary/5 transition-colors">
                        <Plane className="w-3.5 h-3.5" /> REQUEST LEAVE
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-4">
                        <div className="bg-card border border-border/50 rounded-[--radius] p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[11px] font-black uppercase text-foreground tracking-widest">{currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h3>
                                <div className="flex gap-1">
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                    <div key={d} className="text-center text-[9px] font-bold text-muted-foreground uppercase py-2">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {monthDays.map((day, i) => {
                                    if (!day) return <div key={i} />;
                                    const slot = slots[day.key];
                                    const isAvailable = slot?.available;
                                    const isSelected = selectedDate === day.key;
                                    return (
                                        <button key={i} onClick={() => setSelectedDate(day.key)}
                                            className={`aspect-square rounded-[--radius] text-xs font-bold flex flex-col items-center justify-center transition-all relative ${isSelected ? "bg-primary text-primary-foreground shadow-sm scale-105 z-10" :
                                                isAvailable ? "bg-primary/5 text-primary border border-primary/10" :
                                                    "bg-muted/10 text-muted-foreground hover:bg-muted/30"
                                                } ${day.isToday && !isSelected ? "ring-1 ring-primary/40 ring-offset-1" : ""}`}>
                                            {day.date}
                                            {isAvailable && !isSelected && <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary/40" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {leaves.length > 0 && (
                            <div className="bg-card border border-border/50 rounded-[--radius] p-5 shadow-sm">
                                <h4 className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-4">Active Leave Requests</h4>
                                <div className="space-y-2">
                                    {leaves.slice(0, 3).map(l => (
                                        <div key={l.id} className="flex items-center justify-between p-3 rounded-[--radius] bg-muted/20 border border-border/30">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Plane className="w-3.5 h-3.5 opacity-40" /></div>
                                                <div><p className="text-[11px] font-bold text-foreground">{l.startDate} — {l.endDate}</p><p className="text-[9px] text-muted-foreground font-medium">{l.reason || "System Generated"}</p></div>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-sm border ${l.status === "approved" ? "bg-green-500/5 text-green-600 border-green-500/10" : "bg-amber-500/5 text-amber-600 border-amber-500/10"}`}>
                                                {l.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                        <AnimatePresence mode="wait">
                            {selectedDate ? (
                                <motion.div key={selectedDate} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                    className="bg-card border border-border/50 rounded-[--radius] p-5 shadow-sm sticky top-24">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xs font-bold text-foreground italic">{new Date(selectedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</h3>
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter mt-0.5">Edit Time Slots</p>
                                        </div>
                                        <button onClick={() => toggleDayAvailability(selectedDate)}
                                            className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-sm border transition-all ${daySlot?.available ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>
                                            {daySlot?.available ? "AVAILABLE" : "OFF DAY"}
                                        </button>
                                    </div>
                                    {daySlot?.available && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {defaultHours.map(hour => {
                                                const active = daySlot?.hours?.includes(hour);
                                                const locked = isSlotLocked(selectedDate, hour);
                                                return (
                                                    <button key={hour} onClick={() => handleToggleHour(hour)} disabled={locked}
                                                        className={`px-2 py-2.5 rounded-[--radius] text-[10px] font-bold text-center border transition-all ${locked ? "bg-muted/50 border-border text-muted-foreground/30 cursor-not-allowed" :
                                                            active ? "bg-primary/5 border-primary text-primary shadow-inner" :
                                                                "bg-card border-border hover:border-primary/40 text-muted-foreground"
                                                            }`}>
                                                        {locked && <Lock className="w-2.5 h-2.5 inline mr-1" />}{hour}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="mt-8 p-3 bg-primary/5 rounded-[--radius] border border-primary/10 flex gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                        <p className="text-[9px] text-primary/70 font-bold leading-tight uppercase tracking-tighter">Slots auto-lock 2 hours prior to start time.</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-card border border-border/50 rounded-[--radius] p-10 text-center flex flex-col items-center justify-center min-h-[300px] border-dashed">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4"><Calendar className="w-6 h-6 text-muted-foreground/30" /></div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select a Date</p>
                                    <p className="text-[11px] text-muted-foreground/60 mt-1 max-w-[140px]">Pick a day on the calendar to configure your working slots.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showLeaveModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLeaveModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-card border border-border rounded-[--radius] p-6 shadow-2xl z-10">
                            <h3 className="font-bold text-base mb-6 tracking-tight">Request Time Off</h3>
                            <div className="space-y-4">
                                <div className="space-y-1.5"><label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Departure Date</label><input type="date" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} className="w-full h-11 px-4 bg-muted/30 border border-border rounded-[--radius] text-sm outline-none" /></div>
                                <div className="space-y-1.5"><label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Return Date</label><input type="date" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} className="w-full h-11 px-4 bg-muted/30 border border-border rounded-[--radius] text-sm outline-none" /></div>
                                <div className="space-y-1.5"><label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Primary Reason</label><textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)} placeholder="Emergency, Vacation, etc..." className="w-full h-20 px-4 py-3 bg-muted/30 border border-border rounded-[--radius] text-sm outline-none resize-none" /></div>
                                <Button onClick={handleLeaveSubmit} disabled={!leaveStart || !leaveEnd} className="w-full h-12 rounded-[--radius] font-bold text-sm bg-primary text-primary-foreground shadow-sm">SUBMIT FOR APPROVAL</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AvailabilityPage;
