import React, { useState } from "react";
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

export default function PerformanceDashboard() {
    // Mock data for the provider
    const [metrics] = useState({
        rating: 4.6, // Falls below 4.7 for testing the Pause banner
        responseRate: 98,
        cancellations: 4,
        genuineProductScore: 100,
        isActive: true, // But jobs are paused due to rating
    });

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
                        <div className="text-2xl font-bold mt-2">18 hrs</div>
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
                        <div className="text-2xl font-bold mt-2">{metrics.cancellations}</div>
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
                        <div className="text-2xl font-bold mt-2">{metrics.responseRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Response rate</p>
                    </CardContent>
                </Card>

                {/* Genuine Product Usage */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Briefcase className="h-4 w-4 text-gray-700" />
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4 px-4">
                        <div className="text-2xl font-bold mt-2">{metrics.genuineProductScore}</div>
                        <p className="text-xs text-muted-foreground mt-1">Genuine Product Usage</p>
                    </CardContent>
                </Card>

                {/* Compliance Module (below grid) */}
                <div className="col-span-2 lg:col-span-3 mt-4">
                    <Card className="shadow-sm border-purple-200 bg-purple-50/30 dark:bg-purple-950/10 dark:border-purple-900/40">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-purple-600" /> Compliance Check
                            </CardTitle>
                            <CardDescription>
                                We monitor product usage across jobs to ensure Urban Company standards.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div className="bg-background rounded-lg p-4 border flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">Genuine Product Usage</p>
                                    <p className="text-xs text-muted-foreground">Detected 100% authentic inventory via Kit Scans.</p>
                                </div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 ml-auto whitespace-pre">Passed</Badge>
                            </div>

                            <div className="bg-background rounded-lg p-4 border flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">Customer Complaints</p>
                                    <p className="text-xs text-muted-foreground">1 complaint recorded regarding start time delay.</p>
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
