import React, { createContext, useContext, useState, useEffect } from "react";

const ProviderAuthContext = createContext(undefined);

export const useProviderAuth = () => {
    const context = useContext(ProviderAuthContext);
    if (!context) throw new Error("useProviderAuth must be used within ProviderAuthProvider");
    return context;
};

const STORAGE_KEY = "muskan-provider";
const DB_KEY = "muskan-provider-db";

export const ProviderAuthProvider = ({ children }) => {
    const [provider, setProvider] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (provider) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(provider));

            // Save to mock DB
            if (provider.phone) {
                const db = JSON.parse(localStorage.getItem(DB_KEY) || "{}");
                db[provider.phone] = provider;
                localStorage.setItem(DB_KEY, JSON.stringify(db));
            }
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [provider]);

    const isLoggedIn = !!provider;
    const isApproved = provider?.approvalStatus === "approved";
    const isPending = provider?.approvalStatus === "pending";
    const isRejected = provider?.approvalStatus === "rejected";
    const isRegistered = provider?.registrationComplete === true;

    const register = (data) => {
        const newProvider = {
            id: `PRO${Date.now()}`,
            phone: data.phone || provider?.phone || "9999999999",
            name: data.name,
            email: data.email || "",
            gender: data.gender || "",
            dob: data.dob || "",
            experience: data.experience || "0-1",
            profilePhoto: data.profilePhoto || null,
            documents: {
                aadharFront: data.aadharFront || null,
                aadharBack: data.aadharBack || null,
                panCard: data.panCard || null,
                bankName: data.bankName || "",
                accountNumber: data.accountNumber || "",
                ifscCode: data.ifscCode || "",
                primaryCategory: data.primaryCategory || [],
                specializations: data.specializations || [],
            },
            approvalStatus: "pending", // pending | approved | rejected | blocked
            registrationComplete: true,
            isOnline: false,
            rating: 0,
            totalJobs: 0,
            credits: 100,
            createdAt: new Date().toISOString(),
        };
        setProvider(newProvider);
    };

    const login = (phone) => {
        // Check if provider exists in mock DB
        const db = JSON.parse(localStorage.getItem(DB_KEY) || "{}");
        const existingProvider = db[phone];

        if (existingProvider) {
            setProvider(existingProvider);
            return { success: true, registered: existingProvider.registrationComplete };
        }

        // Mock: treat as new user
        const newProvider = { phone, registrationComplete: false, approvalStatus: null };
        setProvider(newProvider);
        return { success: true, registered: false };
    };

    const logout = () => {
        setProvider(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const adminApprove = () => {
        setProvider(prev => ({ ...prev, approvalStatus: "approved" }));
    };

    const adminReject = () => {
        setProvider(prev => ({ ...prev, approvalStatus: "rejected" }));
    };

    return (
        <ProviderAuthContext.Provider value={{
            provider,
            isLoggedIn,
            isApproved,
            isPending,
            isRejected,
            isRegistered,
            register,
            login,
            logout,
            adminApprove,
            adminReject,
        }}>
            {children}
        </ProviderAuthContext.Provider>
    );
};
