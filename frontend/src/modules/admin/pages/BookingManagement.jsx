import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarRange, Search, MapPin, Clock, User, Users, RefreshCw, CheckCircle, Bell, BellOff, Settings2, Tag, Zap, X } from "lucide-react";
import { Card, CardContent } from "@/modules/user/components/ui/card";
import { Button } from "@/modules/user/components/ui/button";
import { Badge } from "@/modules/user/components/ui/badge";
import { Input } from "@/modules/user/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/user/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/user/components/ui/tabs";
import { useAdminAuth } from "@/modules/admin/contexts/AdminAuthContext";
import { useUserModuleData } from "@/modules/user/contexts/UserModuleDataContext";

const statusColors = {
    incoming: "bg-blue-500/15 text-blue-600", pending: "bg-amber-500/15 text-amber-600", "Pending": "bg-amber-500/15 text-amber-600",
    accepted: "bg-emerald-500/15 text-emerald-600", travelling: "bg-indigo-500/15 text-indigo-600",
    arrived: "bg-purple-500/15 text-purple-600", in_progress: "bg-violet-500/15 text-violet-600",
    completed: "bg-green-500/15 text-green-600", cancelled: "bg-red-500/15 text-red-600",
    rejected: "bg-red-500/15 text-red-600", "Unassigned": "bg-orange-500/15 text-orange-600",
};

