import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const BeauticianBookingContext = createContext(undefined);

export const useBeauticianBookings = () => {
    const context = useContext(BeauticianBookingContext);
    if (!context) throw new Error("useBeauticianBookings must be used within BeauticianBookingProvider");
    return context;
};

const STORAGE_KEY = "muskan-beautician-bookings";

// Generate mock incoming bookings
const generateMockBookings = () => [
    {
        id: "BB1001",
        customerId: "U1001",
        customerName: "Priya M.",
        services: [{ name: "Gold Facial", price: 1499, duration: "60 min" }],
        totalAmount: 1499,
        address: { houseNo: "B-12, Sunshine Apartments", area: "Bandra West, Mumbai", landmark: "Near Lucky Restaurant" },
        slot: { date: new Date().toISOString().split("T")[0], time: "10:00 AM" },
        bookingType: "instant",
        status: "incoming", // incoming | accepted | travelling | arrived | in_progress | completed | rejected | cancelled
        otp: "4523",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        beforeImages: [],
        afterImages: [],
        beauticianFeedback: "",
    },
    {
        id: "BB1002",
        customerId: "U1002",
        customerName: "Anita S.",
        services: [
            { name: "Full Body Waxing", price: 1999, duration: "90 min" },
            { name: "Manicure", price: 799, duration: "30 min" },
        ],
        totalAmount: 2798,
        address: { houseNo: "F-45, Green Valley", area: "Andheri East, Mumbai", landmark: "Opposite City Mall" },
        slot: { date: new Date().toISOString().split("T")[0], time: "02:00 PM" },
        bookingType: "scheduled",
        status: "incoming",
        otp: "7891",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        beforeImages: [],
        afterImages: [],
        beauticianFeedback: "",
    },
    {
        id: "BB1003",
        customerId: "U1003",
        customerName: "Meera K.",
        services: [{ name: "Bridal Makeup Package", price: 14999, duration: "3-4 hrs" }],
        totalAmount: 14999,
        address: { houseNo: "A-8, Royal Heights", area: "Powai, Mumbai", landmark: "Near Hiranandani Gardens" },
        slot: { date: new Date(Date.now() + 86400000).toISOString().split("T")[0], time: "09:00 AM" },
        bookingType: "scheduled",
        status: "accepted",
        otp: "3456",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        expiresAt: null,
        beforeImages: [],
        afterImages: [],
        beauticianFeedback: "",
    },
];

export const BeauticianBookingProvider = ({ children }) => {
    const [bookings, setBookings] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.length > 0 ? parsed : generateMockBookings();
        }
        return generateMockBookings();
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    }, [bookings]);

    const incomingBookings = bookings.filter(b => b.status === "incoming");
    const activeBookings = bookings.filter(b => ["accepted", "travelling", "arrived", "in_progress"].includes(b.status));
    const completedBookings = bookings.filter(b => b.status === "completed");

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

    const addBeforeImages = useCallback((id, images) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, beforeImages: [...b.beforeImages, ...images] } : b
        ));
    }, []);

    const addAfterImages = useCallback((id, images) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, afterImages: [...b.afterImages, ...images] } : b
        ));
    }, []);

    const addFeedback = useCallback((id, feedback) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, beauticianFeedback: feedback } : b
        ));
    }, []);

    const completeService = useCallback((id, feedback) => {
        setBookings(prev => prev.map(b =>
            b.id === id ? { ...b, status: "completed", beauticianFeedback: feedback, completedAt: new Date().toISOString() } : b
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

    return (
        <BeauticianBookingContext.Provider value={{
            bookings,
            incomingBookings,
            activeBookings,
            completedBookings,
            acceptBooking,
            rejectBooking,
            updateBookingStatus,
            cancelBooking,
            addBeforeImages,
            addAfterImages,
            addFeedback,
            completeService,
            verifyOTP,
        }}>
            {children}
        </BeauticianBookingContext.Provider>
    );
};
