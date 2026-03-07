import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users, CalendarRange, IndianRupee, TrendingUp, AlertTriangle,
    ArrowUpRight, CheckCircle, Clock, UserCheck, Shield, Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/modules/user/components/ui/card";
import { Button } from "@/modules/user/components/ui/button";
import { Badge } from "@/modules/user/components/ui/badge";
import { Link } from "react-router-dom";
import { useVenderAuth } from "@/modules/vender/contexts/VenderAuthContext";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function VenderDashboard() {
    const { getServiceProviders, getAllBookings, getSOSAlerts, vendor } = useVenderAuth();
    const [stats, setStats] = useState({ sps: 0, pendingSPs: 0, bookings: 0, activeBookings: 0, revenue: 0, sosAlerts: 0 });

    const [topSPs, setTopSPs] = useState([]);
    useEffect(() => {
        const sps = getServiceProviders();
        const bookings = getAllBookings();
        const sos = getSOSAlerts();
        const feedback = JSON.parse(localStorage.getItem('muskan-feedback') || '[]');

        setStats({
            sps: sps.length,
            pendingSPs: sps.filter(s => s.approvalStatus === "pending").length,
            bookings: bookings.length,
            activeBookings: bookings.filter(b => ["accepted", "travelling", "arrived", "in_progress"].includes(b.status)).length,
            revenue: bookings.filter(b => b.status === "completed").reduce((sum, b) => sum + (b.totalAmount || 0), 0),
            sosAlerts: sos.filter(s => s.status !== "resolved").length,
        });

        // Calculate top SPs
        const spRatings = sps.map(sp => {
            const spFeedback = feedback.filter(f => (f.providerName === sp.name || f.assignedProvider === sp.id) && f.type === 'customer_to_provider');
            const rating = spFeedback.length > 0 ? (spFeedback.reduce((a, b) => a + b.rating, 0) / spFeedback.length) : 0;
            return { ...sp, rating };
        }).sort((a, b) => b.rating - a.rating).slice(0, 3);
        setTopSPs(spRatings);
    }, []);

    const statCards = [
        { title: "Service Providers", value: stats.sps, icon: Users, color: "emerald", badge: stats.pendingSPs > 0 ? `${stats.pendingSPs} pending` : null, link: "/vender/service-providers" },
        { title: "Total Bookings", value: stats.bookings, icon: CalendarRange, color: "blue", badge: stats.activeBookings > 0 ? `${stats.activeBookings} active` : null, link: "/vender/bookings" },
        { title: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: "purple", link: "/vender/payouts" },
        { title: "SOS Alerts", value: stats.sosAlerts, icon: AlertTriangle, color: stats.sosAlerts > 0 ? "red" : "green", link: "/vender/sos" },
    ];

    const colorMap = {
        emerald: { bg: "bg-emerald-100", text: "text-emerald-600", ring: "ring-emerald-100", gradient: "from-white to-emerald-50/40" },
        blue: { bg: "bg-blue-100", text: "text-blue-600", ring: "ring-blue-100", gradient: "from-white to-blue-50/40" },
        purple: { bg: "bg-purple-100", text: "text-purple-600", ring: "ring-purple-100", gradient: "from-white to-purple-50/40" },
        red: { bg: "bg-red-100", text: "text-red-600", ring: "ring-red-100", gradient: "from-white to-red-50/40" },
        green: { bg: "bg-green-100", text: "text-green-600", ring: "ring-green-100", gradient: "from-white to-green-50/40" },
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground font-medium">
                    Overview for <span className="text-primary font-bold">{vendor?.city || "Your City"}</span>
                </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    const colors = colorMap[stat.color];
                    return (
                        <motion.div key={stat.title} variants={item}>
                            <Link to={stat.link}>
                                <Card className={`border-none shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br ${colors.gradient} cursor-pointer group`}>
                                    <CardContent className="p-4 md:p-6">
                                        <div className="flex flex-col gap-3">
                                            <div className={`h-10 w-10 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className={`h-5 w-5 ${colors.text}`} />
                                            </div>
                                            <div>
                                                <div className="text-xl md:text-2xl font-black tracking-tight">{stat.value}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                                                    {stat.badge && (
                                                        <Badge variant="outline" className="text-[8px] font-black px-1.5 py-0 h-4 border-primary/30 text-primary">
                                                            {stat.badge}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Quick Actions + Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                            <CardDescription>Manage your city operations</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <Button asChild className="w-full justify-between h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold">
                                <Link to="/vender/service-providers">
                                    <span className="flex items-center gap-2"><UserCheck className="h-4 w-4" /> Review Pending SPs</span>
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-between h-12 rounded-xl font-bold">
                                <Link to="/vender/bookings">
                                    <span className="flex items-center gap-2"><CalendarRange className="h-4 w-4 text-primary" /> Manage Bookings</span>
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-between h-12 rounded-xl font-bold">
                                <Link to="/vender/payouts">
                                    <span className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-primary" /> View Payouts</span>
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Rated SPs */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Top Performing SPs</CardTitle>
                            <CardDescription>Highest rated providers this month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topSPs.length > 0 ? topSPs.map((sp, i) => (
                                    <div key={i} className="flex items-center gap-4 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                            {sp.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{sp.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} className={`h-2.5 w-2.5 ${s <= sp.rating ? "text-amber-500 fill-amber-500" : "text-slate-200"}`} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-bold">{sp.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-black">TOP PRO</Badge>
                                    </div>
                                )) : (
                                    <p className="text-sm text-center text-muted-foreground py-4">No performance data yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
