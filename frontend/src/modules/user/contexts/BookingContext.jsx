import React, { createContext, useContext, useState, useEffect } from "react";

const BookingContext = createContext(undefined);

export const useBookings = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error("useBookings must be used within a BookingProvider");
    }
    return context;
};

// Helper: check if current time is within office hours
const isWithinOfficeHours = (officeSettings) => {
    if (!officeSettings) return true;
    const now = new Date();
    const [startH, startM] = (officeSettings.startTime || "09:00").split(":").map(Number);
    const [endH, endM] = (officeSettings.endTime || "21:00").split(":").map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

// Helper: find the best matching SP for a booking
const findBestProvider = (booking, providers) => {
    if (!providers || providers.length === 0) return null;

    // Get service type from booking items
    const serviceTypes = [...new Set((booking.items || []).map(i => i.serviceType).filter(Boolean))];

    // Score providers by specialty match
    const scored = providers
        .filter(p => p.specialties && p.specialties.length > 0)
        .map(p => {
            const matchCount = serviceTypes.filter(st => p.specialties.includes(st)).length;
            return { ...p, matchScore: matchCount, rating: p.rating || 0 };
        })
        .filter(p => p.matchScore > 0) // must match at least one service type
        .sort((a, b) => {
            if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
            return b.rating - a.rating; // tie-break by rating
        });

    return scored.length > 0 ? scored[0] : null;
};

export const BookingProvider = ({ children }) => {
    const [bookings, setBookings] = useState(() => {
        const saved = localStorage.getItem("muskan-bookings");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        try {
            localStorage.setItem("muskan-bookings", JSON.stringify(bookings));
        } catch (e) {
            console.error("Storage limit exceeded!", e);
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                if (bookings.length > 2) {
                    const reducedBookings = bookings.slice(0, -2);
                    setBookings(reducedBookings);
                }
            }
        }
    }, [bookings]);

    const addBooking = (newBooking) => {
        // Read office settings and providers from localStorage (since context may not be available here)
        const officeSettings = JSON.parse(localStorage.getItem("swm_officeSettings") || '{"startTime":"09:00","endTime":"21:00","autoAssign":true}');
        const providers = JSON.parse(localStorage.getItem("swm_providers") || "[]");
        const isOfficeTime = isWithinOfficeHours(officeSettings);

        // Auto-assign to nearest matching SP
        let assignedProvider = null;
        let notificationStatus = "immediate";

        if (officeSettings.autoAssign) {
            const bestSP = findBestProvider(newBooking, providers);
            if (bestSP) {
                assignedProvider = bestSP.id;
            }
        }

        // If booking is placed outside office hours, queue notification
        if (!isOfficeTime) {
            notificationStatus = "queued";
        }

        // Determine the primary service type for display
        const serviceTypes = [...new Set((newBooking.items || []).map(i => i.serviceType).filter(Boolean))];
        const serviceTypeLabel = serviceTypes.length > 0
            ? serviceTypes.map(st => {
                const labels = { skin: "Skin Care", hair: "Hair Services", makeup: "Makeup & More" };
                return labels[st] || st;
            }).join(", ")
            : "General";

        setBookings(prev => {
            const next = [
                {
                    ...newBooking,
                    id: `B${Date.now()}`,
                    status: assignedProvider ? "Pending" : "Unassigned",
                    assignedProvider: assignedProvider,
                    notificationStatus: notificationStatus,
                    notificationScheduledAt: !isOfficeTime ? `${officeSettings.startTime} (Next business hours)` : null,
                    serviceType: serviceTypeLabel,
                    customerName: newBooking.customerName || newBooking.address?.name || "Customer",
                    otp: Math.floor(1000 + Math.random() * 9000).toString(),
                    createdAt: new Date().toISOString()
                },
                ...prev
            ];
            if (next.length > 50) return next.slice(0, 50);
            return next;
        });
    };

    const cancelBooking = (id) => {
        setBookings(prev => prev.filter(b => b.id !== id));
    };

    const updateBooking = (id, updates) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    return (
        <BookingContext.Provider value={{ bookings, addBooking, cancelBooking, updateBooking }}>
            {children}
        </BookingContext.Provider>
    );
};
