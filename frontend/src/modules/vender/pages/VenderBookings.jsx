import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarRange, Search, MapPin, Clock, User, ChevronDown, ArrowRight,
    RefreshCw, CheckCircle, Users, AlertTriangle, Tag, Bell, BellOff, Zap, X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/user/components/ui/card";
import { Button } from "@/modules/user/components/ui/button";
import { Badge } from "@/modules/user/components/ui/badge";
import { Input } from "@/modules/user/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/user/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/user/components/ui/tabs";
import { useVenderAuth } from "@/modules/vender/contexts/VenderAuthContext";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const statusColors = {
    incoming: "bg-blue-100 text-blue-700 border-blue-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    "Pending": "bg-amber-100 text-amber-700 border-amber-200",
    accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
    travelling: "bg-indigo-100 text-indigo-700 border-indigo-200",
    arrived: "bg-purple-100 text-purple-700 border-purple-200",
    in_progress: "bg-violet-100 text-violet-700 border-violet-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    "Unassigned": "bg-orange-100 text-orange-700 border-orange-200",
};

export default function VenderBookings() {
    const { getAllBookings, getServiceProviders, assignSPToBooking, hydrated, isLoggedIn } = useVenderAuth();
    const [bookings, setBookings] = useState([]);
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [assignModal, setAssignModal] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState("");

    const load = async () => {
        try {
            if (!hydrated || !isLoggedIn) return;
            const [bks, sps] = await Promise.all([getAllBookings(), getServiceProviders()]);
            setBookings(Array.isArray(bks) ? bks : []);
            const sArr = Array.isArray(sps) ? sps : [];
            setProviders(sArr.filter(sp => sp.approvalStatus === "approved"));
        } catch {}
    };
    useEffect(() => { load(); }, [hydrated, isLoggedIn]);

    const filtered = bookings.filter(b => {
        const matchSearch = b.customerName?.toLowerCase().includes(search.toLowerCase()) || b.id?.includes(search) || b.serviceType?.toLowerCase().includes(search.toLowerCase());
        const status = (b.status || "").toLowerCase();

        let tabMatch = true;
        if (tab === "active") tabMatch = ["accepted", "travelling", "arrived", "in_progress"].includes(status);
        else if (tab === "pending") tabMatch = ["incoming", "pending", "unassigned"].includes(status);
        else if (tab === "completed") tabMatch = status === "completed";
        else if (tab === "cancelled") tabMatch = ["cancelled", "rejected"].includes(status);

        let typeMatch = true;
        if (typeFilter !== "all") {
            const bType = (b.bookingType || "instant").toLowerCase();
            typeMatch = bType.includes(typeFilter.toLowerCase());
        }

        return matchSearch && tabMatch && typeMatch;
    });

    const handleAssign = async () => {
        if (assignModal && selectedProvider) {
            await assignSPToBooking(assignModal.id, selectedProvider);
            await load();
            setAssignModal(null);
            setSelectedProvider("");
        }
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                        <CalendarRange className="h-7 w-7 text-primary" /> Booking Management
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Track and manage all bookings with service type info</p>
                </div>
                <Button onClick={load} variant="outline" className="gap-2 rounded-xl font-bold">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: "Total", val: bookings.length, color: "bg-blue-50 text-blue-600 border-blue-200" },
                    { label: "Active", val: bookings.filter(b => ["accepted", "travelling", "arrived", "in_progress"].includes((b.status || "").toLowerCase())).length, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                    { label: "Pending", val: bookings.filter(b => ["incoming", "pending"].includes((b.status || "").toLowerCase())).length, color: "bg-amber-50 text-amber-600 border-amber-200" },
                    { label: "Unassigned", val: bookings.filter(b => (b.status || "").toLowerCase() === "unassigned").length, color: "bg-orange-50 text-orange-600 border-orange-200" },
                    { label: "Completed", val: bookings.filter(b => (b.status || "").toLowerCase() === "completed").length, color: "bg-green-50 text-green-600 border-green-200" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                        className={`rounded-xl p-3 border ${s.color}`}>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{s.label}</p>
                        <p className="text-xl font-black mt-1">{s.val}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Tabs + Search */}
            <Tabs value={tab} onValueChange={setTab}>
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                    <TabsList className="bg-muted/50 rounded-xl p-1 flex-wrap h-auto">
                        <TabsTrigger value="all" className="rounded-lg text-xs font-bold">All</TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-lg text-xs font-bold">Pending</TabsTrigger>
                        <TabsTrigger value="active" className="rounded-lg text-xs font-bold">Active</TabsTrigger>
                        <TabsTrigger value="completed" className="rounded-lg text-xs font-bold">Done</TabsTrigger>
                        <TabsTrigger value="cancelled" className="rounded-lg text-xs font-bold">Cancelled</TabsTrigger>
                    </TabsList>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[160px] h-10 rounded-xl">
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
                        <Input placeholder="Search by name, ID, or service type..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl h-10" />
                    </div>
                </div>

                <TabsContent value={tab} className="mt-0">
                    {filtered.length === 0 ? (
                        <Card className="shadow-sm">
                            <CardContent className="py-16 text-center">
                                <CalendarRange className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm font-bold text-muted-foreground">No bookings found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                            {filtered.map((booking) => (
                                <motion.div key={booking.id} variants={item}>
                                    <Card className="shadow-sm hover:shadow-md transition-all duration-200">
                                        <CardContent className="p-4 md:p-5">
                                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                {/* Booking Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">#{booking.id}</span>
                                                        <Badge variant="outline" className={`text-[8px] font-black px-1.5 py-0 h-4 border ${statusColors[booking.status] || ""}`}>
                                                            {(booking.status || "").replace("_", " ")}
                                                        </Badge>
                                                        {booking.serviceType && (
                                                            <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0 h-4 bg-purple-50 text-purple-600 border-purple-200">
                                                                <Tag className="h-2.5 w-2.5 mr-0.5" />{booking.serviceType}
                                                            </Badge>
                                                        )}
                                                        {booking.bookingType && (
                                                            <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0 h-4 bg-blue-50 text-blue-600 border-blue-200">
                                                                <Tag className="h-2.5 w-2.5 mr-0.5" />{booking.bookingType}
                                                            </Badge>
                                                        )}
                                                        {booking.notificationStatus === "queued" && (
                                                            <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0 h-4 bg-yellow-50 text-yellow-600 border-yellow-200">
                                                                <BellOff className="h-2.5 w-2.5 mr-0.5" />Queued
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm font-bold flex items-center gap-2">
                                                        <User className="h-3.5 w-3.5 text-muted-foreground" /> {booking.customerName || "Customer"}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground font-medium">
                                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.slot?.time} • {booking.slot?.date}</span>
                                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {booking.address?.area || "N/A"}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {booking.items?.map((s, i) => (
                                                            <span key={i} className="text-[10px] font-semibold bg-muted px-2 py-0.5 rounded-md">{s.name}</span>
                                                        ))}
                                                        {booking.services?.map((s, i) => (
                                                            <span key={i} className="text-[10px] font-semibold bg-muted px-2 py-0.5 rounded-md">{s.name}</span>
                                                        ))}
                                                    </div>
                                                    {booking.assignedProvider && (
                                                        <p className="text-[9px] mt-1.5 text-emerald-600 font-bold flex items-center gap-1">
                                                            <Zap className="h-3 w-3" /> Assigned to: {booking.assignedProvider}
                                                        </p>
                                                    )}
                                                    {booking.notificationScheduledAt && (
                                                        <p className="text-[9px] mt-1 text-yellow-600 font-bold flex items-center gap-1">
                                                            <Bell className="h-3 w-3" /> Notification at: {booking.notificationScheduledAt}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Price + Actions */}
                                                <div className="flex md:flex-col items-center md:items-end gap-3">
                                                    <span className="text-lg font-black text-primary">₹{booking.totalAmount?.toLocaleString()}</span>
                                                    {["incoming", "pending", "Pending", "unassigned", "Unassigned"].includes(booking.status) && (
                                                        <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 rounded-lg text-[11px] font-bold gap-1" onClick={() => setAssignModal(booking)}>
                                                            <Users className="h-3.5 w-3.5" /> {booking.assignedProvider ? "Re-assign" : "Assign SP"}
                                                        </Button>
                                                    )}
                                                </div>
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
            <AnimatePresence>
                {assignModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setAssignModal(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-x-4 top-[20%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] z-50 bg-card rounded-2xl shadow-2xl border p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black">Assign Service Provider</h3>
                                <button onClick={() => setAssignModal(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
                            </div>
                            <div className="bg-muted/50 rounded-xl p-3 space-y-1">
                                <p className="text-xs font-bold">
                                    #{assignModal.id} • {assignModal.customerName} • ₹{assignModal.totalAmount}
                                </p>
                                {assignModal.serviceType && (
                                    <Badge variant="outline" className="text-[9px] bg-purple-50 text-purple-600 border-purple-200 mt-1"><Tag className="h-2.5 w-2.5 mr-1" />{assignModal.serviceType}</Badge>
                                )}
                            </div>
                            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder="Select a service provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    {providers.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.phone})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button className="flex-1 h-11 rounded-xl font-bold gap-2" onClick={handleAssign} disabled={!selectedProvider}>
                                    <CheckCircle className="h-4 w-4" /> Assign
                                </Button>
                                <Button variant="outline" className="h-11 rounded-xl font-bold" onClick={() => setAssignModal(null)}>Cancel</Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
