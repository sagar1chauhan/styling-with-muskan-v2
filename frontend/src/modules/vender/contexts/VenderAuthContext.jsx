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
            subscription: {
                name: "SWM City Manager Enterprise",
                status: "active",
                isTrial: true,
                expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
                fee: 4999
            }
        };
        setVendor(newVendor);
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
    // Get all bookings including customized enquiries
    const getAllBookings = () => {
        const bookings = JSON.parse(localStorage.getItem(SP_BOOKINGS_KEY) || "[]");
        const enquiries = JSON.parse(localStorage.getItem("muskan-enquiries") || "[]");

        // Map enquiries to booking-like structure
        const mappedEnquiries = enquiries.map((enq, index) => ({
            ...enq,
            id: enq.id || `ENQ-TEMP-${index}`, // Fallback ID if missing
            customerName: enq.name || "Customer",
            bookingType: "customized",
            serviceType: enq.eventType || "Event Services",
            slot: { date: enq.date || "TBD", time: enq.timeSlot || "TBD" },
            items: enq.selectedServices?.length > 0 
                ? enq.selectedServices.map(s => ({ name: `${s.name} (x${s.quantity})`, category: s.categoryName }))
                : [{ name: `${enq.eventType || "Event Enquiry"}` }],
            address: typeof enq.address === 'object' ? enq.address : { area: enq.address || "Enquiry Area" },
            status: enq.status || "unassigned"
        }));

        // Merge and avoid duplicates by ID
        const combined = [...bookings];
        const existingIds = new Set(bookings.map(b => b.id));

        mappedEnquiries.forEach(enq => {
            if (!existingIds.has(enq.id)) {
                combined.push(enq);
            }
        });

        console.log("Vender Context - Total Bookings:", combined.length, "Enquiries found:", enquiries.length);
        return combined;
    };

    // Assign SP to a booking
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

        const updated = bookings.map(b =>
            b.id === bookingId ? { ...b, assignedProvider: spId, status: "pending", expiresAt } : b
        );
        localStorage.setItem(SP_BOOKINGS_KEY, JSON.stringify(updated));
    };

    const assignTeamToBooking = (bookingId, payload) => {
        const bookings = JSON.parse(localStorage.getItem(SP_BOOKINGS_KEY) || "[]");
        const enquiries = JSON.parse(localStorage.getItem("muskan-enquiries") || "[]");

        // Find existing or create from enquiry
        let target = bookings.find(b => b.id === bookingId);
        if (!target) {
            const enq = enquiries.find(e => e.id === bookingId);
            if (enq) {
                target = {
                    ...enq,
                    customerName: enq.name,
                    bookingType: "customized",
                    serviceType: enq.eventType,
                    slot: { date: enq.date, time: enq.timeSlot },
                    items: [{ name: `${enq.eventType}` }],
                    address: { area: enq.address?.area || "Enquiry Area" }
                };
            }
        }

        if (target) {
            const updatedBooking = {
                ...target,
                totalAmount: payload.price,
                discountPrice: payload.discountPrice || 0,
                status: payload.status // vendor_assigned, team_assigned, etc.
            };

            // Only set team fields if provided (Step 5: team assignment)
            if (payload.maintainerProvider) {
                updatedBooking.assignedProvider = payload.maintainerProvider;
                updatedBooking.maintainProvider = payload.maintainerProvider;
            }
            if (payload.teamMembers && payload.teamMembers.length > 0) {
                updatedBooking.teamMembers = payload.teamMembers;
            }

            const existingIndex = bookings.findIndex(b => b.id === bookingId);
            if (existingIndex > -1) {
                bookings[existingIndex] = updatedBooking;
            } else {
                bookings.push(updatedBooking);
            }
            localStorage.setItem(SP_BOOKINGS_KEY, JSON.stringify(bookings));
        }
    };

    // Get SOS alerts
    const getSOSAlerts = async () => (await api.vendor.sos()).alerts || [];

    // Resolve SOS
    const resolveSOSAlert = async (alertId) => { await api.vendor.resolveSos(alertId); };

    // Update Payout Status for a Booking (SP payout)
    const updatePayoutStatus = (bookingId, status) => {
        const bookings = JSON.parse(localStorage.getItem(SP_BOOKINGS_KEY) || "[]");
        const updated = bookings.map(b => b.id === bookingId ? { ...b, payoutStatus: status } : b);
        localStorage.setItem(SP_BOOKINGS_KEY, JSON.stringify(updated));
    };

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
            assignTeamToBooking,
            getSOSAlerts,
            resolveSOSAlert,
            updatePayoutStatus,
        }}>
            {children}
        </VenderAuthContext.Provider>
    );
};
