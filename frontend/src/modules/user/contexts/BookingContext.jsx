import React, { createContext, useContext, useState, useEffect } from "react";

const BookingContext = createContext(undefined);

export const useBookings = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error("useBookings must be used within a BookingProvider");
    }
    return context;
};

export const BookingProvider = ({ children }) => {
    const [bookings, setBookings] = useState(() => {
        const saved = localStorage.getItem("muskan-bookings");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("muskan-bookings", JSON.stringify(bookings));
    }, [bookings]);

    const addBooking = (newBooking) => {
        setBookings(prev => [
            {
                ...newBooking,
                id: `B${Date.now()}`,
                status: "Pending",
                createdAt: new Date().toISOString()
            },
            ...prev
        ]);
    };

    const cancelBooking = (id) => {
        setBookings(prev => prev.filter(b => b.id !== id));
    };

    return (
        <BookingContext.Provider value={{ bookings, addBooking, cancelBooking }}>
            {children}
        </BookingContext.Provider>
    );
};
