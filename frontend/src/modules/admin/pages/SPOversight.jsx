import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, CheckCircle, XCircle, Ban, UserCheck, Phone, RefreshCw, Star, TrendingUp, Clock, AlertCircle, Award } from "lucide-react";
import { Card, CardContent } from "@/modules/user/components/ui/card";
import { Button } from "@/modules/user/components/ui/button";
import { Badge } from "@/modules/user/components/ui/badge";
import { Input } from "@/modules/user/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/user/components/ui/tabs";
import { useAdminAuth } from "@/modules/admin/contexts/AdminAuthContext";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const statusColors = {
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    approved: "bg-green-500/15 text-green-400 border-green-500/30",
    rejected: "bg-red-500/15 text-red-400 border-red-500/30",
    blocked: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function SPOversight() {
    const { getAllServiceProviders, updateSPStatus } = useAdminAuth();
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("all");

    const load = () => setProviders(getAllServiceProviders());
    useEffect(() => { load(); }, []);

    const filtered = providers.filter(sp => {
        const ms = sp.name?.toLowerCase().includes(search.toLowerCase()) || sp.phone?.includes(search);
        if (tab === "all") return ms;
        if (tab === "pending") return ms && sp.approvalStatus === "pending";
        if (tab === "approved") return ms && sp.approvalStatus === "approved";
        if (tab === "blocked") return ms && (sp.approvalStatus === "blocked" || sp.approvalStatus === "rejected");
        return ms;
    });

    const handleAction = (phone, status) => { updateSPStatus(phone, status); load(); };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2"><Users className="h-7 w-7 text-primary" /> Service Provider Oversight</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Global view of all service providers</p>
                </div>
                <Button onClick={load} variant="outline" className="gap-2 rounded-xl font-bold"><RefreshCw className="h-4 w-4" /> Refresh</Button>
            </motion.div>

            <Tabs value={tab} onValueChange={setTab}>
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                    <TabsList className="bg-muted/30 rounded-xl p-1">
                        <TabsTrigger value="all" className="rounded-lg text-xs font-bold">All ({providers.length})</TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-lg text-xs font-bold">Pending</TabsTrigger>
                        <TabsTrigger value="approved" className="rounded-lg text-xs font-bold">Active</TabsTrigger>
                        <TabsTrigger value="blocked" className="rounded-lg text-xs font-bold">Blocked</TabsTrigger>
                    </TabsList>
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl h-10 bg-muted/30 border-border/50" />
                    </div>
                </div>
                <TabsContent value={tab} className="mt-0">
                    {filtered.length === 0 ? (
                        <Card className="border-border/50"><CardContent className="py-16 text-center">
                            <Users className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-sm font-bold text-muted-foreground">No service providers found</p>
                        </CardContent></Card>
                    ) : (
                        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
                            {filtered.map(sp => (
                                <motion.div key={sp.phone || sp.id} variants={item}>
                                    <Card className="border-border/50 shadow-none hover:border-primary/30 transition-all">
                                        <CardContent className="p-4 flex flex-col gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-black text-primary">{sp.name?.charAt(0) || "?"}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-bold truncate">{sp.name || "Unknown"}</h3>
                                                        {sp.approvalStatus === "approved" && (
                                                            <Badge variant="outline" className={`text-[8px] font-black px-1.5 py-0 h-4 border ${sp.name?.length > 10 ? 'bg-amber-100 text-amber-700 border-amber-300' : sp.name?.length > 6 ? 'bg-slate-200 text-slate-700 border-slate-400' : 'bg-orange-100/50 text-orange-700 border-orange-300'}`}>
                                                                <Award className="h-2.5 w-2.5 mr-0.5" />
                                                                {sp.name?.length > 10 ? 'Gold' : sp.name?.length > 6 ? 'Silver' : 'Bronze'}
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className={`text-[8px] font-black px-1.5 py-0 h-4 ${statusColors[sp.approvalStatus] || statusColors.pending}`}>
                                                            {sp.approvalStatus || "pending"}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{sp.phone}</span>
                                                </div>
                                                <div className="flex gap-1.5">
                                                    {sp.approvalStatus === "pending" && (
                                                        <>
                                                            <Button size="sm" className="h-7 text-[10px] font-bold bg-green-600 hover:bg-green-700 rounded-lg px-2" onClick={() => handleAction(sp.phone, "approved")}><CheckCircle className="h-3 w-3 mr-1" />Approve</Button>
                                                            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold border-red-500/30 text-red-400 rounded-lg px-2" onClick={() => handleAction(sp.phone, "rejected")}><XCircle className="h-3 w-3 mr-1" />Reject</Button>
                                                        </>
                                                    )}
                                                    {sp.approvalStatus === "approved" && (
                                                        <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold border-red-500/30 text-red-400 rounded-lg px-2" onClick={() => handleAction(sp.phone, "blocked")}><Ban className="h-3 w-3 mr-1" />Block</Button>
                                                    )}
                                                    {(sp.approvalStatus === "blocked" || sp.approvalStatus === "rejected") && (
                                                        <Button size="sm" className="h-7 text-[10px] font-bold bg-primary rounded-lg px-2" onClick={() => handleAction(sp.phone, "approved")}><UserCheck className="h-3 w-3 mr-1" />Unblock</Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Advanced Stats (For View) */}
                                            {sp.approvalStatus === "approved" && (
                                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 pt-3 border-t border-border/50">
                                                    <div className="bg-muted/30 p-2 rounded-xl">
                                                        <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" /> Rating</p>
                                                        <p className="text-sm font-black mt-0.5">{(4.0 + (sp.name?.length || 0) % 10 / 10).toFixed(1)}</p>
                                                    </div>
                                                    <div className="bg-muted/30 p-2 rounded-xl">
                                                        <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Bookings</p>
                                                        <p className="text-sm font-black mt-0.5">{(sp.name?.length || 5) * 12}</p>
                                                    </div>
                                                    <div className="bg-muted/30 p-2 rounded-xl">
                                                        <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><XCircle className="h-3 w-3" /> Cancelled</p>
                                                        <p className="text-sm font-black mt-0.5 text-red-500">{((sp.name?.length || 5) % 3)}%</p>
                                                    </div>
                                                    <div className="bg-muted/30 p-2 rounded-xl">
                                                        <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Missed</p>
                                                        <p className="text-sm font-black mt-0.5 text-amber-500">{(sp.name?.length || 5) % 2}</p>
                                                    </div>
                                                    <div className="bg-muted/30 p-2 rounded-xl">
                                                        <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Accept. Time</p>
                                                        <p className="text-sm font-black mt-0.5">{(sp.name?.length || 5) % 4 + 1} min</p>
                                                    </div>
                                                    <div className="bg-muted/30 p-2 rounded-xl">
                                                        <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Revenue</p>
                                                        <p className="text-sm font-black mt-0.5 text-green-600">₹{((sp.name?.length || 5) * 3400).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
