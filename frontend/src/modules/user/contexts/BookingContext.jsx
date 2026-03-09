import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/modules/user/lib/api";

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
            const matchCount = serviceTypes.filter(st => p.specialties?.includes(st)).length;
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
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const { bookings } = await api.bookings.list(1, 50);
            setBookings(bookings || []);
        } catch {
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

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

        let responseTimeMins = 20;
        try {
            const configRaw = localStorage.getItem("swm_bookingTypeConfig");
            if (configRaw) {
                const config = JSON.parse(configRaw);
                const firstFound = config.find(c => c.providerResponseTime);
                if (firstFound) responseTimeMins = firstFound.providerResponseTime;
            }
        } catch(e) {}
        const expiresAt = assignedProvider ? new Date(Date.now() + responseTimeMins * 60 * 1000).toISOString() : null;

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
                    createdAt: new Date().toISOString(),
                    expiresAt: expiresAt
                },
                ...prev
            ];
            if (next.length > 50) return next.slice(0, 50);
            return next;
        });
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const cancelBooking = (id) => { setBookings(prev => prev.filter(b => (b._id || b.id) !== id)); };
    const updateBooking = (id, updates) => { setBookings(prev => prev.map(b => ((b._id || b.id) === id ? { ...b, ...updates } : b))); };

    // Step 4: User accepts the admin-approved quote
    // This changes status to user_accepted so vendor can now assign team
    const acceptCustomizedBooking = (bookingData) => {
        // 1. Update global SP bookings to user_accepted (vendor will now assign team)
        const spBookings = JSON.parse(localStorage.getItem("muskan-bookings") || "[]");
        const updatedSpBookings = spBookings.map(b =>
            b.id === bookingData.id ? { ...b, status: "user_accepted", userAcceptedAt: new Date().toISOString() } : b
        );
        localStorage.setItem("muskan-bookings", JSON.stringify(updatedSpBookings));

        // 2. Update enquiry status
        const enquiries = JSON.parse(localStorage.getItem("muskan-enquiries") || "[]");
        const updatedEnquiries = enquiries.map(e =>
            e.id === bookingData.id ? { ...e, status: "user_accepted" } : e
        );
        localStorage.setItem("muskan-enquiries", JSON.stringify(updatedEnquiries));
    };

    // Step 7: After admin gives final_approved, user sees the booking as a normal booking
    // Only lead member sees this on their side. This converts it into a normal accepted booking.
    const confirmCustomizedBooking = (bookingData) => {
        // Add to user's local bookings as a normal accepted booking
        const newBooking = {
            ...bookingData,
            status: "accepted",
            paymentStatus: "PAID",
            acceptedAt: new Date().toISOString(),
            otp: Math.floor(1000 + Math.random() * 9000).toString()
        };
        setBookings(prev => [newBooking, ...prev]);

        // Update global SP bookings
        const spBookings = JSON.parse(localStorage.getItem("muskan-bookings") || "[]");
        const updatedSpBookings = spBookings.map(b =>
            b.id === bookingData.id ? { ...b, status: "accepted", paymentStatus: "PAID" } : b
        );
        localStorage.setItem("muskan-bookings", JSON.stringify(updatedSpBookings));

        // Remove from enquiries
        const enquiries = JSON.parse(localStorage.getItem("muskan-enquiries") || "[]");
        const filteredEnquiries = enquiries.filter(e => e.id !== bookingData.id);
        localStorage.setItem("muskan-enquiries", JSON.stringify(filteredEnquiries));
    };

    const rejectCustomizedBooking = (bookingData) => {
        // 1. Update global SP bookings
        const spBookings = JSON.parse(localStorage.getItem("muskan-bookings") || "[]");
        const updatedSpBookings = spBookings.map(b =>
            b.id === bookingData.id ? { ...b, status: "rejected" } : b
        );
        localStorage.setItem("muskan-bookings", JSON.stringify(updatedSpBookings));

        // 2. Remove from enquiries
        const enquiries = JSON.parse(localStorage.getItem("muskan-enquiries") || "[]");
        const filteredEnquiries = enquiries.filter(e => e.id !== bookingData.id);
        localStorage.setItem("muskan-enquiries", JSON.stringify(filteredEnquiries));

        // Ensure local list triggers an update basically by filtering rawEnquiries on next render
    };

    return (
        <BookingContext.Provider value={{ bookings, loading, loadBookings, addBooking, cancelBooking, updateBooking, acceptCustomizedBooking, confirmCustomizedBooking, rejectCustomizedBooking }}>
            {children}
        </BookingContext.Provider>
    );
};
