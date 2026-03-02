import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    CalendarRange, Search, MapPin, Clock, User, ChevronDown, ArrowRight,
    RefreshCw, CheckCircle, Users, AlertTriangle,
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
    accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
    travelling: "bg-indigo-100 text-indigo-700 border-indigo-200",
    arrived: "bg-purple-100 text-purple-700 border-purple-200",
    in_progress: "bg-violet-100 text-violet-700 border-violet-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
};

export default function VenderBookings() {
    const { getAllBookings, getServiceProviders, assignSPToBooking } = useVenderAuth();
    const [bookings, setBookings] = useState([]);
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("all");
    const [assignModal, setAssignModal] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState("");

    const load = () => {
        setBookings(getAllBookings());
        setProviders(getServiceProviders().filter(sp => sp.approvalStatus === "approved"));
    };
    useEffect(() => { load(); }, []);

    const filtered = bookings.filter(b => {
        const matchSearch = b.customerName?.toLowerCase().includes(search.toLowerCase()) || b.id?.includes(search);
        if (tab === "all") return matchSearch;
        if (tab === "active") return matchSearch && ["accepted", "travelling", "arrived", "in_progress"].includes(b.status);
        if (tab === "pending") return matchSearch && ["incoming", "pending"].includes(b.status);
        if (tab === "completed") return matchSearch && b.status === "completed";
        if (tab === "cancelled") return matchSearch && ["cancelled", "rejected"].includes(b.status);
        return matchSearch;
    });

    const handleAssign = () => {
        if (assignModal && selectedProvider) {
            assignSPToBooking(assignModal.id, selectedProvider);
            load();
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
                    <p className="text-sm text-muted-foreground font-medium mt-1">Track and manage all bookings</p>
                </div>
                <Button onClick={load} variant="outline" className="gap-2 rounded-xl font-bold">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Total", val: bookings.length, color: "bg-blue-50 text-blue-600" },
                    { label: "Active", val: bookings.filter(b => ["accepted", "travelling", "arrived", "in_progress"].includes(b.status)).length, color: "bg-emerald-50 text-emerald-600" },
                    { label: "Pending", val: bookings.filter(b => ["incoming", "pending"].includes(b.status)).length, color: "bg-amber-50 text-amber-600" },
                    { label: "Completed", val: bookings.filter(b => b.status === "completed").length, color: "bg-green-50 text-green-600" },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                        className={`rounded-xl p-3 ${s.color} border border-current/10`}>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{s.label}</p>
                        <p className="text-xl font-black mt-1">{s.val}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Tabs + Search */}
            <Tabs value={tab} onValueChange={setTab}>
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                    <TabsList className="bg-muted/50 rounded-xl p-1">
                        <TabsTrigger value="all" className="rounded-lg text-xs font-bold">All</TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-lg text-xs font-bold">Pending</TabsTrigger>
                        <TabsTrigger value="active" className="rounded-lg text-xs font-bold">Active</TabsTrigger>
                        <TabsTrigger value="completed" className="rounded-lg text-xs font-bold">Done</TabsTrigger>
                        <TabsTrigger value="cancelled" className="rounded-lg text-xs font-bold">Cancelled</TabsTrigger>
                    </TabsList>
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search booking ID or customer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl h-10" />
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
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">#{booking.id}</span>
                                                        <Badge variant="outline" className={`text-[8px] font-black px-1.5 py-0 h-4 border ${statusColors[booking.status] || ""}`}>
                                                            {booking.status?.replace("_", " ")}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-sm font-bold flex items-center gap-2">
                                                        <User className="h-3.5 w-3.5 text-muted-foreground" /> {booking.customerName}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground font-medium">
                                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.slot?.time} • {booking.slot?.date}</span>
                                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {booking.address?.area || "N/A"}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {booking.services?.map((s, i) => (
                                                            <span key={i} className="text-[10px] font-semibold bg-muted px-2 py-0.5 rounded-md">{s.name}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Price + Actions */}
                                                <div className="flex md:flex-col items-center md:items-end gap-3">
                                                    <span className="text-lg font-black text-primary">₹{booking.totalAmount?.toLocaleString()}</span>
                                                    {["incoming", "pending"].includes(booking.status) && (
                                                        <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 rounded-lg text-[11px] font-bold gap-1" onClick={() => setAssignModal(booking)}>
                                                            <Users className="h-3.5 w-3.5" /> Assign SP
                                                        </Button>
                                                    )}
                                                    {booking.assignedProvider && (
                                                        <span className="text-[10px] font-bold text-muted-foreground">Assigned: {booking.assignedProvider}</span>
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
            {assignModal && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setAssignModal(null)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="fixed inset-x-4 top-[20%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] z-50 bg-card rounded-2xl shadow-2xl border p-6 space-y-4"
                    >
                        <h3 className="text-lg font-black">Assign Service Provider</h3>
                        <p className="text-xs text-muted-foreground font-medium">
                            Booking #{assignModal.id} • {assignModal.customerName} • ₹{assignModal.totalAmount}
                        </p>
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
        </div>
    );
}
