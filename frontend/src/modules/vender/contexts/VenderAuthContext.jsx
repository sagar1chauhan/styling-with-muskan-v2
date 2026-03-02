import React, { createContext, useContext, useState, useEffect } from "react";

const VenderAuthContext = createContext(undefined);

export const useVenderAuth = () => {
    const context = useContext(VenderAuthContext);
    if (!context) throw new Error("useVenderAuth must be used within VenderAuthProvider");
    return context;
};

const STORAGE_KEY = "muskan-vendor-auth";
const VENDORS_DB_KEY = "muskan-vendors";
const SP_DB_KEY = "muskan-provider-db";
const SP_BOOKINGS_KEY = "muskan-provider-bookings";
const SOS_KEY = "muskan-sos-alerts";

export const VenderAuthProvider = ({ children }) => {
    const [vendor, setVendor] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (vendor) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(vendor));
            // Sync to vendors DB
            const db = JSON.parse(localStorage.getItem(VENDORS_DB_KEY) || "{}");
            db[vendor.id] = vendor;
            localStorage.setItem(VENDORS_DB_KEY, JSON.stringify(db));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [vendor]);

    const isLoggedIn = !!vendor;
    const isApproved = vendor?.status === "approved";

    const login = (email, password) => {
        const db = JSON.parse(localStorage.getItem(VENDORS_DB_KEY) || "{}");
        const found = Object.values(db).find(v => v.email === email);
        if (found) {
            setVendor(found);
            return { success: true };
        }
        return { success: false, error: "Vendor not found" };
    };

    const register = (data) => {
        const newVendor = {
            id: `VEN${Date.now()}`,
            name: data.name,
            email: data.email,
            phone: data.phone,
            city: data.city,
            status: "approved", // auto-approved for demo
            businessName: data.businessName || "",
            createdAt: new Date().toISOString(),
        };
        setVendor(newVendor);
        return { success: true };
    };

    const logout = () => {
        setVendor(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    // Get all SPs in vendor's city
    const getServiceProviders = () => {
        const db = JSON.parse(localStorage.getItem(SP_DB_KEY) || "{}");
        return Object.values(db).filter(sp => sp.registrationComplete);
    };

    // Approve / Reject / Block / Suspend SP
    const updateSPStatus = (spPhone, status) => {
        const db = JSON.parse(localStorage.getItem(SP_DB_KEY) || "{}");
        if (db[spPhone]) {
            db[spPhone] = { ...db[spPhone], approvalStatus: status };
            localStorage.setItem(SP_DB_KEY, JSON.stringify(db));

            // Also update active provider session if applicable
            const activeProvider = localStorage.getItem("muskan-provider");
            if (activeProvider) {
                const parsed = JSON.parse(activeProvider);
                if (parsed.phone === spPhone) {
                    localStorage.setItem("muskan-provider", JSON.stringify({ ...parsed, approvalStatus: status }));
                }
            }
        }
    };

    // Get all bookings
    const getAllBookings = () => {
        const bookings = JSON.parse(localStorage.getItem(SP_BOOKINGS_KEY) || "[]");
        return bookings;
    };

    // Assign SP to a booking
    const assignSPToBooking = (bookingId, spId) => {
        const bookings = JSON.parse(localStorage.getItem(SP_BOOKINGS_KEY) || "[]");
        const updated = bookings.map(b =>
            b.id === bookingId ? { ...b, assignedProvider: spId, status: "accepted" } : b
        );
        localStorage.setItem(SP_BOOKINGS_KEY, JSON.stringify(updated));
    };

    // Get SOS alerts
    const getSOSAlerts = () => {
        return JSON.parse(localStorage.getItem(SOS_KEY) || "[]");
    };

    // Resolve SOS
    const resolveSOSAlert = (alertId) => {
        const alerts = JSON.parse(localStorage.getItem(SOS_KEY) || "[]");
        const updated = alerts.map(a => a.id === alertId ? { ...a, status: "resolved" } : a);
        localStorage.setItem(SOS_KEY, JSON.stringify(updated));
    };

    return (
        <VenderAuthContext.Provider value={{
            vendor,
            isLoggedIn,
            isApproved,
            login,
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
