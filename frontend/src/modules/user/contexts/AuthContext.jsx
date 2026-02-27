import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [hasAddress, setHasAddress] = useState(false); // New address state

    useEffect(() => {
        // Check for existing login session
        const savedUser = localStorage.getItem('smd_user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setIsLoggedIn(true);
            // Mock: check if user has address
            if (parsedUser.address) setHasAddress(true);
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        const user = {
            ...userData,
            id: userData.id || `U${Date.now()}`,
            isVerified: userData.isVerified || false,
            referralCode: userData.referralCode || "",
            address: userData.address || null
        };
        setIsLoggedIn(true);
        setUser(user);
        localStorage.setItem('smd_user', JSON.stringify(user));
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
        setHasAddress(false);
        localStorage.removeItem('smd_user');
    };

    const updateAddress = (address) => {
        const updatedUser = { ...user, address };
        setUser(updatedUser);
        setHasAddress(true);
        localStorage.setItem('smd_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            user,
            login,
            logout,
            loading,
            isLoginModalOpen,
            setIsLoginModalOpen,
            isAddressModalOpen,
            setIsAddressModalOpen,
            hasAddress,
            setHasAddress,
            updateAddress
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
