import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useProviderAuth } from "./ProviderAuthContext";

const ProviderBookingContext = createContext(undefined);

export const useProviderBookings = () => {
    const context = useContext(ProviderBookingContext);
    if (!context) throw new Error("useProviderBookings must be used within ProviderBookingProvider");
    return context;
};

const STORAGE_KEY = "muskan-bookings";

// Generate mock incoming bookings
const generateMockBookings = () => [
    {
        id: "PB1001",
        customerId: "U1001",
        customerName: "Rahul M.",
        services: [{ name: "Bridal Makeup", price: 15000, duration: "3 hrs" }],
        totalAmount: 15000,
        address: { houseNo: "B-12, Sunshine Apartments", area: "Sector 14, Gurgaon", landmark: "Near Subhash Chowk" },
        slot: { date: new Date().toISOString().split("T")[0], time: "10:00 AM" },
        bookingType: "scheduled",
        status: "incoming", // incoming | pending | accepted | travelling | arrived | in_progress | completed | rejected | cancelled
        otp: "4523",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        beforeImages: [],
        afterImages: [],
        providerFeedback: "",
    },
    {
        id: "PB1002",
        customerId: "U1002",
        customerName: "Simran K.",
        services: [
            { name: "Party Makeup", price: 3500, duration: "90 min" },
            { name: "Hair Styling", price: 1200, duration: "45 min" },
        ],
        totalAmount: 4700,
        address: { houseNo: "F-45, Green Valley", area: "DLF Phase 3", landmark: "Opposite Cyber Hub" },
        slot: { date: new Date().toISOString().split("T")[0], time: "02:00 PM" },
        bookingType: "scheduled",
        status: "pending",
        otp: "7891",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        beforeImages: [],
        afterImages: [],
        providerFeedback: "",
    },
    {
        id: "PB1003",
        customerId: "U1003",
        customerName: "Pooja S.",
        services: [{ name: "Advanced Haircut & Color", price: 2500, duration: "2 hrs" }],
        totalAmount: 2500,
        address: { houseNo: "A-8, Royal Heights", area: "Golf Course Rd", landmark: "Near Mega Mall" },
        slot: { date: new Date(Date.now() + 86400000).toISOString().split("T")[0], time: "09:00 AM" },
        bookingType: "scheduled",
        status: "accepted",
        otp: "3456",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        expiresAt: null,
        beforeImages: [],
        afterImages: [],
        providerFeedback: "",
    },
    {
        id: "PB1004",
        customerId: "U1004",
        customerName: "Kriti D.",
        services: [{ name: "Keratin Treatment", price: 5000, duration: "2.5 hrs" }],
        totalAmount: 5000,
        address: { houseNo: "C-11, Platinum Towers", area: "MG Road", landmark: "Near MG Metro" },
        slot: { date: new Date(Date.now() - 86400000).toISOString().split("T")[0], time: "11:00 AM" },
        bookingType: "scheduled",
        status: "cancelled",
        otp: "0000",
        createdAt: new Date(Date.now() - 10000000).toISOString(),
        expiresAt: null,
        beforeImages: [],
        afterImages: [],
        providerFeedback: "",
    }
];

export const ProviderBookingProvider = ({ children }) => {
    const [bookings, setBookings] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed;
        }
        return [];
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
        } catch (e) {
            console.error("ProviderBooking storage limit exceeded!", e);
        }
    }, [bookings]);

    const { provider } = useProviderAuth();

    const providerId = provider?.id || provider?.phone;

    // Only show bookings explicitly assigned to this provider
    const myBookings = bookings.filter(b => b.assignedProvider === providerId);

    const incomingBookings = myBookings.filter(b => b.status === "incoming" || b.status === "pending" || b.status === "Pending");
    const pendingBookings = myBookings.filter(b => b.status === "pending" || b.status === "Pending");
    const activeBookings = myBookings.filter(b => ["accepted", "travelling", "arrived", "in_progress"].includes(b.status));
    const completedBookings = myBookings.filter(b => b.status === "completed");
    const cancelledBookings = myBookings.filter(b => ["cancelled", "rejected"].includes(b.status));

    const acceptBooking = useCallback((id) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, status: "accepted", expiresAt: null } : b
        ));
    }, []);

    const rejectBooking = useCallback((id) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, status: "rejected" } : b
        ));
    }, []);

    const updateBookingStatus = useCallback((id, status) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, status } : b
        ));
    }, []);

    const cancelBooking = useCallback((id) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, status: "cancelled" } : b
        ));
    }, []);

    const verifyOTP = useCallback((id, enteredOtp) => {
        const booking = bookings.find(b => b.id === id);
        if (booking && booking.otp === enteredOtp) {
            updateBookingStatus(id, "in_progress");
            return true;
        }
        return false;
    }, [bookings, updateBookingStatus]);

    const addBeforeImages = useCallback((id, images) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, beforeImages: [...(b.beforeImages || []), ...images] } : b
        ));
    }, []);

    const addAfterImages = useCallback((id, images) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, afterImages: [...(b.afterImages || []), ...images] } : b
        ));
    }, []);

    const addProductImages = useCallback((id, images) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, productImages: [...(b.productImages || []), ...images] } : b
        ));
    }, []);

    const addProviderImages = useCallback((id, images) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, providerImages: [...(b.providerImages || []), ...images] } : b
        ));
    }, []);

    return (
        <ProviderBookingContext.Provider value={{
            bookings,
            incomingBookings,
            pendingBookings,
            activeBookings,
            completedBookings,
            cancelledBookings,
            acceptBooking,
            rejectBooking,
            updateBookingStatus,
            cancelBooking,
            verifyOTP,
            addBeforeImages,
            addAfterImages,
            addProductImages,
            addProviderImages,
        }}>
            {children}
        </ProviderBookingContext.Provider>
    );
};
