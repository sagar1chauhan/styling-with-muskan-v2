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
const SP_BOOKINGS_KEY = "muskan-bookings";
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

    // ───── ENQUIRIES ─────
    const getEnquiries = () => JSON.parse(localStorage.getItem("muskan-enquiries") || "[]");
    const updateEnquiry = (enqId, data) => {
        const enqs = JSON.parse(localStorage.getItem("muskan-enquiries") || "[]");
        const updated = enqs.map(e => e.id === enqId ? { ...e, ...data } : e);
        localStorage.setItem("muskan-enquiries", JSON.stringify(updated));
    };

    // ───── BOOKINGS ─────
    const getAllBookings = () => {
        const bookings = JSON.parse(localStorage.getItem(SP_BOOKINGS_KEY) || "[]");
        const enquiries = JSON.parse(localStorage.getItem("muskan-enquiries") || "[]");

        // Map enquiries to booking structure for unified management
        const mappedEnquiries = enquiries.map((enq, index) => ({
            ...enq,
            id: enq.id || `ENQ-TEMP-${index}`,
            customerName: enq.name || "Customer",
            bookingType: "customized",
            serviceType: enq.eventType || "Event Services",
            totalAmount: enq.totalAmount || 0,
            discountPrice: enq.discountPrice || 0,
            slot: {
                date: enq.date || "TBD",
                time: enq.timeSlot || "TBD"
            },
            items: [{ name: `${enq.eventType || "Event Enquiry"} (${enq.noOfPeople || "N/A"} people)` }],
            address: typeof enq.address === 'object' ? enq.address : { area: enq.address || "Enquiry (Contact via Phone)" },
            status: enq.status || "unassigned"
        }));

        // Merge without duplicates (real bookings take priority)
        const combined = [...bookings];
        const existingIds = new Set(bookings.map(b => b.id));

        mappedEnquiries.forEach(enq => {
            if (!existingIds.has(enq.id)) {
                combined.push(enq);
            }
        });

        console.log("Admin Context - Consolidated Bookings:", combined.length);
        return combined;
    };
    const getUserBookings = () => JSON.parse(localStorage.getItem(USER_BOOKINGS_KEY) || "[]");
    const assignSPToBooking = (bookingId, spId) => {
        const bookings = JSON.parse(localStorage.getItem(SP_BOOKINGS_KEY) || "[]");
        
        let responseTimeMins = 20;
        try {
            const configRaw = localStorage.getItem("swm_bookingTypeConfig");
            if (configRaw) {
                const config = JSON.parse(configRaw);
                const firstFound = config.find(c => c.providerResponseTime);
                if (firstFound) responseTimeMins = firstFound.providerResponseTime;
            }
        } catch(e) {}
        const expiresAt = new Date(Date.now() + responseTimeMins * 60 * 1000).toISOString();

        const updated = bookings.map(b => b.id === bookingId ? { ...b, assignedProvider: spId, status: "pending", expiresAt } : b);
        localStorage.setItem(SP_BOOKINGS_KEY, JSON.stringify(updated));
    };

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
            getEnquiries, updateEnquiry,
            getAllBookings, getUserBookings, assignSPToBooking, assignTeamToBooking,
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
