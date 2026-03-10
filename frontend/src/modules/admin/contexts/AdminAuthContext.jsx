import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/modules/user/lib/api";

const AdminAuthContext = createContext(undefined);

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
    return context;
};

const ADMIN_KEY = "swm_admin";

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);

    const isLoggedIn = !!admin;

    useEffect(() => {
        try {
            const raw = localStorage.getItem(ADMIN_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (saved && typeof saved === "object") setAdmin(saved);
            }
        } catch {}
    }, []);

    const login = async (email, password) => {
        try {
            const { admin } = await api.admin.login(email, password);
            setAdmin(admin);
            try { localStorage.setItem(ADMIN_KEY, JSON.stringify(admin)); } catch {}
            return { success: true };
        } catch (e) {
            const msg = e?.message || "Login failed";
            return { success: false, error: msg };
        }
    };

    const logout = () => {
        setAdmin(null);
        try { localStorage.removeItem(ADMIN_KEY); } catch {}
        api.admin.logout();
    };

    // ───── VENDORS ─────
    const getAllVendors = async () => (await api.admin.vendors()).vendors;
    const updateVendorStatus = async (vendorId, status) => { await api.admin.updateVendorStatus(vendorId, status); };

    // ───── SERVICE PROVIDERS ─────
    const getAllServiceProviders = async () => (await api.admin.providers()).providers;
    const updateSPStatus = async (id, status) => { await api.admin.updateProviderStatus(id, status); };

    // ───── ENQUIRIES (server) ─────
    const getEnquiries = async () => (await api.admin.customEnquiries()).enquiries;
    const priceQuoteEnquiry = async (id, payload) => { await api.admin.customEnquiryPriceQuote(id, payload); };
    const finalApproveEnquiry = async (id) => { await api.admin.customEnquiryFinalApprove(id); };

    // ───── BOOKINGS ─────
    const getAllBookings = async () => (await api.admin.bookings()).bookings;
    const getUserBookings = async () => (await api.admin.bookings()).bookings;
    const assignSPToBooking = async (bookingId, spId) => { await api.admin.assignBooking(bookingId, spId); };

    const assignTeamToBooking = (bookingId, payload) => {
        // This handles customized bookings through various stages
        const allBookings = getAllBookings();
        const updated = allBookings.map(b => {
            if (b.id === bookingId) {
                const updatedBooking = {
                    ...b,
                    totalAmount: payload.price,
                    discountPrice: payload.discountPrice || 0,
                    status: payload.status // vendor_assigned, admin_approved, team_assigned, final_approved
                };
                // Only set team fields if provided
                if (payload.maintainerProvider) {
                    updatedBooking.assignedProvider = payload.maintainerProvider;
                    updatedBooking.maintainProvider = payload.maintainerProvider;
                }
                if (payload.teamMembers && payload.teamMembers.length > 0) {
                    updatedBooking.teamMembers = payload.teamMembers;
                }
                return updatedBooking;
            }
            return b;
        });

        // If it's a new booking (from enquiry), we must ensure it's in SP_BOOKINGS_KEY
        const actualBookings = JSON.parse(localStorage.getItem(SP_BOOKINGS_KEY) || "[]");
        const alreadyExists = actualBookings.some(b => b.id === bookingId);

        if (!alreadyExists) {
            const newBooking = updated.find(b => b.id === bookingId);
            actualBookings.push(newBooking);
            localStorage.setItem(SP_BOOKINGS_KEY, JSON.stringify(actualBookings));
        } else {
            const syncBookings = actualBookings.map(b => b.id === bookingId ? updated.find(u => u.id === bookingId) : b);
            localStorage.setItem(SP_BOOKINGS_KEY, JSON.stringify(syncBookings));
        }
    };

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
            getEnquiries, priceQuoteEnquiry, finalApproveEnquiry,
            getAllBookings, getUserBookings, assignSPToBooking, assignTeamToBooking,
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
