import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users, CalendarRange, IndianRupee, TrendingUp, AlertTriangle,
    ArrowUpRight, CheckCircle, Clock, UserCheck, Shield,
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

    useEffect(() => {
        const sps = getServiceProviders();
        const bookings = getAllBookings();
        const sos = getSOSAlerts();
        setStats({
            sps: sps.length,
            pendingSPs: sps.filter(s => s.approvalStatus === "pending").length,
            bookings: bookings.length,
            activeBookings: bookings.filter(b => ["accepted", "travelling", "arrived", "in_progress"].includes(b.status)).length,
            revenue: bookings.filter(b => b.status === "completed").reduce((sum, b) => sum + (b.totalAmount || 0), 0),
            sosAlerts: sos.filter(s => s.status !== "resolved").length,
        });
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

                {/* Recent Activity */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
                            <CardDescription>Latest updates from your city</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { icon: CheckCircle, text: "SP 'Priya K.' completed Bridal Makeup", time: "2 min ago", color: "text-green-500" },
                                    { icon: Clock, text: "New SP registration from 'Anita S.'", time: "15 min ago", color: "text-blue-500" },
                                    { icon: Shield, text: "Booking #PB1001 reassigned successfully", time: "1 hr ago", color: "text-purple-500" },
                                    { icon: TrendingUp, text: "Daily revenue target reached: ₹12,500", time: "3 hrs ago", color: "text-emerald-500" },
                                ].map((activity, i) => {
                                    const AIcon = activity.icon;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.08 }}
                                            className="flex items-center gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0"
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                <AIcon className={`h-4 w-4 ${activity.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-semibold text-foreground truncate">{activity.text}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium">{activity.time}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
