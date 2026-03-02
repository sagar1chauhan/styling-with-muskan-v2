import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Store, CalendarRange, IndianRupee, TrendingUp, TrendingDown, UserPlus, ShieldAlert, ArrowUpRight, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/modules/user/components/ui/card";
import { Button } from "@/modules/user/components/ui/button";
import { Badge } from "@/modules/user/components/ui/badge";
import { Link } from "react-router-dom";
import { useAdminAuth } from "@/modules/admin/contexts/AdminAuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const revenueData = [
    { month: "Jan", revenue: 45000, commission: 6750 },
    { month: "Feb", revenue: 62000, commission: 9300 },
    { month: "Mar", revenue: 58000, commission: 8700 },
    { month: "Apr", revenue: 73000, commission: 10950 },
    { month: "May", revenue: 81000, commission: 12150 },
    { month: "Jun", revenue: 95000, commission: 14250 },
];

const bookingTrend = [
    { day: "Mon", bookings: 28 }, { day: "Tue", bookings: 35 }, { day: "Wed", bookings: 42 },
    { day: "Thu", bookings: 38 }, { day: "Fri", bookings: 55 }, { day: "Sat", bookings: 68 }, { day: "Sun", bookings: 45 },
];

export default function AdminDashboard() {
    const { getAllVendors, getAllServiceProviders, getAllBookings, getUserBookings, getSOSAlerts, admin } = useAdminAuth();
    const [stats, setStats] = useState({});

    useEffect(() => {
        const vendors = getAllVendors();
        const sps = getAllServiceProviders();
        const providerBookings = getAllBookings();
        const userBookings = getUserBookings();
        const sos = getSOSAlerts();
        const allBookings = [...providerBookings, ...userBookings];
        const completed = providerBookings.filter(b => b.status === "completed");
        const cancelled = providerBookings.filter(b => ["cancelled", "rejected"].includes(b.status));

        setStats({
            totalVendors: vendors.length,
            totalSPs: sps.length,
            activeSPs: sps.filter(sp => sp.approvalStatus === "approved").length,
            pendingSPs: sps.filter(sp => sp.approvalStatus === "pending").length,
            totalBookings: providerBookings.length,
            activeBookings: providerBookings.filter(b => ["accepted", "travelling", "arrived", "in_progress"].includes(b.status)).length,
            totalRevenue: completed.reduce((s, b) => s + (b.totalAmount || 0), 0),
            commissionEarned: Math.round(completed.reduce((s, b) => s + (b.totalAmount || 0), 0) * 0.15),
            cancellationRate: providerBookings.length > 0 ? Math.round((cancelled.length / providerBookings.length) * 100) : 0,
            customerCount: new Set(providerBookings.map(b => b.customerId)).size,
            sosAlerts: sos.filter(s => s.status !== "resolved").length,
        });
    }, []);

    const statCards = [
        { title: "Total Revenue", value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: "from-indigo-500/20 to-indigo-500/5", iconBg: "bg-indigo-500/20 text-indigo-400", trend: "+18%", up: true },
        { title: "Commission Earned", value: `₹${(stats.commissionEarned || 0).toLocaleString()}`, icon: Percent, color: "from-purple-500/20 to-purple-500/5", iconBg: "bg-purple-500/20 text-purple-400", trend: "+12%", up: true },
        { title: "Total Bookings", value: stats.totalBookings || 0, icon: CalendarRange, color: "from-blue-500/20 to-blue-500/5", iconBg: "bg-blue-500/20 text-blue-400", badge: stats.activeBookings ? `${stats.activeBookings} active` : null },
        { title: "Active SPs", value: stats.activeSPs || 0, icon: Users, color: "from-emerald-500/20 to-emerald-500/5", iconBg: "bg-emerald-500/20 text-emerald-400", badge: stats.pendingSPs ? `${stats.pendingSPs} pending` : null },
        { title: "Vendors", value: stats.totalVendors || 0, icon: Store, color: "from-teal-500/20 to-teal-500/5", iconBg: "bg-teal-500/20 text-teal-400" },
        { title: "Customers", value: stats.customerCount || 0, icon: UserPlus, color: "from-pink-500/20 to-pink-500/5", iconBg: "bg-pink-500/20 text-pink-400", trend: "+25%", up: true },
        { title: "Cancellation Rate", value: `${stats.cancellationRate || 0}%`, icon: TrendingDown, color: "from-red-500/20 to-red-500/5", iconBg: "bg-red-500/20 text-red-400", trend: stats.cancellationRate > 15 ? "High" : "Normal", up: false },
        { title: "SOS Alerts", value: stats.sosAlerts || 0, icon: ShieldAlert, color: stats.sosAlerts > 0 ? "from-red-500/20 to-red-500/5" : "from-green-500/20 to-green-500/5", iconBg: stats.sosAlerts > 0 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400" },
    ];

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Global overview of Styling with Muskan</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div key={stat.title} variants={item}>
                            <Card className={`border-border/50 shadow-none bg-gradient-to-br ${stat.color} hover:border-primary/30 transition-all duration-300 cursor-default`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`h-9 w-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        {stat.trend && (
                                            <span className={`text-[10px] font-black flex items-center gap-0.5 ${stat.up ? "text-green-400" : "text-red-400"}`}>
                                                {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {stat.trend}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xl font-black tracking-tight">{stat.value}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                                        {stat.badge && <Badge variant="outline" className="text-[7px] font-black px-1 py-0 h-3.5 border-primary/30 text-primary">{stat.badge}</Badge>}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="border-border/50 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Revenue & Commission</CardTitle>
                            <CardDescription className="text-xs">Monthly breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="commission" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="border-border/50 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Booking Trend</CardTitle>
                            <CardDescription className="text-xs">This week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={bookingTrend}>
                                    <defs>
                                        <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                                    <Area type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" fill="url(#bookingGrad)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
