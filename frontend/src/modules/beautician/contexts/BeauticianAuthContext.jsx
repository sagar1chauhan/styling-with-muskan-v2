import React, { createContext, useContext, useState, useEffect } from "react";

const BeauticianAuthContext = createContext(undefined);

export const useBeauticianAuth = () => {
    const context = useContext(BeauticianAuthContext);
    if (!context) throw new Error("useBeauticianAuth must be used within BeauticianAuthProvider");
    return context;
};

const STORAGE_KEY = "muskan-beautician";

export const BeauticianAuthProvider = ({ children }) => {
    const [beautician, setBeautician] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    });
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        if (beautician) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(beautician));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [beautician]);

    const isLoggedIn = !!beautician;
    const isApproved = beautician?.approvalStatus === "approved";
    const isPending = beautician?.approvalStatus === "pending";
    const isBlocked = beautician?.approvalStatus === "blocked";
    const isRegistered = beautician?.registrationComplete === true;

    const register = (data) => {
        const newBeautician = {
            id: `BEA${Date.now()}`,
            phone: data.phone,
            name: data.name,
            email: data.email || "",
            documents: {
                aadhaar: data.aadhaar || null,
                pan: data.pan || null,
                bankDetails: data.bankDetails || null,
                certification: data.certification || null,
            },
            approvalStatus: "pending", // pending | approved | blocked
            registrationComplete: true,
            isOnline: false,
            rating: 0,
            totalJobs: 0,
            experience: "New",
            responseRate: 100,
            cancellationCount: 0,
            rejectionStreak: 0,
            weeklyHours: [0, 0, 0, 0, 0, 0, 0],
            earnings: { today: 0, week: 0, month: 0, total: 0 },
            walletBalance: 0,
            createdAt: new Date().toISOString(),
        };
        setBeautician(newBeautician);
    };

    const login = (phone) => {
        // Check if beautician exists in storage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.phone === phone) {
                setBeautician(parsed);
                return { success: true, registered: true };
            }
        }
        // Mock: allow login with any phone, treat as new user
        setBeautician({ phone, registrationComplete: false, approvalStatus: null });
        return { success: true, registered: false };
    };

    const logout = () => {
        setBeautician(null);
    };

    const updateDocuments = (docs) => {
        setBeautician(prev => ({
            ...prev,
            documents: { ...prev.documents, ...docs },
        }));
    };

    const updateProfile = (data) => {
        setBeautician(prev => ({ ...prev, ...data }));
    };

    const toggleOnline = () => {
        setBeautician(prev => ({ ...prev, isOnline: !prev.isOnline }));
    };

    // Mock: Admin can approve (for demo, we auto-approve after registration)
    const mockApprove = () => {
        setBeautician(prev => ({ ...prev, approvalStatus: "approved" }));
    };

    return (
        <BeauticianAuthContext.Provider value={{
            beautician,
            isLoggedIn,
            isApproved,
            isPending,
            isBlocked,
            isRegistered,
            register,
            login,
            logout,
            updateDocuments,
            updateProfile,
            toggleOnline,
            mockApprove,
            isLoginModalOpen,
            setIsLoginModalOpen,
        }}>
            {children}
        </BeauticianAuthContext.Provider>
    );
};
