import React, { createContext, useContext, useState } from "react";
import { api } from "@/modules/user/lib/api";

const AdminAuthContext = createContext(undefined);

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
    return context;
};

const ADMIN_KEY = null;

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);

    const isLoggedIn = !!admin;

    const login = async (email, password) => {
        try {
            const { admin } = await api.admin.login(email, password);
            setAdmin(admin);
            return { success: true };
        } catch (e) {
            const msg = e?.message || "Login failed";
            return { success: false, error: msg };
        }
    };

    const logout = () => { setAdmin(null); api.admin.logout(); };

    // ───── VENDORS ─────
    const getAllVendors = async () => (await api.admin.vendors()).vendors;
    const updateVendorStatus = async (vendorId, status) => { await api.admin.updateVendorStatus(vendorId, status); };

    // ───── SERVICE PROVIDERS ─────
    const getAllServiceProviders = async () => (await api.admin.providers()).providers;
    const updateSPStatus = async (id, status) => { await api.admin.updateProviderStatus(id, status); };

    // ───── BOOKINGS ─────
    const getAllBookings = async () => (await api.admin.bookings()).bookings;
    const getUserBookings = async () => (await api.admin.bookings()).bookings;
    const assignSPToBooking = async (bookingId, spId) => { await api.admin.assignBooking(bookingId, spId); };

    // ───── COUPONS ─────
    const getCoupons = async () => (await api.admin.coupons()).coupons;
    const addCoupon = async (coupon) => { await api.admin.addCoupon(coupon); };
    const deleteCoupon = async (id) => { await api.admin.deleteCoupon(id); };

    // ───── BANNERS ─────
    const getBanners = async () => {
        const res = await api.content.banners();
        const data = res?.data || { women: [], men: [] };
        const flat = [];
        for (const g of ["women", "men"]) {
            for (const b of data[g] || []) {
                flat.push({
                    id: b.id,
                    gender: g,
                    title: b.title,
                    imageUrl: b.image,
                    linkTo: b.cta || "",
                    priority: 1,
                    startDate: "",
                    endDate: "",
                });
            }
        }
        return flat;
    };
    const addBanner = async (banner) => {
        const payload = {
            id: Date.now(),
            gender: "women",
            title: banner.title,
            subtitle: "",
            gradient: "",
            image: banner.imageUrl || "",
            cta: banner.linkTo || "",
        };
        await api.admin.addBanner(payload);
    };
    const deleteBanner = async (id) => {
        // Try removing from both genders to be safe
        try { await api.admin.deleteBanner(id, "women"); } catch {}
        try { await api.admin.deleteBanner(id, "men"); } catch {}
    };

    // ───── REFERRAL ─────
    const getReferralSettings = async () => (await api.admin.getReferral()).settings;
    const updateReferralSettings = async (settings) => { await api.admin.updateReferral(settings); };

    // ───── SOS ─────
    const getSOSAlerts = async () => (await api.admin.sos()).alerts;
    const resolveSOSAlert = async (id) => { await api.admin.resolveSos(id); };

    // ───── COMMISSION ─────
    const getCommissionSettings = async () => (await api.admin.getCommission()).settings;
    const updateCommissionSettings = async (settings) => { await api.admin.updateCommission(settings); };

    // ───── METRICS ─────
    const getMetricsOverview = async () => (await api.admin.metricsOverview()).overview;
    const getRevenueByMonth = async () => (await api.admin.metricsRevenueByMonth()).series;
    const getBookingTrend = async () => (await api.admin.metricsBookingTrend()).series;

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
            getMetricsOverview, getRevenueByMonth, getBookingTrend,
        }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
