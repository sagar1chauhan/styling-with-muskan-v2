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

    useEffect(() => {
        loadBookings();
    }, []);

    const cancelBooking = (id) => { setBookings(prev => prev.filter(b => (b._id || b.id) !== id)); };
    const updateBooking = (id, updates) => { setBookings(prev => prev.map(b => ((b._id || b.id) === id ? { ...b, ...updates } : b))); };

    return (
        <BookingContext.Provider value={{ bookings, loading, loadBookings, cancelBooking, updateBooking }}>
            {children}
        </BookingContext.Provider>
    );
};
