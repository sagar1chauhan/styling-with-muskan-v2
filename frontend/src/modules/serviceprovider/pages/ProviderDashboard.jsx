import React from "react";
import { Link } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/modules/user/components/ui/card";
import { Button } from "@/modules/user/components/ui/button";
import { Badge } from "@/modules/user/components/ui/badge";
import {
    ArrowUpRight,
    TrendingUp,
    CreditCard,
    UserCheck,
    Star,
    Clock,
    Wallet
} from "lucide-react";

const ProviderDashboard = () => {
    return (
        <div className="flex flex-1 w-full flex-col gap-4 md:gap-8 pt-4 md:pt-0">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Active
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card x-chunk="dashboard-01-chunk-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Available Credits
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,250</div>
                        <p className="text-xs text-muted-foreground">
                            +150 since last week
                        </p>
                    </CardContent>
                </Card>
                <Card x-chunk="dashboard-01-chunk-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Rating
                        </CardTitle>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.8</div>
                        <p className="text-xs text-muted-foreground">
                            Based on 124 reviews
                        </p>
                    </CardContent>
                </Card>
                <Card x-chunk="dashboard-01-chunk-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Job Response Rate</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">92%</div>
                        <p className="text-xs text-muted-foreground">
                            Excellent response time
                        </p>
                    </CardContent>
                </Card>
                <Card x-chunk="dashboard-01-chunk-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Hours Available
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8h / Today</div>
                        <p className="text-xs text-muted-foreground">
                            09:00 AM - 05:00 PM
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
                    <CardHeader className="flex flex-row items-center">
                        <div className="grid gap-2">
                            <CardTitle>Recent Leads</CardTitle>
                            <CardDescription>
                                New job opportunities in your area.
                            </CardDescription>
                        </div>
                        <Button asChild size="sm" className="ml-auto gap-1 bg-purple-600 hover:bg-purple-700 text-white">
                            <Link to="/provider/credits">
                                View All
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "Bridal Makeup", loc: "Sector 14", time: "2 hrs ago", val: "150 Credits", status: "New" },
                                { name: "Hair Styling", loc: "DLF Phase 3", time: "5 hrs ago", val: "80 Credits", status: "Missed" },
                                { name: "Party Makeup", loc: "Golf Course Rd", time: "1 day ago", val: "120 Credits", status: "Bought" }
                            ].map((lead, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-sm">{lead.name}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            {lead.loc} • {lead.time}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">{lead.val}</span>
                                        {lead.status === "New" && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">New</Badge>}
                                        {lead.status === "Missed" && <Badge variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30">Missed</Badge>}
                                        {lead.status === "Bought" && <Badge className="bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30">Purchased</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card x-chunk="dashboard-01-chunk-5">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start" size="lg">
                            <Wallet className="mr-2 h-4 w-4" /> Buy Credits (₹500 / 1000)
                        </Button>
                        <Button variant="outline" className="w-full justify-start" size="lg" asChild>
                            <Link to="/provider/availability">
                                <Clock className="mr-2 h-4 w-4 text-purple-600" /> Update Today's Availability
                            </Link>
                        </Button>
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 mt-2 border-l-4 border-l-red-500 flex flex-col gap-2">
                            <div className="font-semibold text-sm flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-red-500 shrink-0" /> Alert
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Your cancellation rate is slightly high. Please fulfill the next 3 booked jobs to avoid a penalty limit.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProviderDashboard;
