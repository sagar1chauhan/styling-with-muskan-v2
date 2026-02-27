import React, { useState, useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/modules/user/components/ui/card";
import { Button } from "@/modules/user/components/ui/button";
import { Switch } from "@/modules/user/components/ui/switch";
import { Calendar } from "@/modules/user/components/ui/calendar"; // Assuming standard Shadcn Calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/user/components/ui/popover";
import { cn } from "@/modules/user/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, CheckCircle } from "lucide-react";

const timeSlots = [
    "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM",
    "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
    "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
    "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"
];

export default function AvailabilityCalendar() {
    const [date, setDate] = useState(new Date());

    // Initially assume all slots from 09:00 AM to 05:00 PM are active (index 2 to 10)
    const [activeSlots, setActiveSlots] = useState(
        timeSlots.reduce((acc, slot, i) => {
            acc[slot] = i >= 2 && i <= 10;
            return acc;
        }, {})
    );

    const toggleSlot = (slot) => {
        setActiveSlots(prev => ({
            ...prev,
            [slot]: !prev[slot]
        }));
    };

    const setAll = (val) => {
        setActiveSlots(timeSlots.reduce((acc, slot) => {
            acc[slot] = val;
            return acc;
        }, {}));
    };

    const totalHours = useMemo(() => {
        return Object.values(activeSlots).filter(Boolean).length;
    }, [activeSlots]);

    return (
        <div className="flex flex-1 w-full flex-col gap-6 pt-4 md:pt-0">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Hourly Availability</h1>
                    <p className="text-muted-foreground">Manage your working hours directly on the calendar.</p>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal bg-card shadow-sm",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 text-purple-600" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => d && setDate(d)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Total Hours Calculation */}
                <Card className="lg:col-span-1 shadow-sm flex flex-col justify-between border-green-200 bg-green-50/50 dark:bg-green-950/20">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" /> Real-time Calculation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <div className="text-6xl font-bold tracking-tight text-green-700 dark:text-green-500">
                            {totalHours}
                        </div>
                        <p className="text-sm text-green-800 font-medium mt-2 dark:text-green-400">Total Hours Available</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                            Providers with 8+ hours get prioritized in the algorithm.
                        </p>
                    </CardContent>
                    <CardFooter className="pb-6">
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" /> Save Active Hours
                        </Button>
                    </CardFooter>
                </Card>

                {/* Hourly Toggles */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 mb-4 border-b">
                        <div>
                            <CardTitle>Time Slots for {format(date, "MMMM do, yyyy")}</CardTitle>
                            <CardDescription>Select individual hours to open your schedule.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setAll(true)}>On All</Button>
                            <Button variant="outline" size="sm" onClick={() => setAll(false)}>Off All</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {timeSlots.map((slot) => {
                                const isActive = activeSlots[slot];
                                return (
                                    <div
                                        key={slot}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                                            isActive ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800" : "bg-card border-border hover:bg-muted"
                                        )}
                                        onClick={(e) => {
                                            if (e.target.tagName !== "BUTTON" && e.target.closest("button") === null) {
                                                toggleSlot(slot);
                                            }
                                        }}
                                    >
                                        <span className={cn("text-sm font-medium", isActive ? "text-purple-700 dark:text-purple-300" : "text-foreground")}>
                                            {slot}
                                        </span>
                                        <Switch
                                            checked={isActive}
                                            onCheckedChange={() => toggleSlot(slot)}
                                            className="data-[state=checked]:bg-purple-600"
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
