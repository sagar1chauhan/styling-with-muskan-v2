import React, { createContext, useContext, useState, useEffect } from "react";
import {
    SERVICE_TYPES as initialServiceTypes,
    BOOKING_TYPE_CONFIG as initialBookingTypeConfig,
    categories as initialCategories,
    services as initialServices,
    banners as initialBanners,
    mockProviders as initialProviders,
} from "../data/services";

const UserModuleDataContext = createContext(null);

export const UserModuleDataProvider = ({ children }) => {
    // Initialize state from localStorage or fallback to static data
    const [serviceTypes, setServiceTypes] = useState(() => {
        const saved = localStorage.getItem("swm_serviceTypes");
        return saved ? JSON.parse(saved) : initialServiceTypes;
    });

    const [bookingTypeConfig, setBookingTypeConfig] = useState(() => {
        const saved = localStorage.getItem("swm_bookingTypeConfig");
        return saved ? JSON.parse(saved) : initialBookingTypeConfig;
    });

    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem("swm_categories");
        return saved ? JSON.parse(saved) : initialCategories;
    });

    const [services, setServices] = useState(() => {
        const saved = localStorage.getItem("swm_services");
        return saved ? JSON.parse(saved) : initialServices;
    });

    const [banners, setBanners] = useState(() => {
        const saved = localStorage.getItem("swm_banners");
        return saved ? JSON.parse(saved) : initialBanners;
    });

    const [providers, setProviders] = useState(() => {
        const saved = localStorage.getItem("swm_providers");
        return saved ? JSON.parse(saved) : initialProviders;
    });

    // Save to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem("swm_serviceTypes", JSON.stringify(serviceTypes));
    }, [serviceTypes]);

    useEffect(() => {
        localStorage.setItem("swm_bookingTypeConfig", JSON.stringify(bookingTypeConfig));
    }, [bookingTypeConfig]);

    useEffect(() => {
        localStorage.setItem("swm_categories", JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem("swm_services", JSON.stringify(services));
    }, [services]);

    useEffect(() => {
        localStorage.setItem("swm_banners", JSON.stringify(banners));
    }, [banners]);

    useEffect(() => {
        localStorage.setItem("swm_providers", JSON.stringify(providers));
    }, [providers]);

    // CRUD operations
    const addCategory = (category) => setCategories(prev => [...prev, category]);
    const updateCategory = (id, updated) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));

    const addService = (service) => setServices(prev => [...prev, service]);
    const updateService = (id, updated) => setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    const deleteService = (id) => setServices(prev => prev.filter(s => s.id !== id));

    const addBanner = (gender, banner) => setBanners(prev => ({
        ...prev,
        [gender]: [...(prev[gender] || []), banner]
    }));
    const updateBanner = (gender, id, updated) => setBanners(prev => ({
        ...prev,
        [gender]: prev[gender].map(b => b.id === id ? { ...b, ...updated } : b)
    }));
    const deleteBanner = (gender, id) => setBanners(prev => ({
        ...prev,
        [gender]: prev[gender].filter(b => b.id !== id)
    }));

    // For Service Types
    const addServiceType = (type) => setServiceTypes(prev => [...prev, type]);
    const updateServiceType = (id, updated) => setServiceTypes(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    const deleteServiceType = (id) => setServiceTypes(prev => prev.filter(t => t.id !== id));

    const value = {
        serviceTypes,
        bookingTypeConfig,
        categories,
        services,
        banners,
        providers,
        // Category actions
        addCategory,
        updateCategory,
        deleteCategory,
        // Service actions
        addService,
        updateService,
        deleteService,
        // Banner actions
        addBanner,
        updateBanner,
        deleteBanner,
        // Service Types actions
        addServiceType,
        updateServiceType,
        deleteServiceType,
    };

    return (
        <UserModuleDataContext.Provider value={value}>
            {children}
        </UserModuleDataContext.Provider>
    );
};

export const useUserModuleData = () => {
    const context = useContext(UserModuleDataContext);
    if (!context) {
        throw new Error("useUserModuleData must be used within a UserModuleDataProvider");
    }
    return context;
};
