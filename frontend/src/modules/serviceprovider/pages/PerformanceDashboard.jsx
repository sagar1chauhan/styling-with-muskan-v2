import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/modules/user/components/ui/card";
import { Progress } from "@/modules/user/components/ui/progress";
import { Badge } from "@/modules/user/components/ui/badge";
import { Button } from "@/modules/user/components/ui/button";
import { AlertCircle, Star, XCircle, Clock, ShieldCheck, PauseCircle, Briefcase, DownloadIcon, MoreVerticalIcon, AwardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useProviderAuth } from "../contexts/ProviderAuthContext";
import { api } from "@/modules/user/lib/api";

export default function PerformanceDashboard() {
    const { provider } = useProviderAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        let cancel = false;
        const run = async () => {
            if (!provider?.phone) return;
            setLoading(true);
            setError("");
            try {
                const s = await api.provider.summary(provider.phone);
                if (!cancel) setSummary(s);
            } catch {
                if (!cancel) setError("Failed to load performance");
            } finally {
                if (!cancel) setLoading(false);
            }
        };
        run();
        return () => { cancel = true; };
    }, [provider?.phone]);
    const metrics = useMemo(() => ({
        rating: summary?.provider?.rating ?? 0,
        responseRate: summary?.performance?.responseRate ?? 0,
        cancellations: summary?.performance?.cancellations ?? 0,
        grade: summary?.performance?.grade ?? "N/A",
        isActive: provider?.approvalStatus === "approved",
        weeklyTrend: summary?.performance?.weeklyTrend ?? [],
    }), [summary, provider?.approvalStatus]);

    const isPaused = metrics.rating < 4.7 || !metrics.isActive;

    return (
        <div className="flex flex-1 w-full flex-col gap-6 pt-4 md:pt-0">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Performance & Compliance</h1>
                <p className="text-muted-foreground">Track your metrics and ensure adherence to UC standards.</p>
            </div>

            {isPaused && (
                <div className="rounded-lg border bg-destructive/10 text-destructive border-destructive p-4 flex gap-4 items-start shadow-sm">
                    <PauseCircle className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold tracking-tight">Jobs Paused</h3>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                            Your profile is currently paused from receiving new leads because your rating has fallen below 4.7. You must complete a refresher training module to reactivate your dashboard.
                        </p>
                    </div>
                </div>
            )}

            {metrics.cancellations > 3 && (
                <div className="rounded-lg border bg-white p-4 flex flex-col items-center justify-between shadow-sm sm:flex-row gap-4 border-gray-100">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-bold text-[#b94a2a] uppercase flex items-center gap-1">
                            <XCircle className="h-4 w-4" /> HIGH CANCELLATIONS
                        </h3>
                        <p className="text-sm text-gray-700">
                            Complete training & do not cancel jobs
                        </p>
                    </div>
                    <Button className="bg-[#5944d1] hover:bg-[#4331a6] text-white w-full sm:w-auto h-10 px-6 rounded-lg text-sm font-medium">
                        Details
                    </Button>
                </div>
            )}

            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                {/* Rating - Hero Metric with Interactive Circular Progress */}
                <div className="col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-10">
                    <div className="relative flex items-center justify-center w-56 h-56">
                        {/* SVG Circular Progress Bar */}
                        <svg className="w-56 h-56 transform -rotate-90">
                            {/* Background Track */}
                            <circle
                                cx="112"
                                cy="112"
                                r="100"
                                fill="none"
                                stroke="#f3f4f6"
                                strokeWidth="10"
                            />
                            {/* Color-coded Progress Stroke */}
                            <circle
                                cx="112"
                                cy="112"
                                r="100"
                                fill="none"
                                stroke={metrics.rating >= 4.7 ? "#22c55e" : "#ef4444"}
                                strokeWidth="14"
                                strokeDasharray="628.3"
                                strokeDashoffset={628.3 - (628.3 * metrics.rating) / 5}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-in-out drop-shadow-sm"
                            />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-[-4px]">
                            <h2 className="text-5xl font-extrabold tracking-tight text-slate-900">{metrics.rating.toFixed(2)}</h2>
                            <div className="flex items-center justify-center gap-1 text-sm font-bold mt-1 text-slate-500">
                                Rating <span className="text-slate-400 font-bold">&gt;</span>
                            </div>
                        </div>

                        {/* Floating Status Badge mimicking image */}
                        <div className="absolute -bottom-5 bg-[#334155] backdrop-blur-md text-white rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl border border-white/10">
                            <AwardIcon className="h-5 w-5 text-slate-300" />
                            <div className="flex flex-col items-center">
                                <Star className={`h-5 w-5 fill-white ${metrics.rating >= 4.7 ? "text-green-400" : "text-red-400"}`} />
                                <span className="text-[10px] uppercase font-black mt-0.5 tracking-wider">Min: 4.7</span>
                            </div>
                            <MoreVerticalIcon className="h-5 w-5 text-slate-300" />
                        </div>
                    </div>
                </div>

                {/* Weekend Hours Metric */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-gray-700" />
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4 px-4">
                        <div className="text-2xl font-bold mt-2">{loading ? "…" : `${summary?.calendar?.availableHoursWeek ?? 0} hrs`}</div>
                        <p className="text-xs text-muted-foreground mt-1">Weekend hours</p>
                    </CardContent>
                </Card>

                {/* Cancellations */}
                <Card className="shadow-sm border-red-200 bg-red-50/10">
                    <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4 px-4">
                        <div className="text-2xl font-bold mt-2">{loading ? "…" : metrics.cancellations}</div>
                        <p className="text-xs text-muted-foreground mt-1">Cancellations</p>
                    </CardContent>
                </Card>

                {/* Response Rate Metric */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <DownloadIcon className="h-4 w-4 text-gray-700" />
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4 px-4">
                        <div className="text-2xl font-bold mt-2">{loading ? "…" : `${metrics.responseRate}%`}</div>
                        <p className="text-xs text-muted-foreground mt-1">Response rate</p>
                    </CardContent>
                </Card>

                {/* Overall Grade Usage */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <AwardIcon className="h-4 w-4 text-gray-700" />
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4 px-4">
                        <div className="text-2xl font-bold mt-2 text-purple-600">{loading ? "…" : metrics.grade}</div>
                        <p className="text-xs text-muted-foreground mt-1">Overall Grade</p>
                    </CardContent>
                </Card>

                {/* Weekly Performance Trend Section (New) */}
                <div className="col-span-2 lg:col-span-3 mt-4">
                    <Card className="shadow-md border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-lg font-bold">Weekly Performance Trend</CardTitle>
                                    <CardDescription>Based on response ratio & job completion</CardDescription>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-slate-900">Top 5%</span>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Current Rank</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Animated Bar Chart */}
                            <div className="flex items-end justify-between h-48 gap-2 pt-4">
                                {(metrics.weeklyTrend.length ? metrics.weeklyTrend : [
                                    { day: "Mon", value: 0, color: "bg-slate-200" },
                                    { day: "Tue", value: 0, color: "bg-slate-200" },
                                    { day: "Wed", value: 0, color: "bg-slate-200" },
                                    { day: "Thu", value: 0, color: "bg-slate-200" },
                                    { day: "Fri", value: 0, color: "bg-slate-200" },
                                    { day: "Sat", value: 0, color: "bg-slate-200" },
                                    { day: "Sun", value: 0, color: "bg-slate-200" },
                                ]).map((item, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                                        <div className="relative w-full flex flex-col justify-end h-full">
                                            {/* Tooltip on hover */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold">
                                                {item.value}% Response
                                            </div>
                                            <div className={`w-full rounded-t-lg transition-all duration-1000 ease-out hover:brightness-110 cursor-pointer ${item.color || "bg-slate-200"}`} style={{ height: `${item.value}%`, animation: `growUp 1s ease-out forwards ${idx * 0.1}s`, transform: "scaleY(0)", transformOrigin: "bottom" }} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">{item.day}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                                    <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Avg Response Time</p>
                                    <p className="text-xl font-bold text-green-900">12 Mins</p>
                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-green-600 font-bold">
                                        <span>↓ 4 mins from last week</span>
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                    <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest">Job Conversion</p>
                                    <p className="text-xl font-bold text-purple-900">92%</p>
                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-600 font-bold">
                                        <span>↑ 5% from last week</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes growUp {
                            from { transform: scaleY(0); }
                            to { transform: scaleY(1); }
                        }
                    `}} />

                    {/* Detailed Compliance/Badges */}
                    <Card className="shadow-sm border-purple-200 bg-purple-50/30 mt-6 overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-md">
                                <ShieldCheck className="h-5 w-5 text-purple-600" /> Professional Standards
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4 shadow-sm">
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <AwardIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-slate-900">Punctuality Legend</p>
                                    <p className="text-[11px] text-slate-500">You reached 100% of jobs on time this week.</p>
                                </div>
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Active</Badge>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4 shadow-sm">
                                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-slate-900">Customer Feedback</p>
                                    <p className="text-[11px] text-slate-500">1 complaint recorded regarding start time delay.</p>
                                </div>
                                <Badge variant="outline" className="text-destructive border-destructive ml-auto">Review</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
