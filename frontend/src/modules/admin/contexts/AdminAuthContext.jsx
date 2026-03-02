import React, { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext(undefined);

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
    return context;
};

const ADMIN_KEY = "muskan-admin";
const VENDORS_DB_KEY = "muskan-vendors";
const SP_DB_KEY = "muskan-provider-db";
const SP_BOOKINGS_KEY = "muskan-provider-bookings";
const USER_BOOKINGS_KEY = "muskan-bookings";
const COUPONS_KEY = "muskan-admin-coupons";
const BANNERS_KEY = "muskan-admin-banners";
const REFERRAL_KEY = "muskan-admin-referral";
const SOS_KEY = "muskan-sos-alerts";

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(() => {
        const saved = localStorage.getItem(ADMIN_KEY);
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
        else localStorage.removeItem(ADMIN_KEY);
    }, [admin]);

    const isLoggedIn = !!admin;

    const login = (email, password) => {
        // Demo: any email/password works, or match a stored admin
        if (email && password) {
            setAdmin({ id: "ADMIN001", name: "Super Admin", email, role: "superadmin", createdAt: new Date().toISOString() });
            return { success: true };
        }
        return { success: false, error: "Invalid credentials" };
    };

    const logout = () => { setAdmin(null); localStorage.removeItem(ADMIN_KEY); };

    // ───── VENDORS ─────
    const getAllVendors = () => Object.values(JSON.parse(localStorage.getItem(VENDORS_DB_KEY) || "{}"));
    const updateVendorStatus = (vendorId, status) => {
        const db = JSON.parse(localStorage.getItem(VENDORS_DB_KEY) || "{}");
        if (db[vendorId]) { db[vendorId].status = status; localStorage.setItem(VENDORS_DB_KEY, JSON.stringify(db)); }
    };

    // ───── SERVICE PROVIDERS ─────
    const getAllServiceProviders = () => Object.values(JSON.parse(localStorage.getItem(SP_DB_KEY) || "{}")).filter(sp => sp.registrationComplete);
    const updateSPStatus = (phone, status) => {
        const db = JSON.parse(localStorage.getItem(SP_DB_KEY) || "{}");
        if (db[phone]) {
            db[phone].approvalStatus = status;
            localStorage.setItem(SP_DB_KEY, JSON.stringify(db));
            const active = localStorage.getItem("muskan-provider");
            if (active) { const p = JSON.parse(active); if (p.phone === phone) localStorage.setItem("muskan-provider", JSON.stringify({ ...p, approvalStatus: status })); }
        }
    };

    // ───── BOOKINGS ─────
    const getAllBookings = () => JSON.parse(localStorage.getItem(SP_BOOKINGS_KEY) || "[]");
    const getUserBookings = () => JSON.parse(localStorage.getItem(USER_BOOKINGS_KEY) || "[]");
    const assignSPToBooking = (bookingId, spId) => {
        const bookings = getAllBookings();
        const updated = bookings.map(b => b.id === bookingId ? { ...b, assignedProvider: spId, status: "accepted" } : b);
        localStorage.setItem(SP_BOOKINGS_KEY, JSON.stringify(updated));
    };

    // ───── COUPONS ─────
    const getCoupons = () => JSON.parse(localStorage.getItem(COUPONS_KEY) || "[]");
    const addCoupon = (coupon) => {
        const coupons = getCoupons();
        coupons.push({ ...coupon, id: `CPN${Date.now()}`, createdAt: new Date().toISOString() });
        localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
    };
    const deleteCoupon = (id) => {
        const coupons = getCoupons().filter(c => c.id !== id);
        localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
    };

    // ───── BANNERS ─────
    const getBanners = () => JSON.parse(localStorage.getItem(BANNERS_KEY) || "[]");
    const addBanner = (banner) => {
        const banners = getBanners();
        banners.push({ ...banner, id: `BNR${Date.now()}`, createdAt: new Date().toISOString() });
        localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
    };
    const deleteBanner = (id) => {
        const banners = getBanners().filter(b => b.id !== id);
        localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
    };

    // ───── REFERRAL ─────
    const getReferralSettings = () => JSON.parse(localStorage.getItem(REFERRAL_KEY) || '{"referrerBonus":100,"refereeBonus":50,"maxReferrals":10,"isActive":true}');
    const updateReferralSettings = (settings) => localStorage.setItem(REFERRAL_KEY, JSON.stringify(settings));

    // ───── SOS ─────
    const getSOSAlerts = () => JSON.parse(localStorage.getItem(SOS_KEY) || "[]");
    const resolveSOSAlert = (id) => {
        const alerts = getSOSAlerts().map(a => a.id === id ? { ...a, status: "resolved" } : a);
        localStorage.setItem(SOS_KEY, JSON.stringify(alerts));
    };

    // ───── COMMISSION ─────
    const getCommissionSettings = () => JSON.parse(localStorage.getItem("muskan-admin-commission") || '{"rate":15,"minPayout":500}');
    const updateCommissionSettings = (settings) => localStorage.setItem("muskan-admin-commission", JSON.stringify(settings));

    return (
        <AdminAuthContext.Provider value={{
            admin, isLoggedIn, login, logout,
            getAllVendors, updateVendorStatus,
            getAllServiceProviders, updateSPStatus,
            getAllBookings, getUserBookings, assignSPToBooking,
            getCoupons, addCoupon, deleteCoupon,
            getBanners, addBanner, deleteBanner,
            getReferralSettings, updateReferralSettings,
            getSOSAlerts, resolveSOSAlert,
            getCommissionSettings, updateCommissionSettings,
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
