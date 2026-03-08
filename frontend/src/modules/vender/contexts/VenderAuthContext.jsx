import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/modules/user/lib/api";

const VenderAuthContext = createContext(undefined);

export const useVenderAuth = () => {
    const context = useContext(VenderAuthContext);
    if (!context) throw new Error("useVenderAuth must be used within VenderAuthProvider");
    return context;
};

const STORAGE_KEY = "swm_vendor";

export const VenderAuthProvider = ({ children }) => {
    const [vendor, setVendor] = useState(null);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setVendor(JSON.parse(raw));
        } catch {}
        setHydrated(true);
    }, []);

    const isLoggedIn = !!vendor;
    const isApproved = vendor?.status === "approved";

    const login = async (email, password) => {
        const { vendor } = await api.vendor.login(email, password);
        setVendor(vendor);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(vendor)); } catch {}
        return { success: true };
    };

    const requestOtp = async (phone) => { await api.vendor.requestOtp(phone); return { success: true }; };
    const verifyOtp = async (phone, otp) => {
        const { vendor } = await api.vendor.verifyOtp(phone, otp);
        setVendor(vendor);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(vendor)); } catch {}
        return { success: true };
    };

    const register = async (data) => {
        const { vendor } = await api.vendor.register(data);
        setVendor(vendor);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(vendor)); } catch {}
        return { success: true };
    };

    const logout = () => {
        setVendor(null);
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
        api.vendor.logout();
    };

    // Get all SPs in vendor's city
    const getServiceProviders = async () => (await api.vendor.providers()).providers || [];

    // Approve / Reject / Block / Suspend SP
    const updateSPStatus = async (id, status) => { await api.vendor.updateProviderStatus(id, status); };

    // Get all bookings
    const getAllBookings = async () => (await api.vendor.bookings()).bookings || [];

    // Assign SP to a booking
    const assignSPToBooking = async (bookingId, spId) => { await api.vendor.assignBooking(bookingId, spId); };

    // Get SOS alerts
    const getSOSAlerts = async () => (await api.vendor.sos()).alerts || [];

    // Resolve SOS
    const resolveSOSAlert = async (alertId) => { await api.vendor.resolveSos(alertId); };

    return (
        <VenderAuthContext.Provider value={{
            vendor,
            hydrated,
            isLoggedIn,
            isApproved,
            login,
            requestOtp,
            verifyOtp,
            register,
            logout,
            getServiceProviders,
            updateSPStatus,
            getAllBookings,
            assignSPToBooking,
            getSOSAlerts,
            resolveSOSAlert,
        }}>
            {children}
        </VenderAuthContext.Provider>
    );
};
