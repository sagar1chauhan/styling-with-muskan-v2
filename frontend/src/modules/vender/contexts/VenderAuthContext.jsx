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
const SP_BOOKINGS_KEY = "muskan-bookings";
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
                assignedProvider: payload.maintainerProvider,
                maintainProvider: payload.maintainerProvider,
                teamMembers: payload.teamMembers, // Array of {id, name, serviceType}
                totalAmount: payload.price,
                status: "vendor_assigned" // Send to Admin for approval
            };

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
    const getSOSAlerts = () => {
        return JSON.parse(localStorage.getItem(SOS_KEY) || "[]");
    };

    // Resolve SOS
    const resolveSOSAlert = (alertId) => {
        const alerts = JSON.parse(localStorage.getItem(SOS_KEY) || "[]");
        const updated = alerts.map(a => a.id === alertId ? { ...a, status: "resolved" } : a);
        localStorage.setItem(SOS_KEY, JSON.stringify(updated));
    };

    // Update Payout Status for a Booking (SP payout)
    const updatePayoutStatus = (bookingId, status) => {
        const bookings = JSON.parse(localStorage.getItem(SP_BOOKINGS_KEY) || "[]");
        const updated = bookings.map(b => b.id === bookingId ? { ...b, payoutStatus: status } : b);
        localStorage.setItem(SP_BOOKINGS_KEY, JSON.stringify(updated));
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
            assignTeamToBooking,
            getSOSAlerts,
            resolveSOSAlert,
            updatePayoutStatus,
        }}>
            {children}
        </VenderAuthContext.Provider>
    );
};
