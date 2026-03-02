import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarRange, Search, MapPin, Clock, User, Users, RefreshCw, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/modules/user/components/ui/card";
import { Button } from "@/modules/user/components/ui/button";
import { Badge } from "@/modules/user/components/ui/badge";
import { Input } from "@/modules/user/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/user/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/user/components/ui/tabs";
import { useAdminAuth } from "@/modules/admin/contexts/AdminAuthContext";

const statusColors = {
    incoming: "bg-blue-500/15 text-blue-400", pending: "bg-amber-500/15 text-amber-400", accepted: "bg-emerald-500/15 text-emerald-400",
    travelling: "bg-indigo-500/15 text-indigo-400", arrived: "bg-purple-500/15 text-purple-400", in_progress: "bg-violet-500/15 text-violet-400",
    completed: "bg-green-500/15 text-green-400", cancelled: "bg-red-500/15 text-red-400", rejected: "bg-red-500/15 text-red-400",
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function BookingManagement() {
    const { getAllBookings, getAllServiceProviders, assignSPToBooking } = useAdminAuth();
    const [bookings, setBookings] = useState([]);
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("all");
    const [assignModal, setAssignModal] = useState(null);
    const [selectedSP, setSelectedSP] = useState("");

    const load = () => { setBookings(getAllBookings()); setProviders(getAllServiceProviders().filter(sp => sp.approvalStatus === "approved")); };
    useEffect(() => { load(); }, []);

    const filtered = bookings.filter(b => {
        const ms = b.customerName?.toLowerCase().includes(search.toLowerCase()) || b.id?.includes(search);
        if (tab === "all") return ms;
        if (tab === "active") return ms && ["accepted", "travelling", "arrived", "in_progress"].includes(b.status);
        if (tab === "pending") return ms && ["incoming", "pending"].includes(b.status);
        if (tab === "completed") return ms && b.status === "completed";
        return ms;
    });

    const handleAssign = () => {
        if (assignModal && selectedSP) { assignSPToBooking(assignModal.id, selectedSP); load(); setAssignModal(null); setSelectedSP(""); }
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2"><CalendarRange className="h-7 w-7 text-primary" /> Booking Management</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Global booking oversight</p>
                </div>
                <Button onClick={load} variant="outline" className="gap-2 rounded-xl font-bold"><RefreshCw className="h-4 w-4" /> Refresh</Button>
            </motion.div>

            <Tabs value={tab} onValueChange={setTab}>
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                    <TabsList className="bg-muted/30 rounded-xl p-1">
                        <TabsTrigger value="all" className="rounded-lg text-xs font-bold">All</TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-lg text-xs font-bold">Pending</TabsTrigger>
                        <TabsTrigger value="active" className="rounded-lg text-xs font-bold">Active</TabsTrigger>
                        <TabsTrigger value="completed" className="rounded-lg text-xs font-bold">Done</TabsTrigger>
                    </TabsList>
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl h-10 bg-muted/30 border-border/50" />
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
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black text-muted-foreground">#{b.id}</span>
                                                    <Badge variant="outline" className={`text-[8px] font-black px-1.5 py-0 h-4 border-0 ${statusColors[b.status] || ""}`}>{b.status?.replace("_", " ")}</Badge>
                                                </div>
                                                <p className="text-sm font-bold flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground" />{b.customerName}</p>
                                                <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-muted-foreground font-medium">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.slot?.time} • {b.slot?.date}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{b.address?.area}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-1.5">{b.services?.map((s, i) => <span key={i} className="text-[9px] font-semibold bg-muted/50 px-1.5 py-0.5 rounded">{s.name}</span>)}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-black text-primary">₹{b.totalAmount?.toLocaleString()}</span>
                                                {["incoming", "pending"].includes(b.status) && (
                                                    <Button size="sm" className="h-8 text-[10px] font-bold bg-primary rounded-lg gap-1" onClick={() => setAssignModal(b)}><Users className="h-3 w-3" />Assign</Button>
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

            {assignModal && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setAssignModal(null)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-x-4 top-[20%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] z-50 bg-card rounded-2xl border border-border p-6 space-y-4 shadow-2xl">
                        <h3 className="text-lg font-black">Assign SP to #{assignModal.id}</h3>
                        <Select value={selectedSP} onValueChange={setSelectedSP}>
                            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select a provider" /></SelectTrigger>
                            <SelectContent>{providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.phone})</SelectItem>)}</SelectContent>
                        </Select>
                        <div className="flex gap-2">
                            <Button className="flex-1 h-11 rounded-xl font-bold gap-2" onClick={handleAssign} disabled={!selectedSP}><CheckCircle className="h-4 w-4" />Assign</Button>
                            <Button variant="outline" className="h-11 rounded-xl font-bold" onClick={() => setAssignModal(null)}>Cancel</Button>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