const notifColors = {
    immediate: "bg-green-100 text-green-700 border-green-200",
    queued: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function BookingManagement() {
    const { getAllBookings, getAllServiceProviders, assignSPToBooking } = useAdminAuth();
    const { officeSettings, setOfficeSettings, providers: moduleProviders } = useUserModuleData();
    const [bookings, setBookings] = useState([]);
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [assignModal, setAssignModal] = useState(null);
    const [selectedSP, setSelectedSP] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [tempSettings, setTempSettings] = useState(officeSettings);

    const load = async () => {
        try {
            const bks = await getAllBookings();
            setBookings(Array.isArray(bks) ? bks : []);
            const spRaw = await getAllServiceProviders();
            const spFromDb = Array.isArray(spRaw) ? spRaw.filter(sp => sp.approvalStatus === "approved") : [];
            const allSPs = spFromDb.length > 0 ? spFromDb : (moduleProviders || []);
            setProviders(allSPs);
        } catch {
            setBookings([]);
            setProviders(moduleProviders || []);
        }
    };
    useEffect(() => { load(); }, []);

    const filtered = bookings.filter(b => {
        const ms = b.customerName?.toLowerCase().includes(search.toLowerCase()) || b.id?.includes(search) || b.serviceType?.toLowerCase().includes(search.toLowerCase());
        const status = (b.status || "").toLowerCase();

        let tabMatch = true;
        if (tab === "active") tabMatch = ["accepted", "travelling", "arrived", "in_progress"].includes(status);
        else if (tab === "pending") tabMatch = ["incoming", "pending", "unassigned"].includes(status);
        else if (tab === "completed") tabMatch = status === "completed";

        let typeMatch = true;
        if (typeFilter !== "all") {
            const bType = (b.bookingType || "instant").toLowerCase();
            typeMatch = bType.includes(typeFilter.toLowerCase());
        }

        return ms && tabMatch && typeMatch;
    });

    const handleAssign = () => {
        if (assignModal && selectedSP) {
            assignSPToBooking(assignModal.id, selectedSP);
            load();
            setAssignModal(null);
            setSelectedSP("");
        }
    };

    const handleSaveSettings = () => {
        setOfficeSettings(tempSettings);
        setShowSettings(false);
    };

    const unassignedCount = bookings.filter(b => (b.status || "").toLowerCase() === "unassigned").length;
    const queuedCount = bookings.filter(b => b.notificationStatus === "queued").length;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                        <CalendarRange className="h-7 w-7 text-primary" /> Booking Management
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Global booking oversight • Auto-assignment & notifications</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => { setTempSettings(officeSettings); setShowSettings(true); }} variant="outline" className="gap-2 rounded-xl font-bold">
                        <Settings2 className="h-4 w-4" /> Office Hours
                    </Button>
                    <Button onClick={load} variant="outline" className="gap-2 rounded-xl font-bold">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: "Total", val: bookings.length, color: "bg-blue-50 text-blue-600 border-blue-200" },
                    { label: "Active", val: bookings.filter(b => ["accepted", "travelling", "arrived", "in_progress"].includes((b.status || "").toLowerCase())).length, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                    { label: "Pending", val: bookings.filter(b => ["incoming", "pending"].includes((b.status || "").toLowerCase())).length, color: "bg-amber-50 text-amber-600 border-amber-200" },
                    { label: "Unassigned", val: unassignedCount, color: "bg-orange-50 text-orange-600 border-orange-200" },
                    { label: "Queued Notifs", val: queuedCount, color: "bg-yellow-50 text-yellow-600 border-yellow-200" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                        className={`rounded-xl p-3 border ${s.color}`}>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{s.label}</p>
                        <p className="text-xl font-black mt-1">{s.val}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Office Hours Banner */}
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-primary">Office Hours: {officeSettings.startTime} - {officeSettings.endTime}</p>
                    <p className="text-[10px] text-muted-foreground">Bookings placed outside these hours will queue SP notifications until next business start.</p>
                </div>
                <Badge variant="outline" className={`text-[9px] font-bold shrink-0 ${officeSettings.autoAssign ? 'border-green-200 text-green-600 bg-green-50' : 'border-red-200 text-red-600 bg-red-50'}`}>
                    {officeSettings.autoAssign ? "Auto-Assign ON" : "Manual Only"}
                </Badge>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                    <TabsList className="bg-muted/30 rounded-xl p-1 flex-wrap h-auto">
                        <TabsTrigger value="all" className="rounded-lg text-xs font-bold">All</TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-lg text-xs font-bold">Pending / Unassigned</TabsTrigger>
                        <TabsTrigger value="active" className="rounded-lg text-xs font-bold">Active</TabsTrigger>
                        <TabsTrigger value="completed" className="rounded-lg text-xs font-bold">Done</TabsTrigger>
                    </TabsList>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[160px] h-10 rounded-xl bg-muted/30 border-border/50">
                            <SelectValue placeholder="Booking Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="instant">Instant</SelectItem>
                            <SelectItem value="prebooking">Pre-booking</SelectItem>
                            <SelectItem value="customized">Customized</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by name, ID, or service type..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl h-10 bg-muted/30 border-border/50" />
                    </div>
                </div>
                <TabsContent value={tab} className="mt-0">
                    {filtered.length === 0 ? (
                        <Card className="border-border/50"><CardContent className="py-16 text-center">
                            <CalendarRange className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-sm font-bold text-muted-foreground">No bookings found</p>
                        </CardContent></Card>
                    ) : (
                        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
                            {filtered.map(b => (
                                <motion.div key={b.id} variants={item}>
                                    <Card className="border-border/50 shadow-none hover:border-primary/30 transition-all">
                                        <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="text-[10px] font-black text-muted-foreground">#{b.id}</span>
                                                    <Badge variant="outline" className={`text-[8px] font-black px-1.5 py-0 h-4 border-0 ${statusColors[b.status] || ""}`}>
                                                        {(b.status || "").replace("_", " ")}
                                                    </Badge>
                                                    {b.serviceType && (
                                                        <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0 h-4 bg-purple-50 text-purple-600 border-purple-200">
                                                            <Tag className="h-2.5 w-2.5 mr-0.5" />{b.serviceType}
                                                        </Badge>
                                                    )}
                                                    {b.bookingType && (
                                                        <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0 h-4 bg-blue-50 text-blue-600 border-blue-200">
                                                            <Tag className="h-2.5 w-2.5 mr-0.5" />{b.bookingType}
                                                        </Badge>
                                                    )}
                                                    {b.notificationStatus && (
                                                        <Badge variant="outline" className={`text-[8px] font-bold px-1.5 py-0 h-4 border ${notifColors[b.notificationStatus] || ""}`}>
                                                            {b.notificationStatus === "queued" ? <><BellOff className="h-2.5 w-2.5 mr-0.5" />Queued</> : <><Bell className="h-2.5 w-2.5 mr-0.5" />Sent</>}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground" />{b.customerName || "Customer"}</p>
                                                <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-muted-foreground font-medium">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.slot?.time} • {b.slot?.date}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{b.address?.area}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {b.items?.map((s, i) => <span key={i} className="text-[9px] font-semibold bg-muted/50 px-1.5 py-0.5 rounded">{s.name}</span>)}
                                                    {b.services?.map((s, i) => <span key={i} className="text-[9px] font-semibold bg-muted/50 px-1.5 py-0.5 rounded">{s.name}</span>)}
                                                </div>
                                                {b.notificationScheduledAt && (
                                                    <p className="text-[9px] mt-1 text-yellow-600 font-bold flex items-center gap-1">
                                                        <BellOff className="h-3 w-3" /> SP notification scheduled: {b.notificationScheduledAt}
                                                    </p>
                                                )}
                                                {b.assignedProvider && (
                                                    <p className="text-[9px] mt-1 text-emerald-600 font-bold flex items-center gap-1">
                                                        <Zap className="h-3 w-3" /> Auto-assigned to: {b.assignedProvider}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-black text-primary">₹{b.totalAmount?.toLocaleString()}</span>
                                                {["incoming", "pending", "Pending", "unassigned", "Unassigned"].includes(b.status) && (
                                                    <Button size="sm" className="h-8 text-[10px] font-bold bg-primary rounded-lg gap-1" onClick={() => setAssignModal(b)}>
                                                        <Users className="h-3 w-3" />{b.assignedProvider ? "Re-assign" : "Assign"}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Assign SP Modal */}
            {assignModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setAssignModal(null)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg md:w-[480px] bg-card rounded-[32px] border border-border p-8 space-y-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight">Assign Service Provider</h3>
                            <button onClick={() => setAssignModal(null)} className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="bg-muted/50 rounded-2xl p-4 space-y-2 border border-border/50">
                            <p className="text-sm font-bold">Booking #{assignModal.id}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">{assignModal.customerName}</p>
                                <span className="text-sm font-black text-primary">₹{assignModal.totalAmount?.toLocaleString()}</span>
                            </div>
                            {assignModal.serviceType && (
                                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 mt-1 uppercase tracking-wider font-black px-2 py-0.5">
                                    <Tag className="h-3 w-3 mr-1.5" />{assignModal.serviceType}
                                </Badge>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Select Professional</label>
                            <Select value={selectedSP} onValueChange={setSelectedSP}>
                                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border/50 focus:ring-primary/20 transition-all">
                                    <SelectValue placeholder="Pick a service provider" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {providers.length > 0 ? providers.map(p => (
                                        <SelectItem key={p.id || p.phone} value={p.id || p.phone} className="rounded-lg">
                                            <div className="flex flex-col py-0.5">
                                                <span className="font-bold text-sm">{p.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{p.phone} {p.specialties ? `• ${p.specialties.join(", ")}` : ""}</span>
                                            </div>
                                        </SelectItem>
                                    )) : <p className="p-4 text-center text-xs text-muted-foreground">No providers available</p>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold border-border/50" onClick={() => setAssignModal(null)}>Cancel</Button>
                            <Button className="flex-2 h-12 rounded-2xl font-bold gap-2 bg-black text-white hover:bg-black/90 shadow-xl shadow-black/10" onClick={handleAssign} disabled={!selectedSP}>
                                <CheckCircle className="h-5 w-5" />Confirm Assignment
                            </Button>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}

            {/* Office Hours Settings Modal */}
            {showSettings && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-xl md:w-[540px] bg-card rounded-[40px] border border-border p-8 lg:p-10 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black flex items-center gap-3 tracking-tight"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Settings2 className="h-5 w-5 text-primary" /></div> Office Hours</h3>
                            <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"><X className="h-5 w-5" /></button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <p className="text-xs text-primary font-bold leading-relaxed">
                                    Set your business hours. Bookings outside these hours will queue notifications for providers until the next business day starts.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 block">Starts At</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input type="time" value={tempSettings.startTime} onChange={e => setTempSettings({ ...tempSettings, startTime: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border/50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 block">Closes At</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input type="time" value={tempSettings.endTime} onChange={e => setTempSettings({ ...tempSettings, endTime: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border/50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-muted/20 border border-border/30 rounded-3xl p-5 hover:bg-muted/30 transition-colors">
                                <div className="flex-1 pr-4">
                                    <p className="text-sm font-black tracking-tight">Auto-Assignment</p>
                                    <p className="text-[11px] text-muted-foreground mt-1 font-medium leading-relaxed">Automatically assign new bookings to the nearest available provider based on specialty.</p>
                                </div>
                                <button onClick={() => setTempSettings({ ...tempSettings, autoAssign: !tempSettings.autoAssign })}
                                    className={`w-14 h-8 rounded-full transition-all duration-300 relative p-1 ${tempSettings.autoAssign ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-muted-foreground/30'}`}>
                                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${tempSettings.autoAssign ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 block">Off-Hours Message</label>
                                <textarea rows={2} value={tempSettings.notificationMessage || ""} onChange={e => setTempSettings({ ...tempSettings, notificationMessage: e.target.value })}
                                    className="w-full px-5 py-4 bg-muted/30 border border-border/50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all resize-none"
                                    placeholder="Message shown to customers..." />
                            </div>
                        </div>

                        <Button className="w-full h-14 rounded-2xl font-black text-sm tracking-widest uppercase bg-black text-white hover:bg-black/90 shadow-2xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-98" onClick={handleSaveSettings}>
                            Update Business Settings
                        </Button>
                    </motion.div>
                </div>,
                document.body
            )}
        </div>
    );
}
