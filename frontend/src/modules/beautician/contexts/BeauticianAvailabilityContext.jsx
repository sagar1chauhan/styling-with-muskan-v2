import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const BeauticianAvailabilityContext = createContext(undefined);

export const useBeauticianAvailability = () => {
    const context = useContext(BeauticianAvailabilityContext);
    if (!context) throw new Error("useBeauticianAvailability must be used within BeauticianAvailabilityProvider");
    return context;
};

const STORAGE_KEY = "muskan-beautician-availability";
const DEFAULT_HOURS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"];

// Generate default slots for next 30 days
const generateDefaultSlots = () => {
    const slots = {};
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split("T")[0];
        const dayOfWeek = d.getDay();
        // Default: available Mon-Sat, off on Sunday
        slots[key] = {
            available: dayOfWeek !== 0,
            hours: dayOfWeek !== 0 ? [...DEFAULT_HOURS] : [],
        };
    }
    return slots;
};

export const BeauticianAvailabilityProvider = ({ children }) => {
    const [slots, setSlots] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.slots || generateDefaultSlots();
        }
        return generateDefaultSlots();
    });

    const [leaves, setLeaves] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.leaves || [];
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ slots, leaves }));
    }, [slots, leaves]);

    const updateDaySlots = useCallback((date, hours) => {
        // Enforce 2-hour cutoff
        const now = new Date();
        const targetDate = new Date(date);
        const diffMs = targetDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 2 && targetDate.toDateString() === now.toDateString()) {
            return { success: false, message: "Cannot modify slots within 2 hours of service time" };
        }

        setSlots(prev => ({
            ...prev,
            [date]: { available: hours.length > 0, hours },
        }));
        return { success: true };
    }, []);

    const toggleDayAvailability = useCallback((date) => {
        setSlots(prev => {
            const current = prev[date] || { available: false, hours: [] };
            return {
                ...prev,
                [date]: {
                    available: !current.available,
                    hours: !current.available ? [...DEFAULT_HOURS] : [],
                },
            };
        });
    }, []);

    const requestLeave = useCallback((startDate, endDate, reason) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Check if any day is Saturday or Sunday
        let hasWeekend = false;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0 || d.getDay() === 6) hasWeekend = true;
        }

        const requiresApproval = diffDays > 3 || hasWeekend;

        const leave = {
            id: `L${Date.now()}`,
            startDate,
            endDate,
            reason,
            days: diffDays,
            status: requiresApproval ? "pending_approval" : "approved",
            requiresApproval,
            createdAt: new Date().toISOString(),
        };

        setLeaves(prev => [...prev, leave]);

        // If auto-approved, mark days as unavailable
        if (!requiresApproval) {
            setSlots(prev => {
                const updated = { ...prev };
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const key = d.toISOString().split("T")[0];
                    updated[key] = { available: false, hours: [] };
                }
                return updated;
            });
        }

        return leave;
    }, []);

    const cancelLeave = useCallback((id) => {
        setLeaves(prev => prev.filter(l => l.id !== id));
    }, []);

    const getSlotForDate = useCallback((date) => {
        return slots[date] || { available: false, hours: [] };
    }, [slots]);

    const isSlotLocked = useCallback((date, hour) => {
        const now = new Date();
        const [time, ampm] = hour.split(" ");
        const [h, m] = time.split(":");
        let hours24 = parseInt(h);
        if (ampm === "PM" && hours24 !== 12) hours24 += 12;
        if (ampm === "AM" && hours24 === 12) hours24 = 0;

        const slotDate = new Date(date);
        slotDate.setHours(hours24, parseInt(m), 0, 0);
        const diffMs = slotDate.getTime() - now.getTime();
        return diffMs < 2 * 60 * 60 * 1000; // locked if less than 2 hours
    }, []);

    return (
        <BeauticianAvailabilityContext.Provider value={{
            slots,
            leaves,
            defaultHours: DEFAULT_HOURS,
            updateDaySlots,
            toggleDayAvailability,
            requestLeave,
            cancelLeave,
            getSlotForDate,
            isSlotLocked,
        }}>
            {children}
        </BeauticianAvailabilityContext.Provider>
    );
};
