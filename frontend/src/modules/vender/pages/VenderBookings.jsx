import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarRange, Search, MapPin, Clock, User, ChevronDown, ArrowRight,
    RefreshCw, CheckCircle, Users, AlertTriangle, Tag, Bell, BellOff, Zap, X, Phone, LayoutGrid, IndianRupee, Percent,
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
    vendor_assigned: "bg-blue-100 text-blue-700 border-blue-200",
    admin_approved: "bg-green-100 text-green-700 border-green-200",
    user_accepted: "bg-teal-100 text-teal-700 border-teal-200",
    team_assigned: "bg-cyan-100 text-cyan-700 border-cyan-200",
    final_approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function VenderBookings() {
    const { getAllBookings, getServiceProviders, assignSPToBooking, hydrated, isLoggedIn,assignTeamToBooking } = useVenderAuth();
  
    const [bookings, setBookings] = useState([]);
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [assignModal, setAssignModal] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState("");
    const [selectedTeam, setSelectedTeam] = useState([]);
    const [customPrice, setCustomPrice] = useState(0);
    const [discountPrice, setDiscountPrice] = useState(0);
    // Team assignment modal (after user accepts)
    const [teamAssignModal, setTeamAssignModal] = useState(null);
    const [teamSelectedMembers, setTeamSelectedMembers] = useState([]);
    const [teamLeadMember, setTeamLeadMember] = useState("");

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
        else if (tab === "pending") tabMatch = ["incoming", "pending", "unassigned", "vendor_assigned", "user_accepted", "team_assigned"].includes(status);
        else if (tab === "completed") tabMatch = status === "completed";
        else if (tab === "cancelled") tabMatch = ["cancelled", "rejected"].includes(status);

        let typeMatch = true;
        if (typeFilter !== "all") {
            const bType = (b.bookingType || "instant").toLowerCase();
            typeMatch = bType.includes(typeFilter.toLowerCase());
        }

        return matchSearch && tabMatch && typeMatch;
    });

    // Step 1: Vendor sets price & discount price (NO team assignment yet)
    const handleSetPrice = () => {
        if (!assignModal) return;

        if (assignModal.bookingType === "customized" || assignModal.eventType) {
            if (customPrice <= 0) {
                alert("Please set a valid price.");
                return;
            }
            const payload = {
                maintainerProvider: "",
                teamMembers: [],
                price: parseFloat(customPrice),
                discountPrice: parseFloat(discountPrice) || 0,
                status: "vendor_assigned"
            };
            assignTeamToBooking(assignModal.id, payload);
        } else {
            if (selectedProvider) {
                assignSPToBooking(assignModal.id, selectedProvider);
            }
        }

        load();
        setAssignModal(null);
        setSelectedProvider("");
        setSelectedTeam([]);
        setCustomPrice(0);
        setDiscountPrice(0);
    };

    // Step 5: After user accepts, vendor assigns team + lead
    const handleAssignTeam = () => {
        if (!teamAssignModal) return;
        if (teamSelectedMembers.length === 0 || !teamLeadMember) {
            alert("Please select team members and a lead member.");
            return;
        }
        const payload = {
            maintainerProvider: teamLeadMember,
            teamMembers: teamSelectedMembers.map(id => {
                const p = providers.find(sp => (sp.id || sp.phone) === id);
                return { id: p.id || p.phone, name: p.name, serviceType: p.specialties?.join(", ") || "General" };
            }),
            price: teamAssignModal.totalAmount,
            discountPrice: teamAssignModal.discountPrice || 0,
            status: "team_assigned"
        };
        assignTeamToBooking(teamAssignModal.id, payload);
        load();
        setTeamAssignModal(null);
        setTeamSelectedMembers([]);
        setTeamLeadMember("");
    };

    const toggleTeamMember = (id, isForTeamAssign = false) => {
        const strId = String(id);
        if (isForTeamAssign) {
            setTeamSelectedMembers(prev => {
                const isRemoving = prev.includes(strId);
                const next = isRemoving ? prev.filter(i => i !== strId) : [...prev, strId];
                if (next.length === 1 && !isRemoving) setTeamLeadMember(strId);
                else if (isRemoving && teamLeadMember === strId) setTeamLeadMember(next.length > 0 ? next[0] : "");
                else if (next.length === 0) setTeamLeadMember("");
                return next;
            });
        } else {
            setSelectedTeam(prev => {
                const isRemoving = prev.includes(strId);
                const next = isRemoving ? prev.filter(i => i !== strId) : [...prev, strId];
                if (next.length === 1 && !isRemoving) setSelectedProvider(strId);
                else if (isRemoving && selectedProvider === strId) setSelectedProvider(next.length > 0 ? next[0] : "");
                else if (next.length === 0) setSelectedProvider("");
                return next;
            });
        }
    };

    const getButtonLabel = (booking) => {
        const st = (booking.status || "").toLowerCase();
        if (booking.bookingType === "customized" || booking.eventType) {
            if (st === "user_accepted") return "Assign Team";
            if (st === "vendor_assigned") return "Modify Price";
            if (booking.totalAmount > 0 && !booking.assignedProvider) return "Edit Price";
            return "Set Price";
        }
        return booking.assignedProvider ? "Re-assign" : "Assign";
    };

    const handleBookingAction = (booking) => {
        const st = (booking.status || "").toLowerCase();
        if ((booking.bookingType === "customized" || booking.eventType) && st === "user_accepted") {
            // Open team assignment modal
            setTeamAssignModal(booking);
            setTeamSelectedMembers(booking.teamMembers?.map(m => m.id) || []);
            setTeamLeadMember(booking.maintainProvider || "");
        } else {
            // Open price setting modal
            setAssignModal(booking);
            setCustomPrice(booking.totalAmount || 0);
            setDiscountPrice(booking.discountPrice || 0);
        }
    };

    const canShowAction = (booking) => {
        const st = (booking.status || "").toLowerCase();
        if (booking.bookingType === "customized" || booking.eventType) {
            return ["pending", "unassigned", "rejected", "vendor_assigned", "user_accepted"].includes(st);
        }
        return ["incoming", "pending", "Pending", "unassigned", "Unassigned", "rejected"].includes(booking.status);
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
                            <SelectItem value="instant">Booked</SelectItem>
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
                                                            {(booking.status || "").replace(/_/g, " ")}
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

                                                    {/* Price & Discount display */}
                                                    {(booking.bookingType === "customized" || booking.eventType) && booking.totalAmount > 0 && (
                                                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50">
                                                            <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                                <IndianRupee className="h-3 w-3" /> Price: <span className="text-foreground font-black">₹{booking.totalAmount?.toLocaleString()}</span>
                                                            </span>
                                                            {booking.discountPrice > 0 && (
                                                                <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                                                    <Percent className="h-3 w-3" /> Discount: <span className="font-black">₹{booking.discountPrice?.toLocaleString()}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {booking.assignedProvider && (
                                                        <p className="text-[9px] mt-1.5 text-emerald-600 font-bold flex items-center gap-1">
                                                            <Zap className="h-3 w-3" /> {(booking.bookingType === "customized" || booking.eventType) ? "Lead Member:" : "Assigned to:"} {booking.assignedProvider}
                                                        </p>
                                                    )}

                                                    {/* Team Display for Customized */}
                                                    {booking.teamMembers && booking.teamMembers.length > 0 && (
                                                        <div className="mt-2 space-y-1 py-2 border-t border-border/50">
                                                            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1">
                                                                <Users className="h-2.5 w-2.5" /> Team Assigned:
                                                            </p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {booking.teamMembers.map((m, i) => (
                                                                    <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 bg-muted rounded border border-border">
                                                                        {m.name} ({m.serviceType})
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price + Actions */}
                                                <div className="flex md:flex-col items-center md:items-end gap-3 md:min-w-[140px]">
                                                    <span className="text-xl font-black text-primary">₹{booking.totalAmount?.toLocaleString()}</span>
                                                    {canShowAction(booking) ? (
                                                        <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 rounded-lg text-[11px] font-bold gap-1" onClick={() => handleBookingAction(booking)}>
                                                            <Users className="h-3.5 w-3.5" /> 
                                                            {getButtonLabel(booking)}
                                                        </Button>
                                                    ) : booking.status === "vendor_assigned" ? (
                                                        <Badge variant="outline" className="h-8 px-3 rounded-lg bg-blue-50 text-blue-600 border-blue-200 font-bold cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => handleBookingAction(booking)}>Pending Admin ✎</Badge>
                                                    ) : booking.status === "admin_approved" ? (
                                                        <Badge variant="outline" className="h-8 px-3 rounded-lg bg-green-50 text-green-700 border-green-200 font-bold">Pending User</Badge>
                                                    ) : booking.status === "team_assigned" ? (
                                                        <Badge variant="outline" className="h-8 px-3 rounded-lg bg-cyan-50 text-cyan-700 border-cyan-200 font-bold">Pending Admin ✓</Badge>
                                                    ) : booking.status === "final_approved" ? (
                                                        <Badge variant="outline" className="h-8 px-3 rounded-lg bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">Live Booking</Badge>
                                                    ) : null}
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

            {/* ═══════ PRICE SETTING MODAL (Step 1 - Vendor sets price & discount) ═══════ */}
            <AnimatePresence>
                {assignModal && (
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
                            className="relative w-full max-w-[420px] bg-card rounded-[24px] shadow-2xl border border-border p-4 space-y-3 overflow-y-auto max-h-[90vh] scrollbar-hide"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black">
                                    {(assignModal.bookingType === "customized" || assignModal.eventType) ? "Set Pricing" : "Assign Service Provider"}
                                </h3>
                                <button onClick={() => setAssignModal(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-colors"><X className="h-4 w-4" /></button>
                            </div>
                            <div className="bg-muted/50 rounded-2xl p-3 space-y-2 border border-border/50 shadow-inner">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Enquiry Reference</p>
                                        <p className="text-sm font-black mt-0.5">#{assignModal.id}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] bg-purple-50 text-purple-600 border-purple-200"><Tag className="h-2.5 w-2.5 mr-1" />{assignModal.serviceType}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Customer</p>
                                        <p className="text-xs font-black">{assignModal.customerName}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground italic flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {assignModal.phone || "No phone"}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Group Size</p>
                                        <p className="text-xs font-black flex items-center gap-1.5 text-primary"><Users className="h-3 w-3" /> {assignModal.noOfPeople || "N/A"} People</p>
                                    </div>
                                </div>

                                {(assignModal.categoryName || assignModal.selectedServices) && (
                                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex flex-col gap-2">
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-purple-600 mb-1 flex items-center gap-1"><LayoutGrid className="h-3 w-3" /> Service Category:</p>
                                            <p className="text-xs font-bold">{assignModal.categoryName || assignModal.serviceType}</p>
                                        </div>
                                        {assignModal.selectedServices && (
                                            <div>
                                                <p className="text-[9px] font-black uppercase text-purple-600 mb-1">Services Needed:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {assignModal.selectedServices.map((s, idx) => (
                                                        <span key={idx} className="text-[9px] font-bold px-1.5 py-0.5 bg-white border border-purple-200 text-purple-700 rounded-md">
                                                            {s.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {assignModal.notes && (
                                    <div className="p-3 bg-white/50 rounded-xl border border-border/40">
                                        <p className="text-[9px] font-black uppercase text-pink-600 mb-1">Special Requirements:</p>
                                        <p className="text-[11px] font-semibold text-foreground italic leading-tight">"{assignModal.notes}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Customized Booking: Price & Discount Price Fields */}
                            {(assignModal.bookingType === "customized" || assignModal.eventType) && (
                                <div className="space-y-4 py-2 border-y border-border/50">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 flex items-center gap-1.5">
                                            <IndianRupee className="h-3 w-3 text-primary" /> Booking Price (₹)
                                        </label>
                                        <Input
                                            type="number"
                                            value={customPrice}
                                            onChange={(e) => setCustomPrice(e.target.value)}
                                            placeholder="Enter total price for user"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 flex items-center gap-1.5">
                                            <Percent className="h-3 w-3 text-green-600" /> Discount Price (₹)
                                        </label>
                                        <Input
                                            type="number"
                                            value={discountPrice}
                                            onChange={(e) => setDiscountPrice(e.target.value)}
                                            placeholder="Enter discount amount (optional)"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    {customPrice > 0 && (
                                        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase text-emerald-700">Final Price for User</span>
                                                <span className="text-lg font-black text-emerald-700">₹{(parseFloat(customPrice) - (parseFloat(discountPrice) || 0)).toLocaleString()}</span>
                                            </div>
                                            {parseFloat(discountPrice) > 0 && (
                                                <p className="text-[9px] text-emerald-600 mt-1 font-bold">
                                                    Original: ₹{parseFloat(customPrice).toLocaleString()} → Discount: ₹{parseFloat(discountPrice).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Regular Booking: Select Provider */}
                            {!(assignModal.bookingType === "customized" || assignModal.eventType) && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Select Service Provider</label>
                                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                        <SelectTrigger className="h-11 rounded-xl">
                                            <SelectValue placeholder="Select a professional" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {providers.map(p => (
                                                <SelectItem key={p.id || p.phone} value={String(p.id || p.phone)}>{p.name} ({p.phone})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button className="flex-1 h-11 rounded-xl font-bold gap-2" onClick={handleSetPrice} disabled={(assignModal.bookingType === "customized" || assignModal.eventType) ? customPrice <= 0 : !selectedProvider}>
                                    <CheckCircle className="h-4 w-4" /> {(assignModal.bookingType === "customized" || assignModal.eventType) ? "Submit Pricing" : "Assign"}
                                </Button>
                                <Button variant="outline" className="h-11 rounded-xl font-bold" onClick={() => setAssignModal(null)}>Cancel</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═══════ TEAM ASSIGNMENT MODAL (Step 5 - After user accepts) ═══════ */}
            <AnimatePresence>
                {teamAssignModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setTeamAssignModal(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-[420px] bg-card rounded-[24px] shadow-2xl border border-border p-4 space-y-3 overflow-y-auto max-h-[90vh] scrollbar-hide"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black">Assign Team Members</h3>
                                <button onClick={() => setTeamAssignModal(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-colors"><X className="h-4 w-4" /></button>
                            </div>

                            {/* Booking Quick Info */}
                            <div className="bg-muted/50 rounded-2xl p-3 space-y-2 border border-border/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Booking</p>
                                        <p className="text-sm font-black">#{teamAssignModal.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="text-[9px] bg-teal-50 text-teal-600 border-teal-200">User Accepted ✓</Badge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Customer</p>
                                        <p className="text-xs font-black">{teamAssignModal.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Price</p>
                                        <p className="text-xs font-black text-primary">₹{teamAssignModal.totalAmount?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Select Team Members */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Select Team Members</label>
                                <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                    {providers.map(p => {
                                        const pId = String(p.id || p.phone);
                                        return (
                                            <button
                                                key={pId}
                                                onClick={() => toggleTeamMember(pId, true)}
                                                className={`p-2 rounded-xl text-[10px] text-left border-2 transition-all ${teamSelectedMembers.includes(pId)
                                                    ? "border-primary bg-primary/5 font-bold"
                                                    : "border-border bg-muted/20 text-muted-foreground"
                                                    }`}
                                            >
                                                <p className="truncate">{p.name}</p>
                                                <p className="text-[8px] opacity-70 truncate">{p.specialties?.join(", ")}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Select Lead Member */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Lead Member (from Team)</label>
                                <Select value={teamLeadMember} onValueChange={setTeamLeadMember}>
                                    <SelectTrigger className="h-11 rounded-xl">
                                        <SelectValue placeholder="Pick Lead from Team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {providers.filter(p => teamSelectedMembers.includes(String(p.id || p.phone))).map(p => (
                                            <SelectItem key={p.id || p.phone} value={String(p.id || p.phone)}>{p.name} (Team)</SelectItem>
                                        ))}
                                        {teamSelectedMembers.length === 0 && (
                                            <p className="p-4 text-center text-xs text-muted-foreground font-bold italic opacity-50">Select team members above first</p>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button className="flex-1 h-11 rounded-xl font-bold gap-2" onClick={handleAssignTeam} disabled={teamSelectedMembers.length === 0 || !teamLeadMember}>
                                    <CheckCircle className="h-4 w-4" /> Assign Team
                                </Button>
                                <Button variant="outline" className="h-11 rounded-xl font-bold" onClick={() => setTeamAssignModal(null)}>Cancel</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
