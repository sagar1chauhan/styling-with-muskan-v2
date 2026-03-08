import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useProviderAuth } from "./ProviderAuthContext";
import { api } from "@/modules/user/lib/api";

const ProviderBookingContext = createContext(undefined);

export const useProviderBookings = () => {
    const context = useContext(ProviderBookingContext);
    if (!context) throw new Error("useProviderBookings must be used within ProviderBookingProvider");
    return context;
};

const STORAGE_KEY = null;

export const ProviderBookingProvider = ({ children }) => {
    const [bookings, setBookings] = useState([]);

    const { provider } = useProviderAuth();

    const providerId = provider?._id || provider?.id || provider?.phone;

    useEffect(() => {
        let cancelled = false;
        if (!providerId) return;
        api.provider.bookings(providerId).then(({ bookings }) => {
            if (!cancelled) setBookings(bookings || []);
        }).catch(() => {});
        return () => { cancelled = true; };
    }, [providerId]);

    // Only show bookings explicitly assigned to this provider
    const myBookings = bookings.filter(b => b.assignedProvider === providerId);

    const incomingBookings = myBookings.filter(b => b.status === "incoming" || b.status === "pending" || b.status === "Pending");
    const pendingBookings = myBookings.filter(b => b.status === "pending" || b.status === "Pending");
    const activeBookings = myBookings.filter(b => ["accepted", "travelling", "arrived", "in_progress"].includes(b.status));
    const completedBookings = myBookings.filter(b => b.status === "completed");
    const cancelledBookings = myBookings.filter(b => ["cancelled", "rejected"].includes(b.status));

    const acceptBooking = useCallback(async (id) => {
        const { booking } = await api.provider.updateBookingStatus(id, "accepted");
        setBookings(prev => prev.map(b => b._id === booking._id ? booking : b));
    }, []);

    const rejectBooking = useCallback(async (id) => {
        const { booking } = await api.provider.updateBookingStatus(id, "rejected");
        setBookings(prev => prev.map(b => b._id === booking._id ? booking : b));
    }, []);

    const updateBookingStatus = useCallback(async (id, status) => {
        const { booking } = await api.provider.updateBookingStatus(id, status);
        setBookings(prev => prev.map(b => b._id === booking._id ? booking : b));
    }, []);

    const cancelBooking = useCallback(async (id) => {
        const { booking } = await api.provider.updateBookingStatus(id, "cancelled");
        setBookings(prev => prev.map(b => b._id === booking._id ? booking : b));
    }, []);

    const verifyOTP = useCallback(async (id, enteredOtp) => {
        const { booking } = await api.provider.verifyBookingOtp(id, enteredOtp);
        setBookings(prev => prev.map(b => b._id === booking._id ? booking : b));
        return true;
    }, []);

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
